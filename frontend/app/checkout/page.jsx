"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";

/* ── helpers ── */
function fmt(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function getItemSubtotal(item) {
  if (item.subtotal !== undefined && item.subtotal !== null) return Number(item.subtotal);
  return Number(item.product?.price || item.price || 0) * Number(item.qty || 1);
}

/* ── kecil-keciil ── */
function SectionCard({ title, children }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #EBEBEB",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      marginBottom: 16,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid #F3F4F6",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>{title}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function InputField({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1.5px solid #E5E7EB",
        background: "#FAFAF8",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

/* ── page ── */
export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressMode, setAddressMode] = useState("saved"); // "saved" | "manual"
  const [manualAddress, setManualAddress] = useState({ name: "", phone: "", detail: "", city: "", province: "", zip: "" });

  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");

  const isLoggedIn = Boolean(authService.getToken());

  /* load cart & saved addresses */
  useEffect(() => {
    if (!isLoggedIn) {
      setLoadingCart(false);
      return;
    }

    async function load() {
      setLoadingCart(true);
      setError("");
      try {
        const [items, addressList] = await Promise.allSettled([
          cartService.getCart(),
          checkoutService.getAddresses(),
        ]);

        const cartData = items.status === "fulfilled" ? (Array.isArray(items.value) ? items.value : []) : [];
        setCartItems(cartData);

        if (addressList.status === "fulfilled" && Array.isArray(addressList.value) && addressList.value.length > 0) {
          setSavedAddresses(addressList.value);
          const firstId = addressList.value[0]?.address_id ?? addressList.value[0]?.id ?? "";
          setSelectedAddressId(String(firstId));
          setAddressMode("saved");
        } else {
          setSavedAddresses([]);
          setAddressMode("manual");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat data checkout.");
      } finally {
        setLoadingCart(false);
      }
    }

    load();
  }, [isLoggedIn]);

  /* computed */
  const subtotal = cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  const shipping = 15000;
  const total = subtotal + shipping;

  /* validate manual address */
  function validateManual() {
    if (!manualAddress.name.trim()) return "Nama penerima wajib diisi.";
    if (!manualAddress.detail.trim()) return "Alamat lengkap wajib diisi.";
    if (!manualAddress.city.trim()) return "Kota wajib diisi.";
    return null;
  }

  /* place order */
  const handlePlaceOrder = async () => {
<<<<<<< HEAD
=======
    // Validate address — skip if a saved address is selected
    if (!selectedAddressId) {
      if (!address.detail.trim() || !address.city.trim() || !address.name.trim()) {
        setAddressError("Lengkapi alamat pengiriman (nama, detail, dan kota).");
        return;
      }
    }
>>>>>>> 5fc73df7a67ee9abae6915ec34ba9f36b63685d6
    setAddressError("");
    setError("");

    // Validasi alamat
    if (addressMode === "manual") {
      const err = validateManual();
      if (err) { setAddressError(err); return; }
    } else if (!selectedAddressId) {
      setAddressError("Pilih alamat pengiriman.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Keranjang kosong, tidak bisa checkout.");
      return;
    }

    const cartId = cartItems[0]?.cart_id || cartItems[0]?.cartId;
    if (!cartId) {
      setError("Cart ID tidak ditemukan. Coba refresh halaman.");
      return;
    }

    setSubmitting(true);
    try {
<<<<<<< HEAD
      const result = await checkoutService.createOrder({
        cart_id: Number(cartId),
=======
      const token = authService.getToken();
      // Get cart_id from the count endpoint
      const countRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/count`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!countRes.ok) {
        const errData = await countRes.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mendapatkan informasi cart");
      }

      const countData = await countRes.json();
      const cartId = countData?.data?.cart_id;

      if (!cartId) {
        if (cartItems.length === 0) {
          throw new Error("Keranjang kosong");
        }
        throw new Error("Cart ID tidak ditemukan. Data cart mungkin tidak lengkap.");
      }

      if (!cartId) {
        if (cartItems.length === 0) {
          throw new Error("Keranjang kosong");
        }
        throw new Error("Cart ID tidak ditemukan. Data cart mungkin tidak lengkap.");
      }

      const checkoutData = await checkoutService.createOrder({
        cart_id: cartId,
>>>>>>> 5fc73df7a67ee9abae6915ec34ba9f36b63685d6
        address_id: Number(selectedAddressId || 1),
        payment_method: "ewallet",
      });

      const orderId = result?.order_id ?? result?.id;
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

  /* ── not logged in ── */
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 460, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>🔐</p>
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

  /* ── main ── */
  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "'DM Sans','Inter',sans-serif" }}>

      <Navbar />

      {/* breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/cart" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Keranjang</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ fontSize: 13, color: "#1A3C34", fontWeight: 600 }}>Checkout</span>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 64px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", marginBottom: 24 }}>Checkout</h1>

        {/* error banner */}
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

          {/* ── LEFT ── */}
          <div>

            {/* 1. Alamat Pengiriman */}
            <SectionCard title="📍 Alamat Pengiriman">
              {savedAddresses.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <button
                    onClick={() => setAddressMode("saved")}
                    style={{
                      padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      fontFamily: "inherit", cursor: "pointer", border: "none",
                      background: addressMode === "saved" ? "#1A3C34" : "#F3F4F6",
                      color: addressMode === "saved" ? "#fff" : "#6B7280",
                    }}
                  >
                    Alamat Tersimpan
                  </button>
                  <button
                    onClick={() => setAddressMode("manual")}
                    style={{
                      padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      fontFamily: "inherit", cursor: "pointer", border: "none",
                      background: addressMode === "manual" ? "#1A3C34" : "#F3F4F6",
                      color: addressMode === "manual" ? "#fff" : "#6B7280",
                    }}
                  >
                    Alamat Baru
                  </button>
                </div>
              )}

              {addressMode === "saved" && savedAddresses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {savedAddresses.map((item) => {
                    const addrId = String(item.address_id ?? item.id);
                    const isSelected = selectedAddressId === addrId;
                    return (
                      <div
                        key={addrId}
                        onClick={() => setSelectedAddressId(addrId)}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 12,
                          border: isSelected ? "2px solid #1A3C34" : "1.5px solid #E5E7EB",
                          background: isSelected ? "#F0FBF8" : "#FAFAF8",
                          cursor: "pointer",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: "50%",
                            border: isSelected ? "5px solid #1A3C34" : "2px solid #D1D5DB",
                            flexShrink: 0, transition: "border 0.15s",
                          }} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0A0A0A" }}>
                              {item.address}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>
                              {item.city}{item.province ? `, ${item.province}` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Link href="/profile/addresses" style={{ fontSize: 12, color: "#1A3C34", fontWeight: 600, marginTop: 4, textDecoration: "none" }}>
                    + Kelola Alamat
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <InputField
                    placeholder="Nama penerima *"
                    value={manualAddress.name}
                    onChange={e => setManualAddress(a => ({ ...a, name: e.target.value }))}
                  />
                  <InputField
                    placeholder="No. telepon"
                    value={manualAddress.phone}
                    onChange={e => setManualAddress(a => ({ ...a, phone: e.target.value }))}
                  />
                  <textarea
                    placeholder="Alamat lengkap (jalan, RT/RW, kelurahan) *"
                    value={manualAddress.detail}
                    onChange={e => setManualAddress(a => ({ ...a, detail: e.target.value }))}
                    rows={2}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", background: "#FAFAF8", fontSize: 13,
                      fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <InputField placeholder="Kota *" value={manualAddress.city} onChange={e => setManualAddress(a => ({ ...a, city: e.target.value }))} />
                    <InputField placeholder="Provinsi" value={manualAddress.province} onChange={e => setManualAddress(a => ({ ...a, province: e.target.value }))} />
                    <div style={{ width: 100, flexShrink: 0 }}>
                      <InputField placeholder="Kode pos" value={manualAddress.zip} onChange={e => setManualAddress(a => ({ ...a, zip: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* 2. Produk yang Dipesan */}
            <SectionCard title="🛍 Produk yang Dipesan">
              {loadingCart ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0" }}>
                      <div style={{ width: 64, height: 64, background: "#F3F4F6", borderRadius: 10 }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                        <div style={{ height: 12, width: "60%", background: "#F3F4F6", borderRadius: 4 }} />
                        <div style={{ height: 12, width: "40%", background: "#F3F4F6", borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: 36, margin: "0 0 8px" }}>🛒</p>
                  <p style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 12 }}>Keranjang kosong.</p>
                  <Link href="/products" style={{ fontSize: 13, fontWeight: 600, color: "#1A3C34", textDecoration: "none" }}>
                    Lihat Produk
                  </Link>
                </div>
              ) : (
                <div>
                  {cartItems.map((item, i) => (
                    <div key={item.id ?? i} style={{
                      display: "flex", gap: 14, padding: "12px 0",
                      borderBottom: i < cartItems.length - 1 ? "1px solid #F3F4F6" : "none",
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 10,
                        background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 26, flexShrink: 0,
                      }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                          {item.product?.store?.store_name || item.store_name || "Toko"}
                        </p>
                        <p style={{ margin: "2px 0 4px", fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>
                          {item.product?.name || item.name || "Produk"}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>x{item.qty || 1}</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34" }}>
                            {fmt(getItemSubtotal(item))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 3. Metode Pembayaran */}
            <SectionCard title="💳 Metode Pembayaran">
              <div style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #1A3C34", background: "#F0FBF8",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 22 }}>💳</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>E-Wallet</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>Saldo PABW Shop</p>
                </div>
              </div>
            </SectionCard>

          </div>

          {/* ── RIGHT: Ringkasan ── */}
          <div style={{ position: "sticky", top: 72 }}>
            <div style={{
              background: "#fff", borderRadius: 16,
              border: "1px solid #EBEBEB",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Ringkasan Pesanan</span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>Subtotal ({cartItems.length} item)</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>Ongkos Kirim</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(shipping)}</span>
                  </div>
                </div>

                <div style={{ height: 1, background: "#F3F4F6", marginBottom: 14 }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>{fmt(total)}</span>
                </div>

                <Button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loadingCart || cartItems.length === 0}
                  loading={submitting}
                  className="w-full"
                >
                  {submitting ? "Memproses..." : "Buat Pesanan"}
                </Button>

                <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 11, color: "#9CA3AF", lineHeight: 1.6 }}>
                  Dengan menekan tombol di atas, kamu menyetujui<br />
                  <span style={{ color: "#1A3C34", fontWeight: 500 }}>Syarat & Ketentuan</span> PABW Shop.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
