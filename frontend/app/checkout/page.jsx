"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

// ── Static mock data ──────────────────────────────────────────────
const ADDRESSES = [
  {
    id: "addr-1",
    label: "Rumah",
    name: "Budi Santoso",
    phone: "0812-3456-7890",
    detail: "Jl. Merpati No. 12, RT 03/RW 05",
    city: "Kota Bandung",
    province: "Jawa Barat",
    zip: "40132",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Kantor",
    name: "Budi Santoso",
    phone: "0812-3456-7890",
    detail: "Jl. Asia Afrika No. 55, Lantai 3",
    city: "Kota Bandung",
    province: "Jawa Barat",
    zip: "40111",
    isDefault: false,
  },
];

const CART_ITEMS = [
  {
    id: "item-1",
    name: "Sepatu Sneaker Urban X1",
    variant: "Hitam / 42",
    qty: 1,
    price: 249000,
    imageEmoji: "👟",
    store: "Urban Kicks Store",
  },
  {
    id: "item-2",
    name: "Tas Kulit Premium Casual",
    variant: "Coklat Tua",
    qty: 2,
    price: 389000,
    imageEmoji: "👜",
    store: "Leather House ID",
  },
];

const SHIPPING_OPTIONS = [
  { id: "reg", label: "Regular", eta: "3-5 hari", price: 15000 },
  { id: "exp", label: "Express", eta: "1-2 hari", price: 30000 },
  { id: "same", label: "Same Day", eta: "Hari ini", price: 55000 },
];

const PAYMENT_METHODS = [
  { id: "transfer", label: "Transfer Bank", icon: "🏦" },
  { id: "ewallet", label: "E-Wallet (GoPay / OVO)", icon: "📱" },
  { id: "cod", label: "Bayar di Tempat (COD)", icon: "💵" },
  { id: "cc", label: "Kartu Kredit / Debit", icon: "💳" },
];

