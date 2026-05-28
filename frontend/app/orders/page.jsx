"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

// ── Static mock data ──────────────────────────────────────────────
const ORDERS = [
  {
    id: "ORD-20240501-001",
    date: "01 Mei 2024",
    store: "Urban Kicks Store",
    status: "delivered",
    items: [
      { name: "Sepatu Sneaker Urban X1", variant: "Hitam / 42", qty: 1, price: 249000, emoji: "👟" },
    ],
    total: 264000,
    shippingLabel: "Regular · 3-5 hari",
    trackingNo: "JNE-884231",
  },
  {
    id: "ORD-20240502-002",
    date: "02 Mei 2024",
    store: "Leather House ID",
    status: "shipped",
    items: [
      { name: "Tas Kulit Premium Casual", variant: "Coklat Tua", qty: 2, price: 389000, emoji: "👜" },
    ],
    total: 808000,
    shippingLabel: "Express · 1-2 hari",
    trackingNo: "SiCepat-229401",
  },
  {
    id: "ORD-20240503-003",
    date: "03 Mei 2024",
    store: "Gadget World",
    status: "processing",
    items: [
      { name: "Earphone TWS NoisePro X", variant: "Putih", qty: 1, price: 599000, emoji: "🎧" },
      { name: "Case Pelindung AirPods", variant: "Transparan", qty: 1, price: 45000, emoji: "📦" },
    ],
    total: 659000,
    shippingLabel: "Same Day",
    trackingNo: "-",
  },
  {
    id: "ORD-20240428-004",
    date: "28 Apr 2024",
    store: "Fashion Mode",
    status: "cancelled",
    items: [
      { name: "Kemeja Flannel Premium", variant: "Merah / L", qty: 1, price: 179000, emoji: "👕" },
    ],
    total: 194000,
    shippingLabel: "Regular · 3-5 hari",
    trackingNo: "-",
  },
  {
    id: "ORD-20240427-005",
    date: "27 Apr 2024",
    store: "Home Living",
    status: "pending",
    items: [
      { name: "Lampu LED Smart Bulb", variant: "Warm White", qty: 3, price: 65000, emoji: "💡" },
    ],
    total: 210000,
    shippingLabel: "Regular · 3-5 hari",
    trackingNo: "-",
  },
];

const STATUS_CONFIG = {
  pending:    { label: "Menunggu Konfirmasi", color: "#F59E0B", bg: "#FEF3C7" },
  processing: { label: "Diproses",           color: "#3B82F6", bg: "#DBEAFE" },
  shipped:    { label: "Dikirim",            color: "#8B5CF6", bg: "#EDE9FE" },
  delivered:  { label: "Terkirim",           color: "#10B981", bg: "#D1FAE5" },
  cancelled:  { label: "Dibatalkan",         color: "#EF4444", bg: "#FEE2E2" },
};

const TABS = [
  { id: "all",        label: "Semua" },
  { id: "pending",    label: "Menunggu" },
  { id: "processing", label: "Diproses" },
  { id: "shipped",    label: "Dikirim" },
  { id: "delivered",  label: "Selesai" },
  { id: "cancelled",  label: "Dibatalkan" },
];

