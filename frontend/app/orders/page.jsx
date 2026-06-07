"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";

const STATUS_LABELS = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
};

const STATUS_COLORS = {
  pending: { color: "#F59E0B", bg: "#FEF3C7" },
  paid: { color: "#3B82F6", bg: "#DBEAFE" },
  processing: { color: "#8B5CF6", bg: "#EDE9FE" },
  shipped: { color: "#10B981", bg: "#D1FAE5" },
  delivered: { color: "#059669", bg: "#A7F3D0" },
  cancelled: { color: "#EF4444", bg: "#FEE2E2" },
};

const TABS = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu" },
  { id: "paid", label: "Lunas" },
  { id: "shipped", label: "Dikirim" },
  { id: "delivered", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] ?? { color: "#6B7280", bg: "#F3F4F6" };
  const label = STATUS_LABELS[status] || status;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
      borderRadius: 99, padding: "3px 9px", display: "inline-block",
    }}>
      {label}
    </span>
  );
}

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

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Gagal memuat pesanan");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isLoggedIn]);

  const filtered = activeTab === "all"
    ? orders
    : orders.filter(o => o.status === activeTab);

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
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

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.5px", margin: 0 }}>
            Pesanan Saya
          </h1>
          <Link href="/home" style={{
            fontSize: 13, fontWeight: 600, color: "#1A3C34", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Lanjut Belanja
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 16px", borderRadius: 99, border: "none",
                fontFamily: "inherit", fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                background: activeTab === tab.id ? "#1A3C34" : "#F5F5F5",
                color: activeTab === tab.id ? "#fff" : "#6B7280",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 12,
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
                padding: 20, marginBottom: 12,
              }}>
                <div style={{ height: 14, width: "40%", background: "#F3F4F6", borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 14, width: "60%", background: "#F3F4F6", borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 14, width: "20%", background: "#F3F4F6", borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
            padding: "60px 20px", textAlign: "center",
          }}>
            <p style={{ fontSize: 48, margin: "0 0 12px" }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>
              {activeTab === "all" ? "Belum ada pesanan" : `Tidak ada pesanan dengan status "${TABS.find(t => t.id === activeTab)?.label}"`}
            </p>
            <Link href="/home" style={{
              marginTop: 16, display: "inline-block", padding: "10px 24px",
              borderRadius: 10, background: "#1A3C34", color: "#fff",
              fontWeight: 600, fontSize: 13, textDecoration: "none",
            }}>
              Mulai Belanja
            </Link>
          </div>
        ) : (
          filtered.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
                padding: "18px 20px", marginBottom: 12, cursor: "pointer",
                transition: "all 0.18s", display: "block",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
                    #{order.orderId ?? order.id}
                  </span>
                  <StatusBadge status={order.status || order.payment_status} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    {order.items?.length || 0} item
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#1A3C34" }}>
                    {fmt(order.total || 0)}
                  </span>
                </div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <span style={{
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 12,
                    color: "#374151",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "7px 12px",
                  }}>
                    Lihat Detail
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
