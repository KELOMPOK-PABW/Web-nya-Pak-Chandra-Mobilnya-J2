"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";

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

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(authService.getToken());

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login.");
      return;
    }

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = authService.getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || "Order tidak ditemukan");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat detail pesanan");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, isLoggedIn]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
          {[120, 200, 100].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 16, background: "#F3F4F6", marginBottom: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>
            Pesanan Tidak Ditemukan
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>{error || `ID #${id} tidak ditemukan.`}</p>
          <Link href="/orders" style={{
            padding: "12px 28px", borderRadius: 12, background: "#1A3C34",
            color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block",
          }}>
            Kembali ke Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const status = order.payment_status || order.status || "pending";
  const cfg = STATUS_COLORS[status] ?? { color: "#6B7280", bg: "#F3F4F6" };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />

      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/orders" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Pesanan</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span style={{ fontSize: 13, color: "#1A3C34", fontWeight: 600 }}>Detail #{order.order_id}</span>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", margin: 0 }}>
            #{order.order_id}
          </h1>
          <span style={{
            fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg,
            borderRadius: 99, padding: "5px 12px",
          }}>
            {STATUS_LABELS[status] || status}
          </span>
        </div>

        {/* Payment action */}
        {status === "pending" && (
          <Link href={`/payment/${order.order_id}`} style={{
            display: "block", marginBottom: 16, padding: "14px 20px", borderRadius: 14,
            background: "#1A3C34", color: "#fff", fontWeight: 700, fontSize: 14,
            textDecoration: "none", textAlign: "center",
          }}>
            Bayar Sekarang
          </Link>
        )}

        {/* Order Items */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 16, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
            📦 Produk Dipesan
          </div>
          <div style={{ padding: "12px 20px" }}>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: i < order.items.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>
                      {item.product_name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                      {item.store_name} · x{item.qty}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34", flexShrink: 0 }}>
                    {fmt(item.price * item.qty)}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>Tidak ada item.</p>
            )}
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 16, padding: "18px 20px",
          }}>
            <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
              📍 Alamat Pengiriman
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
              {order.address.address}, {order.address.city}
            </p>
          </div>
        )}

        {/* Order Summary */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "18px 20px",
        }}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>
            Ringkasan Pesanan
          </p>
          <Row label="Subtotal" value={fmt(order.items?.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0) || 0)} />
          <Row label="Ongkos Kirim" value={fmt(15000)} />
          <div style={{ height: 1, background: "#F3F4F6", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#1A3C34" }}>
              {fmt(order.totalAmount || order.items?.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0) || 0)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/orders" style={{
            padding: "12px 24px", borderRadius: 12, border: "1.5px solid #E5E7EB",
            color: "#374151", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block",
          }}>
            ← Kembali ke Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
