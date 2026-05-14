"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

// ── Dummy data (nanti: GET /wallet + GET /wallet/transactions) ────
const WALLET_BALANCE = 1250000;

const TRANSACTIONS = [
  { id: 1,  type: "payment",  amount: 264000,  balance_after: 986000,  created_at: "2024-05-01T10:45:00Z", label: "Pembayaran ORD-20240501-001" },
  { id: 2,  type: "topup",    amount: 500000,  balance_after: 1486000, created_at: "2024-05-02T08:00:00Z", label: "Top Up Saldo" },
  { id: 3,  type: "payment",  amount: 808000,  balance_after: 678000,  created_at: "2024-05-02T14:20:00Z", label: "Pembayaran ORD-20240502-002" },
  { id: 4,  type: "refund",   amount: 194000,  balance_after: 872000,  created_at: "2024-05-03T09:00:00Z", label: "Refund ORD-20240428-004" },
  { id: 5,  type: "topup",    amount: 1000000, balance_after: 1872000, created_at: "2024-05-04T11:00:00Z", label: "Top Up Saldo" },
  { id: 6,  type: "payment",  amount: 659000,  balance_after: 1213000, created_at: "2024-05-04T13:30:00Z", label: "Pembayaran ORD-20240503-003" },
  { id: 7,  type: "topup",    amount: 500000,  balance_after: 1713000, created_at: "2024-05-05T10:00:00Z", label: "Top Up Saldo" },
  { id: 8,  type: "payment",  amount: 463000,  balance_after: 1250000, created_at: "2024-05-06T15:00:00Z", label: "Pembayaran ORD-20240505-008" },
];

const TYPE_CONFIG = {
  payment: { label: "Pembayaran", color: "#EF4444", bg: "#FEF2F2", sign: "-", icon: "💸" },
  topup:   { label: "Top Up",     color: "#10B981", bg: "#D1FAE5", sign: "+", icon: "💰" },
  refund:  { label: "Refund",     color: "#3B82F6", bg: "#DBEAFE", sign: "+", icon: "↩️" },
};

const FILTER_TABS = [
  { id: "all",     label: "Semua" },
  { id: "topup",   label: "Top Up" },
  { id: "payment", label: "Pembayaran" },
  { id: "refund",  label: "Refund" },
];

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function WalletPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = TRANSACTIONS.filter(t =>
    activeFilter === "all" || t.type === activeFilter
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .txn-row:hover { background: #F9FFFE !important; }
        .filter-tab { transition: all 0.15s; }
      `}</style>

      <Navbar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 56px" }}>

        {/* ── Balance Card ── */}
        <div style={{
          background: "linear-gradient(135deg, #1A3C34 0%, #2D6A5E 100%)",
          borderRadius: 24, padding: "32px 28px", marginBottom: 24,
          boxShadow: "0 8px 32px rgba(26,60,52,0.25)", position: "relative", overflow: "hidden",
        }}>
          {/* decorative circles */}
          <div style={{
            position: "absolute", right: -40, top: -40,
            width: 180, height: 180, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", right: 40, bottom: -60,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
            Saldo E-Wallet
          </p>
          <p style={{ margin: "0 0 24px", fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            {fmt(WALLET_BALANCE)}
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12,
              padding: "10px 14px", backdropFilter: "blur(4px)",
            }}>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Total Masuk</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#4ADE80" }}>
                + {fmt(TRANSACTIONS.filter(t => t.type !== "payment").reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12,
              padding: "10px 14px", backdropFilter: "blur(4px)",
            }}>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Total Keluar</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#FCA5A5" }}>
                - {fmt(TRANSACTIONS.filter(t => t.type === "payment").reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div style={{
          background: "#fff", borderRadius: 20,
          border: "1px solid #EBEBEB",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #F3F4F6",
          }}>
            <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 16, color: "#0A0A0A" }}>
              Riwayat Transaksi
            </p>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 6 }}>
              {FILTER_TABS.map(tab => (
                <button key={tab.id} className="filter-tab"
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: "5px 14px", borderRadius: 99,
                    fontFamily: "inherit", fontWeight: activeFilter === tab.id ? 700 : 500,
                    fontSize: 12, cursor: "pointer",
                    background: activeFilter === tab.id ? "#1A3C34" : "#F5F5F5",
                    color: activeFilter === tab.id ? "#fff" : "#6B7280",
                    border: "none",
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#9CA3AF" }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>📭</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Tidak ada transaksi</p>
            </div>
          ) : (
            filtered.map((t, i) => {
              const cfg = TYPE_CONFIG[t.type] ?? { label: t.type, color: "#6B7280", bg: "#F5F5F5", sign: "", icon: "💳" };
              const isDebit = t.type === "payment";
              return (
                <div key={t.id} className="txn-row"
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                    background: "#fff", transition: "background 0.15s",
                  }}>
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: cfg.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>
                      {t.label}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                      {formatDate(t.created_at)}
                    </p>
                  </div>

                  {/* Amount + balance */}
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      margin: 0, fontWeight: 700, fontSize: 15,
                      color: isDebit ? "#EF4444" : "#10B981",
                    }}>
                      {cfg.sign} {fmt(t.amount)}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" }}>
                      Saldo: {fmt(t.balance_after)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}