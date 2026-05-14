"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

// ── Dummy data (nanti: GET /payments/{order_id} + GET /wallet) ────
const ORDERS_PAYMENT = {
  "ORD-20240503-003": {
    order_id:    "ORD-20240503-003",
    store:       "Gadget World",
    items: [
      { name: "Earphone TWS NoisePro X", variant: "Putih",        qty: 1, price: 599000, emoji: "🎧" },
      { name: "Case Pelindung AirPods",  variant: "Transparan",   qty: 1, price: 45000,  emoji: "📦" },
    ],
    subtotal:    644000,
    shipping:    55000,
    discount:    40000,
    total:       659000,
    status:      "pending",   // pending | paid | failed
  },
  "ORD-20240427-005": {
    order_id:    "ORD-20240427-005",
    store:       "Home Living",
    items: [
      { name: "Lampu LED Smart Bulb", variant: "Warm White", qty: 3, price: 65000, emoji: "💡" },
    ],
    subtotal:    195000,
    shipping:    15000,
    discount:    0,
    total:       210000,
    status:      "pending",
  },
};

const WALLET_BALANCE = 1250000;

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function RowDetail({ label, value, valueColor, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 600, color: valueColor ?? "#0A0A0A" }}>
        {value}
      </span>
    </div>
  );
}

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();

  const order = ORDERS_PAYMENT[id];

  const [payState,    setPayState]    = useState("idle"); // idle | confirm | processing | success | failed
  const [walletAfter, setWalletAfter] = useState(null);

  // Not found 
  if (!order) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>
            Pesanan Tidak Ditemukan
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
            ID <strong>{id}</strong> tidak ditemukan atau sudah dibayar.
          </p>
          <Link href="/orders" style={{
            padding: "12px 28px", borderRadius: 12,
            background: "#1A3C34", color: "#fff",
            fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>
            Lihat Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const isInsufficient = WALLET_BALANCE < order.total;

  //Success state
  if (payState === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#D1FAE5", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
          }}></div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>
            Pembayaran Berhasil!
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 6 }}>
            Pesanan <strong>{order.order_id}</strong> telah dibayar.
          </p>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28 }}>
            Saldo tersisa: <strong style={{ color: "#1A3C34" }}>{fmt(walletAfter)}</strong>
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href={`/orders/${order.order_id}`}
              style={{
                padding: "12px 24px", borderRadius: 12,
                background: "#1A3C34", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
              Lihat Detail Pesanan
            </Link>
            <Link href="/orders"
              style={{
                padding: "12px 24px", borderRadius: 12,
                border: "1.5px solid #E5E7EB", color: "#374151",
                fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>
              Semua Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <Navbar />

      {/* ── Konfirmasi Modal ── */}
      {payState === "confirm" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "32px 28px",
            maxWidth: 400, width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A0A0A", margin: "0 0 8px" }}>
              Konfirmasi Pembayaran
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px", lineHeight: 1.6 }}>
              Total yang akan dibayar:
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1A3C34", margin: "0 0 4px" }}>
              {fmt(order.total)}
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 24px" }}>
              Saldo setelah bayar: {fmt(WALLET_BALANCE - order.total)}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setPayState("idle")}
                style={{
                  flex: 1, height: 46, borderRadius: 12,
                  border: "1.5px solid #E5E7EB", background: "#fff",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", color: "#374151",
                }}>
                Batal
              </button>
              <button
                onClick={() => {
                  // nanti: POST /payments { order_id } → POST /payments/{id}/pay
                  setPayState("processing");
                  setTimeout(() => {
                    setWalletAfter(WALLET_BALANCE - order.total);
                    setPayState("success");
                  }, 1500);
                }}
                style={{
                  flex: 1, height: 46, borderRadius: 12,
                  border: "none", background: "#1A3C34",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", color: "#fff",
                }}>
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {payState === "processing" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, border: "4px solid rgba(255,255,255,0.2)",
            borderTop: "4px solid #fff", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Memproses pembayaran...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/orders" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Pesanan</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 13, color: "#1A3C34", fontWeight: 600 }}>Konfirmasi Bayar</span>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 56px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 20, letterSpacing: "-0.4px" }}>
          Konfirmasi Pembayaran
        </h1>

        {/* Order summary */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 16, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>🛍 Ringkasan Pesanan</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: "#9CA3AF" }}>· {order.store}</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {order.items.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                paddingBottom: i < order.items.length - 1 ? 12 : 0,
                marginBottom: i < order.items.length - 1 ? 12 : 0,
                borderBottom: i < order.items.length - 1 ? "1px solid #F9FAFB" : "none",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg,#E0F2F1,#B2DFDB)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0A0A0A" }}>{item.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{item.variant} · x{item.qty}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1A3C34" }}>
                  {fmt(item.price * item.qty)}
                </span>
              </div>
            ))}

            {/* Price breakdown */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
              <RowDetail label="Subtotal"      value={fmt(order.subtotal)} />
              <RowDetail label="Ongkos Kirim"  value={fmt(order.shipping)} />
              {order.discount > 0 && (
                <RowDetail label="Diskon" value={`- ${fmt(order.discount)}`} valueColor="#16A34A" />
              )}
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: "1px solid #F3F4F6",
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>{fmt(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet info */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 20, padding: "18px 20px",
        }}>
          <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
         Metode Pembayaran
          </p>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 12,
            border: `2px solid ${isInsufficient ? "#FECACA" : "#1A3C34"}`,
            background: isInsufficient ? "#FEF2F2" : "#F0FBF8",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: isInsufficient ? "#FEE2E2" : "#E0F2F1",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>E-Wallet</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: isInsufficient ? "#EF4444" : "#1A3C34", fontWeight: 600 }}>
                  Saldo: {fmt(WALLET_BALANCE)}
                </p>
              </div>
            </div>
            {isInsufficient
              ? <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "#FEE2E2", borderRadius: 99, padding: "4px 10px" }}>Saldo Kurang</span>
              : <span style={{ fontSize: 12, fontWeight: 700, color: "#1A3C34", background: "#D1FAE5", borderRadius: 99, padding: "4px 10px" }}>✓ Cukup</span>
            }
          </div>

          {isInsufficient && (
            <div style={{
              marginTop: 10, padding: "10px 14px", borderRadius: 10,
              background: "#FEF2F2", border: "1px solid #FECACA",
            }}>
              <p style={{ margin: 0, fontSize: 13, color: "#EF4444", fontWeight: 500 }}>
                Saldo tidak mencukupi. Kekurangan: <strong>{fmt(order.total - WALLET_BALANCE)}</strong>.
                Silakan top up terlebih dahulu.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/orders/${order.order_id}`}
            style={{
              flex: 1, height: 52, borderRadius: 14,
              border: "1.5px solid #E5E7EB", background: "#fff",
              fontFamily: "inherit", fontWeight: 600, fontSize: 14,
              color: "#374151", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            Kembali
          </Link>
          <button
            disabled={isInsufficient}
            onClick={() => setPayState("confirm")}
            style={{
              flex: 2, height: 52, borderRadius: 14, border: "none",
              background: isInsufficient ? "#E5E7EB" : "#1A3C34",
              fontFamily: "inherit", fontWeight: 700, fontSize: 15,
              color: isInsufficient ? "#9CA3AF" : "#fff",
              cursor: isInsufficient ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}>
            {isInsufficient ? "Saldo Tidak Cukup" : `Bayar ${fmt(order.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}