function fmt(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ── Sub-components ────────────────────────────────────────────────
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
        padding: "16px 20px",
        borderBottom: "1px solid #F3F4F6",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>{title}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function AddressCard({ addr, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(addr.id)}
      style={{
        border: selected ? "2px solid #1A3C34" : "1.5px solid #E5E7EB",
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        marginBottom: 10,
        background: selected ? "#F0FAF8" : "#FAFAFA",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            border: selected ? "none" : "1.5px solid #D1D5DB",
            background: selected ? "#1A3C34" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}>
            {selected && (
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>{addr.label}</span>
              {addr.isDefault && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#1A3C34",
                  background: "#D1FAE5", borderRadius: 99, padding: "2px 7px",
                }}>Utama</span>
              )}
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#374151" }}>
              {addr.name} · {addr.phone}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              {addr.detail}, {addr.city}, {addr.province} {addr.zip}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 12, fontWeight: 600, color: "#1A3C34",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          Ubah
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddr, setSelectedAddr] = useState("addr-1");
  const [selectedShipping, setSelectedShipping] = useState("reg");
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === selectedShipping);
  const subtotal = CART_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = voucherApplied ? 25000 : 0;
  const shippingCost = shipping?.price ?? 0;
  const total = subtotal - discount + shippingCost;

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/orders");
    }, 1800);
  };

  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase() === "HEMAT25") setVoucherApplied(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }
        .hover-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .hover-btn { transition: all 0.15s; }
      `}</style>

      <Navbar />

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/cart" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Keranjang</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 13, color: "#1A3C34", fontWeight: 600 }}>Checkout</span>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", marginBottom: 24, letterSpacing: "-0.5px" }}>
          Checkout
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* 1. Alamat Pengiriman */}
            <SectionCard title="📍 Alamat Pengiriman">
              {ADDRESSES.map((addr) => (
                <AddressCard
                  key={addr.id}
                  addr={addr}
                  selected={selectedAddr === addr.id}
                  onSelect={setSelectedAddr}
                />
              ))}
              <button style={{
                width: "100%", padding: "10px", borderRadius: 10,
                border: "1.5px dashed #1A3C34", background: "none",
                color: "#1A3C34", fontWeight: 600, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                + Tambah Alamat Baru
              </button>
            </SectionCard>

            {/* 2. Detail Produk */}
            <SectionCard title="🛍 Produk yang Dipesan">
              {CART_ITEMS.map((item) => (
                <div key={item.id} style={{
                  display: "flex", gap: 14, padding: "12px 0",
                  borderBottom: "1px solid #F3F4F6",
                }}>
                  {/* Product image placeholder */}
                  <div style={{
                    width: 72, height: 72, borderRadius: 10,
                    background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, flexShrink: 0,
                  }}>
                    {item.imageEmoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>{item.store}</p>
                    <p style={{ margin: "2px 0 3px", fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Varian: {item.variant}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>x{item.qty}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34" }}>{fmt(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Note */}
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Catatan untuk Penjual (opsional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: tolong bungkus rapi ya..."
                  rows={2}
                  style={{
                    width: "100%", padding: "10px 12px",
                    borderRadius: 10, border: "1.5px solid #E5E7EB",
                    background: "#FAFAF8", fontSize: 13, color: "#374151",
                    fontFamily: "inherit", resize: "vertical",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            </SectionCard>

            {/* 3. Opsi Pengiriman */}
            <SectionCard title="🚚 Opsi Pengiriman">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SHIPPING_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedShipping(opt.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: selectedShipping === opt.id ? "2px solid #1A3C34" : "1.5px solid #E5E7EB",
                      background: selectedShipping === opt.id ? "#F0FAF8" : "#FAFAFA",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: selectedShipping === opt.id ? "none" : "1.5px solid #D1D5DB",
                        background: selectedShipping === opt.id ? "#1A3C34" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {selectedShipping === opt.id && (
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>{opt.label}</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 6 }}>Estimasi {opt.eta}</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34" }}>{fmt(opt.price)}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* 4. Metode Pembayaran */}
            <SectionCard title="💳 Metode Pembayaran">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: selectedPayment === pm.id ? "2px solid #1A3C34" : "1.5px solid #E5E7EB",
                      background: selectedPayment === pm.id ? "#F0FAF8" : "#FAFAFA",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: selectedPayment === pm.id ? "none" : "1.5px solid #D1D5DB",
                      background: selectedPayment === pm.id ? "#1A3C34" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {selectedPayment === pm.id && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 18 }}>{pm.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>{pm.label}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>

          {/* ── RIGHT COLUMN: Order Summary ── */}
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

                {/* Items summary */}
                {CART_ITEMS.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    marginBottom: 10, gap: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>
                      {item.name} <span style={{ color: "#9CA3AF" }}>x{item.qty}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", flexShrink: 0 }}>
                      {fmt(item.price * item.qty)}
                    </span>
                  </div>
                ))}

                <div style={{ height: 1, background: "#F3F4F6", margin: "12px 0" }} />

                {/* Voucher */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                    Kode Voucher
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      value={voucherCode}
                      onChange={(e) => { setVoucherCode(e.target.value); setVoucherApplied(false); }}
                      placeholder="Cth: HEMAT25"
                      style={{
                        flex: 1, padding: "8px 10px", borderRadius: 8,
                        border: "1.5px solid #E5E7EB", fontSize: 12,
                        fontFamily: "inherit", outline: "none",
                        background: "#FAFAF8",
                      }}
                    />
                    <button
                      onClick={handleApplyVoucher}
                      style={{
                        padding: "8px 14px", borderRadius: 8,
                        background: "#1A3C34", color: "#fff",
                        border: "none", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                      }}
                    >
                      Pakai
                    </button>
                  </div>
                  {voucherApplied && (
                    <p style={{ margin: "5px 0 0", fontSize: 11, color: "#16A34A", fontWeight: 600 }}>
                      ✅ Voucher berhasil! Hemat {fmt(25000)}
                    </p>
                  )}
                  {!voucherApplied && voucherCode && (
                    <p style={{ margin: "5px 0 0", fontSize: 11, color: "#DC2626" }}>
                      Kode tidak valid. Coba HEMAT25 😊
                    </p>
                  )}
                </div>

                <div style={{ height: 1, background: "#F3F4F6", marginBottom: 12 }} />

                {/* Price breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Row label="Subtotal" value={fmt(subtotal)} />
                  <Row label={`Ongkir (${shipping?.label})`} value={fmt(shippingCost)} />
                  {voucherApplied && <Row label="Diskon Voucher" value={`-${fmt(discount)}`} valueColor="#16A34A" />}
                </div>

                <div style={{ height: 1, background: "#F3F4F6", margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>{fmt(total)}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="hover-btn"
                  style={{
                    width: "100%", marginTop: 18, height: 52, borderRadius: 14,
                    background: loading ? "#4DB6AC" : "#1A3C34",
                    color: "#fff", fontWeight: 700, fontSize: 16,
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Buat Pesanan
                    </>
                  )}
                </button>

                <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 11, color: "#9CA3AF", lineHeight: 1.6 }}>
                  Dengan menekan tombol di atas, kamu menyetujui<br/>
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

function Row({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? "#0A0A0A" }}>{value}</span>
    </div>
  );
}
