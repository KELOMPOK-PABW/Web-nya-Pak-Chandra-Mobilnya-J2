"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  process: { label: "Diproses", variant: "warning" },
  ready_to_ship: { label: "Siap Dikirim", variant: "info" },
  ready_to_ship_order: { label: "Siap Dikirim", variant: "info" },
  shipped: { label: "Dikirim", variant: "info" },
  completed: { label: "Selesai", variant: "success" },
  complete: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "danger" },
  canceled: { label: "Dibatalkan", variant: "danger" },
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusMeta(status) {
  return STATUS_META[String(status || "").toLowerCase()] ?? {
    label: status || "Pending",
    variant: "default",
  };
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState("");

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return {
      total: orders.length,
      pending: orders.filter((order) => ["pending", "paid"].includes(String(order.status).toLowerCase())).length,
      processing: orders.filter((order) => ["processing", "process"].includes(String(order.status).toLowerCase())).length,
      revenue: totalRevenue,
    };
  }, [orders]);

  async function loadOrders() {
    setIsLoading(true);
    setError("");
    try {
      const data = await sellerService.getSellerOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Gagal mengambil pesanan seller.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const runOrderAction = async (order, type) => {
    const orderItemId = order.orderItemId ?? order.id;
    if (!orderItemId) {
      setFeedback("Order item ID tidak ditemukan pada data pesanan.");
      return;
    }

    setActionLoadingId(`${type}-${orderItemId}`);
    setFeedback("");
    setError("");
    try {
      if (type === "process") {
        await sellerService.processOrder(orderItemId);
        setFeedback("Pesanan berhasil diproses.");
      } else {
        await sellerService.readyToShipOrder(orderItemId);
        setFeedback("Pesanan ditandai siap dikirim.");
      }
      await loadOrders();
    } catch (err) {
      setError(err.message || "Gagal memperbarui status pesanan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Toko Saya" subtitle="Seller Center" menus={SELLER_MENUS} />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Pesanan Masuk</h1>
              <p className="text-gray-600 mt-1">Kelola pesanan toko dari API seller orders.</p>
            </div>
            <Button type="button" variant="outline" onClick={loadOrders} disabled={isLoading}>
              Refresh
            </Button>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Pesanan", value: summary.total },
              { label: "Perlu Diproses", value: summary.pending },
              { label: "Sedang Diproses", value: summary.processing },
              { label: "Total Nilai", value: formatCurrency(summary.revenue) },
            ].map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-[#1A3C34] mt-2">{item.value}</p>
              </Card>
            ))}
          </div>

          {feedback && (
            <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
              {feedback}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAF9]">
                  <tr>
                    {["ID", "Pembeli", "Produk", "Qty", "Total", "Status", "Tanggal", "Aksi"].map((header) => (
                      <th key={header} className="px-5 py-3 text-left text-xs font-bold uppercase text-[#1A3C34]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-500">Memuat pesanan...</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-500">Belum ada pesanan seller.</td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const status = getStatusMeta(order.status);
                      const orderItemId = order.orderItemId ?? order.id;
                      const normalizedStatus = String(order.status || "").toLowerCase();
                      const canProcess = ["pending", "paid"].includes(normalizedStatus);
                      const canReadyToShip = ["processing", "process"].includes(normalizedStatus);

                      return (
                        <tr key={`${order.id}-${orderItemId}`} className="bg-white">
                          <td className="px-5 py-4 font-semibold text-[#1A3C34]">#{order.id}</td>
                          <td className="px-5 py-4 text-gray-700">{order.buyerName}</td>
                          <td className="px-5 py-4 text-gray-700">{order.productName}</td>
                          <td className="px-5 py-4 text-gray-700">{order.qty}</td>
                          <td className="px-5 py-4 font-semibold text-[#111827]">{formatCurrency(order.total)}</td>
                          <td className="px-5 py-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                disabled={!canProcess}
                                loading={actionLoadingId === `process-${orderItemId}`}
                                onClick={() => runOrderAction(order, "process")}
                              >
                                Proses
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={!canReadyToShip}
                                loading={actionLoadingId === `ready-${orderItemId}`}
                                onClick={() => runOrderAction(order, "ready")}
                              >
                                Siap Kirim
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
