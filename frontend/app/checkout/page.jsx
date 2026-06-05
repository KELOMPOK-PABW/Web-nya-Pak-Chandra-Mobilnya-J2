"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { Button } from "@/components/ui/Button";

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function getItemSubtotal(item) {
  if (item.subtotal !== undefined && item.subtotal !== null) return Number(item.subtotal);
  return Number(item.product?.price || item.price || 0) * Number(item.qty || 1);
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 16, overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>{title}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState("");

  // Address form remains as a fallback when the addresses API is unavailable.
  const [address, setAddress] = useState({
    detail: "",
    city: "",
    province: "",
    zip: "",
    name: "",
    phone: "",
  });
  const [addressError, setAddressError] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = Boolean(authService.getToken());

  useEffect(() => {
    if (!isLoggedIn) {
      setLoadingCart(false);
      setError("Silakan login terlebih dahulu untuk checkout.");
      return;
    }

    async function loadCart() {
      setLoadingCart(true);
      setError("");
      try {
        const items = await cartService.getCart();
        setCartItems(Array.isArray(items) ? items : []);
        try {
          const addressList = await checkoutService.getAddresses();
          setAddresses(addressList);
          setSelectedAddressId(addressList[0]?.address_id ?? addressList[0]?.id ?? "");
        } catch {
          setAddresses([]);
          setSelectedAddressId("");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat cart");
        setCartItems([]);
      } finally {
        setLoadingCart(false);
      }
    }
    loadCart();
  }, [isLoggedIn]);

  const subtotal = cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  const shipping = 15000;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    // Validate address
    if (!address.detail.trim() || !address.city.trim() || !address.name.trim()) {
      setAddressError("Lengkapi alamat pengiriman (nama, detail, dan kota).");
      return;
    }
    setAddressError("");
    setSubmitting(true);
    setError("");

    try {
      if (cartItems.length === 0) {
        throw new Error("Keranjang kosong");
      }

      const cartId = cartItems[0]?.cart_id || cartItems[0]?.cartId;
      if (!cartId) {
        throw new Error("Cart ID tidak ditemukan. Data cart mungkin tidak lengkap.");
      }

      const checkoutData = await checkoutService.createOrder({
        cart_id: cartId,
        address_id: Number(selectedAddressId || 1),
        payment_method: "ewallet",
      });

      const orderId = checkoutData?.order_id ?? checkoutData?.id;

      if (orderId) {
        router.push(`/payment/${orderId}`);
      } else {
        router.push("/orders");
      }
    } catch (err) {
      setError(err.message || "Gagal melakukan checkout. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>Login Diperlukan</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Silakan login untuk melanjutkan checkout.</p>
          <Link href="/auth/login" style={{
            padding: "12px 28px", borderRadius: 12, background: "#1A3C34", color: "#fff",
            fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block",
          }}>
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Navbar />

      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/cart" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Keranjang</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ fontSize: 13, color: "#1A3C34", fontWeight: 600 }}>Checkout</span>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", marginBottom: 24 }}>
          Checkout
        </h1>

        {error && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 12,
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {addressError && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 12,
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13,
          }}>
            {addressError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* 1. Alamat Pengiriman */}
            <SectionCard title="📍 Alamat Pengiriman">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {addresses.length > 0 && (
                  <select
                    value={selectedAddressId}
                    onChange={(event) => setSelectedAddressId(event.target.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #1A3C34",
                      background: "#F0FBF8",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  >
                    {addresses.map((item) => (
                      <option key={item.address_id ?? item.id} value={item.address_id ?? item.id}>
                        {item.address}, {item.city}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  placeholder="Nama penerima"
                  value={address.name}
                  onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                  style={{
                    padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                    background: "#FAFAF8", fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
                <input
                  placeholder="No. telepon"
                  value={address.phone}
                  onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                  style={{
                    padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                    background: "#FAFAF8", fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
                <textarea
                  placeholder="Alamat lengkap (jalan, RT/RW, kelurahan)"
                  value={address.detail}
                  onChange={e => setAddress(a => ({ ...a, detail: e.target.value }))}
                  rows={2}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", background: "#FAFAF8", fontSize: 13,
                    fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder="Kota"
                    value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                      background: "#FAFAF8", fontSize: 13, fontFamily: "inherit", outline: "none",
                    }}
                  />
                  <input
                    placeholder="Provinsi"
                    value={address.province}
                    onChange={e => setAddress(a => ({ ...a, province: e.target.value }))}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                      background: "#FAFAF8", fontSize: 13, fontFamily: "inherit", outline: "none",
                    }}
                  />
                  <input
                    placeholder="Kode pos"
                    value={address.zip}
                    onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))}
                    style={{
                      width: 100, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                      background: "#FAFAF8", fontSize: 13, fontFamily: "inherit", outline: "none",
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* 2. Produk yang Dipesan */}
            <SectionCard title="🛍 Produk yang Dipesan">
              {loadingCart ? (
                <p style={{ color: "#9CA3AF", fontSize: 13 }}>Memuat produk...</p>
              ) : cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ color: "#9CA3AF", fontSize: 13 }}>Tidak ada produk di keranjang.</p>
                  <Link href="/products" style={{ fontSize: 13, fontWeight: 600, color: "#1A3C34" }}>
                    Lihat produk
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", gap: 14, padding: "12px 0",
                    borderBottom: "1px solid #F3F4F6",
                  }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 10,
                      background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 30, flexShrink: 0,
                    }}>
                      📦
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                        {item.product?.store?.store_name || item.store_name || "Toko"}
                      </p>
                      <p style={{ margin: "2px 0 3px", fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>
                        {item.product?.name || item.name}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "#6B7280" }}>x{item.qty}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34" }}>
                          {fmt(getItemSubtotal(item))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Catatan untuk Penjual (opsional)
                </label>
                <textarea
                  placeholder="Contoh: tolong bungkus rapi ya..."
                  rows={2}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", background: "#FAFAF8", fontSize: 13,
                    fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            </SectionCard>

            {/* 3. Metode Pembayaran */}
            <SectionCard title="💳 Metode Pembayaran">
              <div style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #1A3C34", background: "#F0FBF8",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>💳</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>E-Wallet</span>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
                Pembayaran dilakukan melalui E-Wallet internal.
              </p>
            </SectionCard>

          </div>

          {/* ── RIGHT COLUMN: Order Summary ── */}
          <div style={{ position: "sticky", top: 72 }}>
            <div style={{
              background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden",
            }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Ringkasan Pesanan</span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>Subtotal ({cartItems.length} item)</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>Ongkos Kirim</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(shipping)}</span>
                  </div>
                </div>

                <div style={{ height: 1, background: "#F3F4F6", margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>{fmt(total)}</span>
                </div>

                <Button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting || loadingCart || cartItems.length === 0}
                  loading={submitting}
                  className="w-full mt-4"
                >
                  {submitting ? "Memproses..." : "Buat Pesanan"}
                </Button>

                <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 11, color: "#9CA3AF", lineHeight: 1.6 }}>
                  Dengan menekan tombol di atas, kamu menyetujui<br />
                  <span style={{ color: "#1A3C34", fontWeight: 500, cursor: "pointer" }}>Syarat & Ketentuan</span> PABW Shop.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
