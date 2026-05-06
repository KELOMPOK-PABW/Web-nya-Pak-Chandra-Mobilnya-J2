"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

// ── Static mock data ──────────────────────────────────────────────
const ORDERS_MAP = {
  "ORD-20240501-001": {
    id: "ORD-20240501-001",
    date: "01 Mei 2024, 10:23",
    store: "Urban Kicks Store",
    status: "delivered",
    items: [
      { name: "Sepatu Sneaker Urban X1", variant: "Hitam / 42", qty: 1, price: 249000, emoji: "👟" },
    ],
    subtotal: 249000,
    shipping: 15000,
    discount: 0,
    total: 264000,
    shippingMethod: "JNE Regular · 3-5 hari kerja",
    trackingNo: "JNE-884231",
    paymentMethod: "Transfer Bank BCA",
    address: {
      name: "Budi Santoso",
      phone: "0812-3456-7890",
      detail: "Jl. Merpati No. 12, RT 03/RW 05, Kota Bandung, Jawa Barat 40132",
    },
    timeline: [
      { label: "Pesanan dibuat",         time: "01 Mei 2024, 10:23", done: true },
      { label: "Pembayaran dikonfirmasi", time: "01 Mei 2024, 10:45", done: true },
      { label: "Pesanan diproses toko",   time: "01 Mei 2024, 13:00", done: true },
      { label: "Paket dikirim",           time: "02 Mei 2024, 09:00", done: true },
      { label: "Paket diterima",          time: "04 Mei 2024, 14:30", done: true },
    ],
  },
  "ORD-20240502-002": {
    id: "ORD-20240502-002",
    date: "02 Mei 2024, 14:07",
    store: "Leather House ID",
    status: "shipped",
    items: [
      { name: "Tas Kulit Premium Casual", variant: "Coklat Tua", qty: 2, price: 389000, emoji: "👜" },
    ],
    subtotal: 778000,
    shipping: 30000,
    discount: 0,
    total: 808000,
    shippingMethod: "SiCepat Express · 1-2 hari",
    trackingNo: "SiCepat-229401",
    paymentMethod: "GoPay",
    address: {
      name: "Budi Santoso",
      phone: "0812-3456-7890",
      detail: "Jl. Merpati No. 12, RT 03/RW 05, Kota Bandung, Jawa Barat 40132",
    },
    timeline: [
      { label: "Pesanan dibuat",         time: "02 Mei 2024, 14:07", done: true },
      { label: "Pembayaran dikonfirmasi", time: "02 Mei 2024, 14:20", done: true },
      { label: "Pesanan diproses toko",   time: "02 Mei 2024, 16:00", done: true },
      { label: "Paket dikirim",           time: "03 Mei 2024, 08:30", done: true },
      { label: "Paket diterima",          time: "-",                  done: false },
    ],
  },
  "ORD-20240503-003": {
    id: "ORD-20240503-003",
    date: "03 Mei 2024, 09:15",
    store: "Gadget World",
    status: "processing",
    items: [
      { name: "Earphone TWS NoisePro X", variant: "Putih", qty: 1, price: 599000, emoji: "🎧" },
      { name: "Case Pelindung AirPods",  variant: "Transparan", qty: 1, price: 45000, emoji: "📦" },
    ],
    subtotal: 644000,
    shipping: 55000,
    discount: 40000,
    total: 659000,
    shippingMethod: "GoSend Same Day",
    trackingNo: "-",
    paymentMethod: "Kartu Kredit BRI",
    address: {
      name: "Budi Santoso",
      phone: "0812-3456-7890",
      detail: "Jl. Asia Afrika No. 55, Lantai 3, Kota Bandung, Jawa Barat 40111",
    },
    timeline: [
      { label: "Pesanan dibuat",         time: "03 Mei 2024, 09:15", done: true },
      { label: "Pembayaran dikonfirmasi", time: "03 Mei 2024, 09:30", done: true },
      { label: "Pesanan diproses toko",   time: "-",                  done: false },
      { label: "Paket dikirim",           time: "-",                  done: false },
      { label: "Paket diterima",          time: "-",                  done: false },
    ],
  },
};

const STATUS_CONFIG = {
  pending:    { label: "Menunggu Konfirmasi", color: "#F59E0B", bg: "#FEF3C7" },
  processing: { label: "Diproses",           color: "#3B82F6", bg: "#DBEAFE" },
  shipped:    { label: "Dikirim",            color: "#8B5CF6", bg: "#EDE9FE" },
  delivered:  { label: "Terkirim",           color: "#10B981", bg: "#D1FAE5" },
  cancelled:  { label: "Dibatalkan",         color: "#EF4444", bg: "#FEE2E2" },
};

function fmt(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#6B7280", bg: "#F3F4F6" };
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg,
      borderRadius: 99, padding: "4px 12px", display: "inline-block",
    }}>
      {cfg.label}
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1px solid #EBEBEB",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      marginBottom: 16, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>{title}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

