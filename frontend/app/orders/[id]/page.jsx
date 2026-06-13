"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { courierService } from "@/services/courierService";

const STATUS_LABELS = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  canceled: "Dibatalkan",
};

const STATUS_VARIANT = {
  pending: "warning",
  paid: "info",
  processing: "warning",
  shipped: "info",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
  canceled: "danger",
};

function fmt(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getItemSubtotal(item) {
  if (item.subtotal !== undefined && item.subtotal !== null) return Number(item.subtotal);
  return Number(item.price || item.product?.price || 0) * Number(item.qty || item.quantity || 1);
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isLoggedIn = Boolean(authService.getToken());
  const [shippingStatuses, setShippingStatuses] = useState({});

  async function loadOrder() {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login untuk melihat detail pesanan.");
      return;
    }
    if (id) loadOrder();
  }, [id, isLoggedIn]);

  useEffect(() => {
    async function loadStatuses() {
      if (!order || !Array.isArray(order.items) || order.items.length === 0) return;
      const map = {};
      await Promise.all(order.items.map(async (it) => {
        const itemId = it.order_item_id ?? it.id;
        if (!itemId) return;
        try {
          const assign = await courierService.getAssignmentByOrderItem(itemId);
          map[itemId] = assign?.status ?? null;
        } catch (e) {
          map[itemId] = null;
        }
      }));
      setShippingStatuses(map);
    }
    loadStatuses();
  }, [order]);

  const items = order?.items || [];
  const status = order?.status || "pending";
  const orderId = order?.orderId ?? order?.id ?? id;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getItemSubtotal(item), 0), [items]);
  const total = Number(order?.total || subtotal);
  const canCancel = ["pending", "paid", "processing"].includes(status);
  const canConfirm = ["shipped", "delivered"].includes(status);

  const runOrderAction = async (action) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (action === "cancel") {
        await orderService.cancelOrder(orderId);
        setSuccess("Pesanan berhasil dibatalkan.");
      } else {
        await orderService.confirmOrder(orderId);
        setSuccess("Pesanan berhasil dikonfirmasi diterima.");
      }
      await loadOrder();
    } catch (err) {
      setError(err.message || "Gagal memperbarui status pesanan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/orders" className="text-sm font-semibold text-[#1A3C34]">
              Kembali ke pesanan
            </Link>
            <h1 className="text-2xl font-bold text-[#111827] mt-2">Detail Pesanan #{orderId}</h1>
          </div>
          {order && (
            <Badge variant={STATUS_VARIANT[status] || "default"}>
              {STATUS_LABELS[status] || status}
            </Badge>
          )}
        </div>

        {(error || success) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {error || success}
          </div>
        )}

        {loading ? (
          <Card className="py-12 text-center text-gray-500">Memuat detail pesanan...</Card>
        ) : !order ? (
          <Card className="py-12 text-center">
            <h2 className="text-lg font-bold text-[#111827]">Pesanan tidak ditemukan</h2>
            <p className="text-sm text-gray-500 mt-2">Cek kembali ID pesanan atau buka daftar pesanan.</p>
          </Card>
        ) : (
          <>
            {status === "pending" && (
              <Link href={`/payment/${orderId}`} className="block">
                <Button className="w-full">Bayar Sekarang</Button>
              </Link>
            )}

            <Card className="p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F1F5F9]">
                <h2 className="font-bold text-[#111827]">Produk Dipesan</h2>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {items.length === 0 ? (
                  <div className="p-5 text-sm text-gray-500">Tidak ada item pesanan.</div>
                ) : (
                  items.map((item, index) => (
                    <div key={item.order_item_id ?? item.id ?? index} className="p-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#111827]">
                          {item.product_name || item.product?.name || `Item #${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.store_name || item.store?.store_name || "Toko"} - x{item.qty || item.quantity || 1}
                        </p>
                        {shippingStatuses[item.order_item_id ?? item.id] && (
                          <div className="mt-2">
                            <Badge variant={
                              shippingStatuses[item.order_item_id ?? item.id] === 'sedang dikirim' ? 'info'
                              : shippingStatuses[item.order_item_id ?? item.id] === 'sampai di tujuan' ? 'success'
                              : shippingStatuses[item.order_item_id ?? item.id] === 'dikirim balik' ? 'danger'
                              : 'default'
                            }>
                              {shippingStatuses[item.order_item_id ?? item.id]}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-[#1A3C34]">{fmt(getItemSubtotal(item))}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {order.address && (
              <Card className="p-5">
                <h2 className="font-bold text-[#111827]">Alamat Pengiriman</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {order.address.address}, {order.address.city}
                </p>
              </Card>
            )}

            <Card className="p-5">
              <h2 className="font-bold text-[#111827] mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-[#111827]">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-[#1A3C34]">{fmt(total)}</span>
                </div>
              </div>
            </Card>

            {(canCancel || canConfirm) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canCancel && (
                  <Button type="button" variant="danger" loading={saving} onClick={() => runOrderAction("cancel")}>
                    Batalkan Pesanan
                  </Button>
                )}
                {canConfirm && (
                  <Button type="button" loading={saving} onClick={() => runOrderAction("confirm")}>
                    Konfirmasi Terima
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

