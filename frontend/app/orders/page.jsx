"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";

/* ── konstanta ── */
const STATUS_LABELS = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  processing: "Diproses",
  menunggu_penjual: "Menunggu Penjual",
  shipped: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  canceled: "Dibatalkan",
  transaksi_gagal: "Dibatalkan",
  diterima_pembeli: "Diterima Pembeli",
  sampai_di_tujuan: "Sampai Tujuan",
  sedang_dikirim: "Dikirim",
  diproses_penjual: "Diproses",
};

const STATUS_COLORS = {
  pending: { color: "#F59E0B", bg: "#FEF3C7" },
  paid: { color: "#3B82F6", bg: "#DBEAFE" },
  processing: { color: "#8B5CF6", bg: "#EDE9FE" },
  menunggu_penjual: { color: "#F59E0B", bg: "#FEF3C7" },
  shipped: { color: "#10B981", bg: "#D1FAE5" },
  delivered: { color: "#059669", bg: "#A7F3D0" },
  completed: { color: "#059669", bg: "#A7F3D0" },
  cancelled: { color: "#EF4444", bg: "#FEE2E2" },
  canceled: { color: "#EF4444", bg: "#FEE2E2" },
  transaksi_gagal: { color: "#EF4444", bg: "#FEE2E2" },
  diterima_pembeli: { color: "#059669", bg: "#A7F3D0" },
  sampai_di_tujuan: { color: "#059669", bg: "#A7F3D0" },
  sedang_dikirim: { color: "#10B981", bg: "#D1FAE5" },
  diproses_penjual: { color: "#8B5CF6", bg: "#EDE9FE" },
};

const TABS = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "menunggu_penjual", label: "Diproses" },
  { id: "shipped", label: "Dikirim" },
  { id: "delivered", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

/* ── helpers ── */
function fmt(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function fmtDate(raw) {
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

/* ── komponen kecil ── */
function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] ?? { color: "#6B7280", bg: "#F3F4F6" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
      borderRadius: 99, padding: "3px 10px", display: "inline-block", whiteSpace: "nowrap",
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
      padding: "18px 20px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ height: 13, width: "35%", background: "#F3F4F6", borderRadius: 6 }} />
        <div style={{ height: 13, width: "20%", background: "#F3F4F6", borderRadius: 6 }} />
      </div>
      <div style={{ height: 13, width: "55%", background: "#F3F4F6", borderRadius: 6, marginBottom: 10 }} />
      <div style={{ height: 13, width: "25%", background: "#F3F4F6", borderRadius: 6 }} />
    </div>
  );
}

/* ── page ── */
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(authService.getToken());

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login untuk melihat pesanan.");
      return;
    }

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Gagal memuat pesanan. Pastikan backend sudah berjalan.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLoggedIn]);

  /* filter berdasar tab */
  const filtered = activeTab === "all"
    ? orders
    : orders.filter(o => {
      const s = o.status;
      // "cancelled" dan "canceled" keduanya match tab canceled
      if (activeTab === "cancelled") return s === "cancelled" || s === "canceled";
      return s === activeTab;
    });

  /* ── not logged in ── */
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 460, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>🔐</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>Login Diperlukan</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Silakan login untuk melihat pesanan.</p>
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

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 64px" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.5px", margin: 0 }}>
            Pesanan Saya
          </h1>
          <Link href="/home" style={{
            fontSize: 13, fontWeight: 600, color: "#1A3C34", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Lanjut Belanja
          </Link>
        </div>

        {/* tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 16px", borderRadius: 99, border: "none",
                fontFamily: "inherit", fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                background: activeTab === tab.id ? "#1A3C34" : "#F5F5F5",
                color: activeTab === tab.id ? "#fff" : "#6B7280",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* error */}
        {error && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 12,
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* list */}
        {loading ? (
          <div>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
            padding: "60px 20px", textAlign: "center",
          }}>
            <p style={{ fontSize: 48, margin: "0 0 12px" }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
              {activeTab === "all" ? "Belum ada pesanan" : `Tidak ada pesanan "${TABS.find(t => t.id === activeTab)?.label}"`}
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 20px" }}>
              {activeTab === "all" ? "Yuk mulai belanja sekarang!" : "Coba lihat tab lain."}
            </p>
            <Link href="/home" style={{
              display: "inline-block", padding: "10px 24px",
              borderRadius: 10, background: "#1A3C34", color: "#fff",
              fontWeight: 600, fontSize: 13, textDecoration: "none",
            }}>
              Mulai Belanja
            </Link>
          </div>
        ) : (
          filtered.map(order => {
            const orderId = order.orderId ?? order.id;
            const dateStr = fmtDate(order.createdAt);
            const itemCount = order.itemCount ?? order.items?.length ?? 0;
            return (
              <Link key={orderId} href={`/orders/${orderId}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
                  padding: "18px 20px", marginBottom: 12,
                  transition: "box-shadow 0.18s, border-color 0.18s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,60,52,0.10)";
                    e.currentTarget.style.borderColor = "#C7DDD9";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#EBEBEB";
                  }}
                >
                  {/* row 1: id + status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
                      #{orderId}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* row 2: info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>
                      {itemCount > 0 ? `${itemCount} item` : "—"}
                      {dateStr && (
                        <span style={{ marginLeft: 10, color: "#C4C4C4" }}>·</span>
                      )}
                      {dateStr && (
                        <span style={{ marginLeft: 10, fontSize: 12, color: "#9CA3AF" }}>{dateStr}</span>
                      )}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1A3C34" }}>
                      {fmt(order.total)}
                    </span>
                  </div>

                  {/* row 3: cta */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    {order.status === "pending" && (
                      <span style={{
                        padding: "6px 14px", borderRadius: 10,
                        background: "#1A3C34", color: "#fff",
                        fontSize: 12, fontWeight: 700,
                      }}>
                        Bayar Sekarang
                      </span>
                    )}
                    <span style={{
                      padding: "6px 14px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", color: "#374151",
                      fontSize: 12, fontWeight: 700,
                    }}>
                      Lihat Detail
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}
