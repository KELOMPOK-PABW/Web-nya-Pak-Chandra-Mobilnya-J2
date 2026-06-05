"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const SELLER_MENUS = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Produk", href: "/seller/products" },
  { label: "Pesanan", href: "/seller/orders" },
];

const STATUS_META = {
  pending: { label: "Menunggu", variant: "warning" },
  paid: { label: "Dibayar", variant: "info" },
  processing: { label: "Diproses", variant: "warning" },
  menunggu_penjual: { label: "Menunggu Penjual", variant: "warning" },
  ready_to_ship: { label: "Siap Dikirim", variant: "info" },
  shipped: { label: "Dikirim", variant: "purple" },
  delivered: { label: "Terkirim", variant: "success" },
  completed: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
  canceled: { label: "Dibatalkan", variant: "danger" },
};

function fmt(n) {
  return "Rp" + Number(n || 0).toLocaleString("id-ID");
}

function fmtDate(raw) {
  if (!raw) return "-";
  return new Date(raw).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const meta = STATUS_META[String(status || "").toLowerCase()] ?? { label: status, variant: "default" };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await sellerService.getSellerOrders();
      setOrders(data);
    } catch (err) {
      // Jika BE belum siap, kita biarkan orders kosong di UI statis ini
      console.error(err);
      setError(err.message || "Gagal mengambil pesanan. Pastikan backend sudah berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter(o => {
      const s = String(o.status).toLowerCase();
      if (activeFilter === "need_process") return ["paid", "pending", "menunggu_penjual"].includes(s);
      if (activeFilter === "processing") return ["processing", "ready_to_ship"].includes(s);
      return s === activeFilter;
    });
  }, [orders, activeFilter]);

  const summary = useMemo(() => ({
    total: orders.length,
    needProcess: orders.filter(o => ["paid", "pending", "menunggu_penjual"].includes(String(o.status).toLowerCase())).length,
    processing: orders.filter(o => ["processing", "ready_to_ship"].includes(String(o.status).toLowerCase())).length,
    completed: orders.filter(o => ["completed", "delivered"].includes(String(o.status).toLowerCase())).length,
  }), [orders]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar menus={SELLER_MENUS} />

        <main style={{ flex: 1, padding: "32px", maxWidth: "1200px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Pesanan Masuk</h1>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>Kelola semua pesanan yang masuk ke toko Anda.</p>
            </div>
            <Button variant="outline" onClick={loadOrders} loading={isLoading}>
              Refresh Data
            </Button>
          </div>

          {/* Stats Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {[
              { label: "Semua Pesanan", value: summary.total, color: "#1A3C34" },
              { label: "Perlu Diproses", value: summary.needProcess, color: "#F59E0B" },
              { label: "Sedang Dikirim", value: summary.processing, color: "#3B82F6" },
              { label: "Selesai", value: summary.completed, color: "#059669" },
            ].map(s => (
              <Card key={s.label} style={{ padding: "18px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#888", margin: 0, textTransform: "uppercase" }}>{s.label}</p>
                <p style={{ fontSize: "28px", fontWeight: 800, color: s.color, margin: "8px 0 0" }}>{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
            {[
              { id: "all", label: "Semua" },
              { id: "need_process", label: "Perlu Diproses" },
              { id: "processing", label: "Dalam Pengiriman" },
              { id: "completed", label: "Selesai" },
              { id: "cancelled", label: "Dibatalkan" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: "8px 18px", borderRadius: "99px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  background: activeFilter === f.id ? "#1A3C34" : "#fff",
                  color: activeFilter === f.id ? "#fff" : "#666",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: activeFilter === f.id ? "1px solid #1A3C34" : "1px solid #EBEBEB",
                  transition: "all 0.2s"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table Card */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead style={{ background: "#f1f5f9", borderBottom: "1px solid #EBEBEB" }}>
                <tr>
                  {["Order ID", "Tanggal", "Pembeli", "Produk", "Total", "Status", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#999" }}>Memuat data pesanan...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "60px", textAlign: "center", color: "#999" }}>Tidak ada pesanan ditemukan.</td></tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.orderItemId || order.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "#1A3C34" }}>#{order.id}</td>
                      <td style={{ padding: "16px 20px", color: "#64748b", fontSize: "13px" }}>{fmtDate(order.createdAt)}</td>
                      <td style={{ padding: "16px 20px", color: "#1A1A1A", fontWeight: 500 }}>{order.buyerName}</td>
                      <td style={{ padding: "16px 20px", color: "#1A1A1A" }}>{order.productName} <span style={{ color: "#94a3b8", fontSize: "12px" }}>x{order.qty}</span></td>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "#1A3C34" }}>{fmt(order.total)}</td>
                      <td style={{ padding: "16px 20px" }}><StatusBadge status={order.status} /></td>
                      <td style={{ padding: "16px 20px" }}>
                        <Link href={`/seller/orders/${order.orderItemId || order.id}`}>
                          <Button variant="outline" style={{ padding: "6px 14px", fontSize: "12px", borderRadius: "8px" }}>Detail</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

        </main>
      </div>
    </div>
  );
}
