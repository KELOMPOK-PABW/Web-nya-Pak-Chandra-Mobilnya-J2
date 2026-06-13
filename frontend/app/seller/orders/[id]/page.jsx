"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
    { label: "Toko Saya", href: "/stores/me" },
    { label: "Status Pengajuan", href: "/seller/application" },
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
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatusBadge({ status }) {
    const meta = STATUS_META[String(status || "").toLowerCase()] ?? { label: status, variant: "default" };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export default function SellerOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null); // 'process' | 'ready'
    const [feedback, setFeedback] = useState("");

    const loadOrderDetail = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await sellerService.getSellerOrderById(id);
            setOrder(data);
        } catch (err) {
            console.error(err);
            setOrder(null);
            setError(err.message || "Gagal mengambil detail pesanan. Pastikan backend sudah berjalan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadOrderDetail();
    }, [id]);

    const handleAction = async (type) => {
        setActionLoading(type);
        setFeedback("");
        try {
            if (type === "process") {
                await sellerService.processOrder(order?.orderItemId || id);
                setFeedback("Status berhasil diubah menjadi: Diproses");
            } else {
                await sellerService.readyToShipOrder(order?.orderItemId || id);
                setFeedback("Status berhasil diubah menjadi: Siap Dikirim");
            }
            await loadOrderDetail();
        } catch (err) {
            setError(err.message || "Gagal memperbarui status. Pastikan BE sudah siap.");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading && !order) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
                <Navbar />
                <div style={{ display: "flex", flex: 1 }}>
                    <Sidebar menus={SELLER_MENUS} />
                    <main style={{ flex: 1, padding: "32px", textAlign: "center", color: "#666" }}>Memuat detail pesanan...</main>
                </div>
            </div>
        );
    }

    const status = String(order?.status || "").toLowerCase();
    const canProcess = ["paid", "pending", "menunggu_penjual"].includes(status);
    const canReadyToShip = ["processing", "ready_to_ship"].includes(status);

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
            <Navbar />
            <div style={{ display: "flex", flex: 1 }}>
                <Sidebar menus={SELLER_MENUS} />

                <main style={{ flex: 1, padding: "32px", maxWidth: "900px" }}>
                    {/* Header */}
                    <div style={{ marginBottom: "24px" }}>
                        <Link href="/seller/orders" style={{ fontSize: "13px", fontWeight: 600, color: "#1A3C34", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                            Kembali ke Daftar Pesanan
                        </Link>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Detail Pesanan #{order?.id}</h1>
                            <StatusBadge status={order?.status} />
                        </div>
                    </div>

                    {feedback && (
                        <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "12px", background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontSize: "14px" }}>
                            {feedback}
                        </div>
                    )}

                    {error && (
                        <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: "14px" }}>
                            {error}
                        </div>
                    )}

                    {!order ? (
                        <Card style={{ padding: "48px", textAlign: "center" }}>
                            <p style={{ fontSize: "42px", margin: "0 0 12px" }}>📦</p>
                            <p style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>Pesanan tidak ditemukan</p>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px" }}>Coba kembali ke daftar pesanan dan pilih pesanan lain.</p>
                            <Link href="/seller/orders">
                                <Button variant="outline">Kembali ke Pesanan</Button>
                            </Link>
                        </Card>
                    ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Informasi Utama */}
                        <Card style={{ padding: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Pembeli</label>
                                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A", margin: 0 }}>{order?.buyerName}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Tanggal Pesanan</label>
                                    <p style={{ fontSize: "14px", color: "#1A1A1A", margin: 0 }}>{fmtDate(order?.createdAt)}</p>
                                </div>
                            </div>

                            <div style={{ height: "1px", background: "#f1f5f9", margin: "24px 0" }} />

                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Produk yang Dipesan</label>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ width: "48px", height: "48px", background: "#e2e8f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📦</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A", margin: 0 }}>{order?.productName}</p>
                                        <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>Qty: {order?.qty}</p>
                                    </div>
                                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#1A3C34", margin: 0 }}>{fmt(order?.total)}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Alamat Pengiriman */}
                        <Card style={{ padding: "24px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Alamat Pengiriman</label>
                            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#475569", margin: 0 }}>
                                {order?.address || "Alamat tidak tersedia."}
                            </p>
                        </Card>

                        {/* Tombol Aksi */}
                        <div style={{ display: "flex", gap: "12px" }}>
                            <Button
                                variant="primary"
                                style={{ flex: 1 }}
                                disabled={!canProcess}
                                loading={actionLoading === 'process'}
                                onClick={() => handleAction('process')}
                            >
                                Proses Pesanan
                            </Button>
                            <Button
                                variant="outline"
                                style={{ flex: 1 }}
                                disabled={!canReadyToShip}
                                loading={actionLoading === 'ready'}
                                onClick={() => handleAction('ready')}
                            >
                                Tandai Siap Dikirim
                            </Button>
                        </div>
                    </div>
                    )}
                </main>
            </div>
        </div>
    );
}