function fmt(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#6B7280", bg: "#F3F4F6" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
      borderRadius: 99, padding: "3px 9px", display: "inline-block",
    }}>
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [confirmedIds, setConfirmedIds] = useState([]);
  const [cancelledIds, setCancelledIds] = useState([]);

  const filtered = ORDERS.filter((o) => {
    const effectiveStatus = cancelledIds.includes(o.id) ? "cancelled" : o.status;
    if (activeTab === "all") return true;
    return effectiveStatus === activeTab;
  });

  const getStatus = (o) => cancelledIds.includes(o.id) ? "cancelled" : o.status;
  const isConfirmed = (id) => confirmedIds.includes(id);

  const handleConfirm = (id) => {
    setConfirmedIds((prev) => [...prev, id]);
  };

  const handleCancel = (id) => {
    setCancelledIds((prev) => [...prev, id]);
    setCancelTarget(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .order-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .order-card { transition: all 0.18s; }
        .tab-btn { transition: all 0.15s; white-space: nowrap; }
      `}</style>

      <Navbar />

      {/* Cancel Confirm Modal */}
      {cancelTarget && (
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A0A0A", margin: "0 0 8px" }}>
              Batalkan Pesanan?
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.6 }}>
              Pesanan <strong>{cancelTarget}</strong> akan dibatalkan.<br/>
              Tindakan ini tidak bisa diurungkan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setCancelTarget(null)}
                style={{
                  flex: 1, height: 44, borderRadius: 12,
                  border: "1.5px solid #E5E7EB", background: "#fff",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", color: "#374151",
                }}
              >
                Tidak, Kembali
              </button>
              <button
                onClick={() => handleCancel(cancelTarget)}
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

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.5px", margin: 0 }}>
            Pesanan Saya
          </h1>
          <Link href="/home" style={{
            fontSize: 13, fontWeight: 600, color: "#1A3C34",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Lanjut Belanja
          </Link>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          paddingBottom: 4, marginBottom: 18,
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "7px 16px", borderRadius: 99,
                fontFamily: "inherit", fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 13, cursor: "pointer",
                background: activeTab === tab.id ? "#1A3C34" : "#fff",
                color: activeTab === tab.id ? "#fff" : "#6B7280",
                border: activeTab === tab.id ? "none" : "1.5px solid #E5E7EB",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order cards */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#374151", margin: "0 0 6px" }}>Tidak ada pesanan</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Mulai belanja sekarang!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((order) => {
              const status = getStatus(order);
              const confirmed = isConfirmed(order.id);
              const effectiveStatus = confirmed ? "delivered" : status;
              return (
                <div
                  key={order.id}
                  className="order-card"
                  style={{
                    background: "#fff", borderRadius: 16,
                    border: "1px solid #EBEBEB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 18px", borderBottom: "1px solid #F3F4F6",
                    background: "#FAFAFA",
                  }}>
                    <div>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{order.date} · </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{order.store}</span>
                    </div>
                    <StatusBadge status={effectiveStatus} />
                  </div>

                  {/* Items */}
                  <div style={{ padding: "14px 18px" }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        marginBottom: i < order.items.length - 1 ? 10 : 0,
                      }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 10,
                          background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 24, flexShrink: 0,
                        }}>
                          {item.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>{item.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                            {item.variant} · x{item.qty}
                          </p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34" }}>
                          {fmt(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{
                    borderTop: "1px solid #F3F4F6", padding: "12px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: 8,
                  }}>
                    <div>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>Total Pesanan: </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A" }}>{fmt(order.total)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Link
                        href={`/orders/${order.id}`}
                        style={{
                          padding: "7px 14px", borderRadius: 10,
                          border: "1.5px solid #E5E7EB", fontFamily: "inherit",
                          fontWeight: 600, fontSize: 13, color: "#374151",
                          textDecoration: "none", display: "inline-block",
                        }}
                      >
                        Detail
                      </Link>

                      {/* Cancel — only for pending/processing */}
                      {(status === "pending" || status === "processing") && !confirmed && (
                        <button
                          onClick={() => setCancelTarget(order.id)}
                          style={{
                            padding: "7px 14px", borderRadius: 10,
                            border: "1.5px solid #FECACA", background: "#FEF2F2",
                            fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                            color: "#EF4444", cursor: "pointer",
                          }}
                        >
                          Batalkan
                        </button>
                      )}

                      {/* Confirm receipt — only for shipped */}
                      {status === "shipped" && !confirmed && (
                        <>
                          {/* Status Pengiriman */}
                          <div style={{
                            padding: "6px 12px", borderRadius: 10,
                            background: "#EDE9FE", border: "1px solid #DDD6FE",
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            <span style={{ fontSize: 13 }}></span>
                            <div>
                              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#5B21B6" }}>
                                Sedang dikirim
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>
                                {order.trackingNo !== "-" ? `Resi: ${order.trackingNo}` : "Menunggu resi"}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleConfirm(order.id)}
                            style={{
                              padding: "7px 14px", borderRadius: 10,
                              border: "none", background: "#1A3C34",
                              fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                              color: "#fff", cursor: "pointer",
                            }}
                          >
                            Konfirmasi Terima
                          </button>
                        </>
                      )}

                      {/* Already confirmed */}
                      {confirmed && (
                        <span style={{
                          fontSize: 12, fontWeight: 700, color: "#10B981",
                          background: "#D1FAE5", borderRadius: 99, padding: "5px 12px",
                        }}>
                          Sudah dikonfirmasi ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