// ── Timeline Component ─────────────────────────────────────────────
function Timeline({ steps }) {
  return (
    <div style={{ padding: "4px 0" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
          {/* Line */}
          {i < steps.length - 1 && (
            <div style={{
              position: "absolute", left: 9, top: 20,
              width: 2, height: "calc(100% - 4px)",
              background: step.done ? "#1A3C34" : "#E5E7EB",
            }} />
          )}
          {/* Dot */}
          <div style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            background: step.done ? "#1A3C34" : "#E5E7EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: 2,
          }}>
            {step.done && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div style={{ paddingBottom: 20 }}>
            <p style={{ margin: 0, fontWeight: step.done ? 600 : 500, fontSize: 13, color: step.done ? "#0A0A0A" : "#9CA3AF" }}>
              {step.label}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
              {step.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const order = ORDERS_MAP[orderId];

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>Pesanan Tidak Ditemukan</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
            ID pesanan <strong>{orderId}</strong> tidak ada dalam sistem.
          </p>
          <Link href="/orders" style={{
            padding: "12px 28px", borderRadius: 12,
            background: "#1A3C34", color: "#fff",
            fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "inherit",
          }}>
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const effectiveStatus = cancelled ? "cancelled" : confirmed ? "delivered" : order.status;
  const canCancel = (order.status === "pending" || order.status === "processing") && !cancelled && !confirmed;
  const canConfirm = order.status === "shipped" && !confirmed && !cancelled;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .copy-btn:hover { background: #F0FAF8 !important; }
      `}</style>

      <Navbar />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "32px 28px",
            maxWidth: 400, width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A0A0A", margin: "0 0 8px" }}>
              Batalkan Pesanan?
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.6 }}>
              Pesanan <strong>{order.id}</strong> akan dibatalkan.<br/>
              Refund akan diproses 3–5 hari kerja.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1, height: 44, borderRadius: 12,
                  border: "1.5px solid #E5E7EB", background: "#fff",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", color: "#374151",
                }}
              >
                Kembali
              </button>
              <button
                onClick={() => { setCancelled(true); setShowCancelModal(false); }}
                style={{
                  flex: 1, height: 44, borderRadius: 12,
                  border: "none", background: "#EF4444",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", color: "#fff",
                }}
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/orders" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Pesanan Saya</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 13, color: "#1A3C34", fontWeight: 600 }}>Detail Pesanan</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 48px" }}>
        {/* Header */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #EBEBEB",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          padding: "20px 22px", marginBottom: 16,
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.3px" }}>
                {order.id}
              </h1>
              <StatusBadge status={effectiveStatus} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#9CA3AF" }}>
              {order.store} · {order.date}
            </p>
          </div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                style={{
                  padding: "9px 18px", borderRadius: 10,
                  border: "1.5px solid #FECACA", background: "#FEF2F2",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                  color: "#EF4444", cursor: "pointer",
                }}
              >
                Batalkan Pesanan
              </button>
            )}
            {canConfirm && (
              <button
                onClick={() => setConfirmed(true)}
                style={{
                  padding: "9px 18px", borderRadius: 10,
                  border: "none", background: "#1A3C34",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                  color: "#fff", cursor: "pointer",
                }}
              >
                ✅ Konfirmasi Terima
              </button>
            )}
            {confirmed && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: "#10B981",
                background: "#D1FAE5", borderRadius: 99, padding: "8px 14px",
              }}>
                Sudah dikonfirmasi ✓
              </span>
            )}
            {cancelled && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: "#EF4444",
                background: "#FEE2E2", borderRadius: 99, padding: "8px 14px",
              }}>
                Pesanan dibatalkan
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
          {/* Left */}
          <div>
            {/* Items */}
            <SectionCard title="🛍 Item Pesanan">
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: "12px 0",
                  borderBottom: i < order.items.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: 10,
                    background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, flexShrink: 0,
                  }}>
                    {item.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>{item.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9CA3AF" }}>Varian: {item.variant}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>Jumlah: {item.qty}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>{fmt(item.price)} / pcs</p>
                    <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 15, color: "#1A3C34" }}>
                      {fmt(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Price breakdown */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <RowDetail label="Subtotal" value={fmt(order.subtotal)} />
                  <RowDetail label="Ongkos Kirim" value={fmt(order.shipping)} />
                  {order.discount > 0 && <RowDetail label="Diskon Voucher" value={`-${fmt(order.discount)}`} valueColor="#16A34A" />}
                </div>
                <div style={{
                  marginTop: 12, paddingTop: 12, borderTop: "1px solid #F3F4F6",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>{fmt(order.total)}</span>
                </div>
              </div>
            </SectionCard>

            {/* Timeline */}
            <SectionCard title="📋 Riwayat Pesanan">
              <Timeline steps={order.timeline} />
            </SectionCard>
          </div>

          {/* Right */}
          <div>
            {/* Delivery info */}
            <SectionCard title="📍 Info Pengiriman">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoRow icon="👤" label="Penerima" value={`${order.address.name} · ${order.address.phone}`} />
                <InfoRow icon="📌" label="Alamat" value={order.address.detail} />
                <InfoRow icon="🚚" label="Kurir" value={order.shippingMethod} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    No. Resi
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
                      {order.trackingNo}
                    </span>
                    {order.trackingNo !== "-" && (
                      <button
                        className="copy-btn"
                        onClick={() => navigator.clipboard?.writeText(order.trackingNo)}
                        style={{
                          padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                          border: "1.5px solid #E5E7EB", background: "#FAFAFA",
                          color: "#1A3C34", cursor: "pointer", fontFamily: "inherit",
                          transition: "background 0.15s",
                        }}
                      >
                        Salin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Payment info */}
            <SectionCard title="💳 Info Pembayaran">
              <InfoRow icon="💰" label="Metode" value={order.paymentMethod} />
              <div style={{ marginTop: 10 }}>
                <InfoRow icon="📅" label="Waktu Bayar" value={order.date} />
              </div>
            </SectionCard>

            {/* Back button */}
            <Link href="/orders" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%", padding: "12px",
              borderRadius: 12, border: "1.5px solid #E5E7EB",
              background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14,
              textDecoration: "none", fontFamily: "inherit",
              boxSizing: "border-box",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Kembali ke Daftar Pesanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RowDetail({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? "#0A0A0A" }}>{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <p style={{ margin: "0 0 3px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {icon} {label}
      </p>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#374151", lineHeight: 1.5 }}>
        {value}
      </p>
    </div>
  );
}
