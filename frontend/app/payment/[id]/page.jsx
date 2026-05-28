"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { paymentService } from "@/services/paymentService";
import { walletService } from "@/services/walletService";

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function RowDetail({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? "#0A0A0A" }}>{value}</span>
    </div>
  );
}

export default function PaymentPage() {
  const { id } = useParams(); // id = order_id

  const [order,       setOrder]       = useState(null);
  const [balance,     setBalance]     = useState(null);
  const [paymentId,   setPaymentId]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [payState,    setPayState]    = useState("idle"); // idle | confirm | processing | success | failed
  const [walletAfter, setWalletAfter] = useState(null);
  const [payError,    setPayError]    = useState("");

  // Fetch order detail + wallet balance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [orderData, bal] = await Promise.all([
          paymentService.getPaymentByOrderId(id),
          walletService.getBalance(),
        ]);
        setOrder(orderData);
        setBalance(bal);
      } catch (err) {
        setError(err.message || "Gagal memuat data pembayaran.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isInsufficient = balance !== null && order !== null && balance < order.amount;

  // Handle pay
  const handlePay = async () => {
    setPayState("processing");
    setPayError("");
    try {
      // Step 1: POST /payments → dapat payment_id
      let pid = paymentId;
      if (!pid) {
        const created = await paymentService.createPayment(id);
        pid = created.payment_id;
        setPaymentId(pid);
      }
      // Step 2: POST /payments/{id}/pay
      const result = await paymentService.pay(pid);
      setWalletAfter(result.balance_after);
      setPayState("success");
    } catch (err) {
      setPayError(err.message || "Pembayaran gagal. Coba lagi.");
      setPayState("failed");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
          {[120, 200, 100].map((h, i) => (
            <div key={i} style={{
              height: h, borderRadius: 16, background: "#E5E7EB",
              marginBottom: 16, animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !order) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>
            Pesanan Tidak Ditemukan
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
            {error || `ID ${id} tidak ditemukan atau sudah dibayar.`}
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

  // Success state
  if (payState === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "#D1FAE5",
            margin: "0 auto 20px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 36,
          }}></div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>
            Pembayaran Berhasil!
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 6 }}>
            Pesanan <strong>{order.order_id}</strong> telah dibayar.
          </p>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28 }}>
            Saldo tersisa:{" "}
            <strong style={{ color: "#1A3C34" }}>{fmt(walletAfter ?? 0)}</strong>
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href={`/orders/${order.order_id}`} style={{
              padding: "12px 24px", borderRadius: 12,
              background: "#1A3C34", color: "#fff",
              fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              Lihat Detail Pesanan
            </Link>
            <Link href="/orders" style={{
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

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Navbar />

      {/* Konfirmasi Modal */}
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
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px" }}>Total yang akan dibayar:</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1A3C34", margin: "0 0 4px" }}>
              {fmt(order.amount)}
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 24px" }}>
              Saldo setelah bayar: {fmt(balance - order.amount)}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setPayState("idle")}
                style={{
                  flex: 1, height: 46, borderRadius: 12,
                  border: "1.5px solid #E5E7EB", background: "#fff",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", color: "#374151",
                }}>
                Batal
              </button>
              <button onClick={handlePay}
                style={{
                  flex: 1, height: 46, borderRadius: 12, border: "none",
                  background: "#1A3C34", fontFamily: "inherit",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#fff",
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

        {/* Pay error */}
        {payState === "failed" && payError && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 12,
            background: "#FEF2F2", border: "1px solid #FECACA",
            color: "#DC2626", fontSize: 13, fontWeight: 500,
          }}>
           {payError}
          </div>
        )}

        {/* Order summary — dari API: order.order_id, order.amount, order.method, order.status */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 16, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>🛍 Ringkasan Pesanan</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: "#9CA3AF" }}>· #{order.order_id}</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <RowDetail label="ID Pesanan"       value={`#${order.order_id}`} />
            <RowDetail label="Metode Pembayaran" value={order.method ?? "E-Wallet"} />
            <RowDetail label="Status"           value={order.status} />
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>{fmt(order.amount)}</span>
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
                width: 40, height: 40, borderRadius: 10, fontSize: 20,
                background: isInsufficient ? "#FEE2E2" : "#E0F2F1",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}></div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>E-Wallet</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: isInsufficient ? "#EF4444" : "#1A3C34" }}>
                  Saldo: {fmt(balance ?? 0)}
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
                Saldo tidak mencukupi. Kekurangan:{" "}
                <strong>{fmt(order.amount - balance)}</strong>. Silakan top up terlebih dahulu.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/orders/${order.order_id}`} style={{
            flex: 1, height: 52, borderRadius: 14,
            border: "1.5px solid #E5E7EB", background: "#fff",
            fontFamily: "inherit", fontWeight: 600, fontSize: 14,
            color: "#374151", textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            Kembali
          </Link>
          <button
            disabled={isInsufficient || payState === "processing"}
            onClick={() => { setPayState("confirm"); setPayError(""); }}
            style={{
              flex: 2, height: 52, borderRadius: 14, border: "none",
              background: isInsufficient ? "#E5E7EB" : "#1A3C34",
              fontFamily: "inherit", fontWeight: 700, fontSize: 15,
              color: isInsufficient ? "#9CA3AF" : "#fff",
              cursor: isInsufficient ? "not-allowed" : "pointer",
            }}>
            {isInsufficient ? "Saldo Tidak Cukup" : `Bayar ${fmt(order.amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}