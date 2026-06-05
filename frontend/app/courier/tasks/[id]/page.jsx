"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { courierService } from "@/services/courierService";

const COURIER_MENUS = [
  { label: "Dashboard", href: "/courier/dashboard" },
  { label: "Tugas Pengiriman", href: "/courier/tasks" },
];

const FALLBACK_TASK = {
  assignment_id: 1,
  courier_id: 3,
  order_item_id: 101,
  product_name: "Sepatu Sneaker Urban X1",
  product_variant: "Hitam / 42",
  product_qty: 1,
  pickup_address: "Toko Urban Kicks, Jl. Sudirman No. 10, Jakarta",
  delivery_address: "Jl. Merpati No. 12, Bandung",
  status: "menunggu kurir",
  buyer_name: "Budi Santoso",
  buyer_phone: "0812-3456-7890",
  store_name: "Urban Kicks Store",
  store_phone: "0811-2233-4455",
  assigned_at: "2026-06-05T09:00:00+08:00",
};

const STATUS_META = {
  "menunggu kurir": { label: "Menunggu Pickup", variant: "warning" },
  "sedang dikirim": { label: "Sedang Dikirim", variant: "info" },
  "sampai di tujuan": { label: "Sampai Tujuan", variant: "success" },
  "dikirim balik": { label: "Dikirim Balik", variant: "danger" },
  "menunggu penjual": { label: "Menunggu Penjual", variant: "warning" },
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <p className="text-xs uppercase font-semibold text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-[#374151] mt-1">{value || "-"}</p>
    </div>
  );
}

export default function CourierTaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState(FALLBACK_TASK);
  const [isLoading, setIsLoading] = useState(true);
  const [savingAction, setSavingAction] = useState("");
  const [message, setMessage] = useState("");

  async function loadTask() {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await courierService.getAssignment(id);
      setTask(data);
    } catch (err) {
      setTask((prev) => ({ ...prev, assignment_id: id || FALLBACK_TASK.assignment_id }));
      setMessage(err.message || "Menampilkan data contoh karena API detail assignment belum tersedia.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadTask();
  }, [id]);

  const updateStatus = async (action) => {
    const statusMap = {
      pickup: "sedang dikirim",
      deliver: "sampai di tujuan",
      return: "dikirim balik",
      "return-to-seller": "menunggu penjual",
    };

    setSavingAction(action);
    setMessage("");
    try {
      if (action === "pickup") await courierService.pickupOrderItem(task.order_item_id);
      if (action === "deliver") await courierService.deliverOrderItem(task.order_item_id);
      if (action === "return") await courierService.returnOrderItem(task.order_item_id);
      if (action === "return-to-seller") await courierService.returnToSeller(task.order_item_id);

      setTask((prev) => ({ ...prev, status: statusMap[action] ?? prev.status }));
      await loadTask();
    } catch (err) {
      setMessage(err.message || "Gagal memperbarui status tugas.");
    } finally {
      setSavingAction("");
    }
  };

  const status = STATUS_META[task.status] ?? { label: task.status, variant: "default" };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Kurir Panel" subtitle="Delivery Center" menus={COURIER_MENUS} />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/courier/tasks" className="text-sm font-semibold text-[#1A3C34]">
                Kembali ke tugas
              </Link>
              <h1 className="text-2xl font-bold text-[#111827] mt-2">Detail Tugas #{task.assignment_id}</h1>
              <p className="text-sm text-gray-500 mt-1">Order item #{task.order_item_id} - Ditugaskan {formatDate(task.assigned_at)}</p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {message && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-500">
              Memuat detail assignment...
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-[#111827] mb-4">Informasi Paket</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailBox label="Produk" value={task.product_name} />
                  <DetailBox label="Jumlah" value={task.product_qty ? `${task.product_qty} pcs` : "-"} />
                  <DetailBox label="Toko" value={task.store_name} />
                  <DetailBox label="Telepon Toko" value={task.store_phone} />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-[#111827] mb-4">Alamat Pengiriman</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailBox label="Pickup" value={task.pickup_address} />
                  <DetailBox label="Tujuan" value={task.delivery_address} />
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-[#111827] mb-4">Penerima</h2>
                <div className="grid grid-cols-1 gap-4">
                  <DetailBox label="Nama" value={task.buyer_name} />
                  <DetailBox label="Telepon" value={task.buyer_phone} />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-[#111827] mb-4">Aksi Kurir</h2>
                <div className="flex flex-col gap-3">
                  {task.status === "menunggu kurir" && (
                    <Button type="button" loading={savingAction === "pickup"} onClick={() => updateStatus("pickup")}>
                      Pickup Barang
                    </Button>
                  )}
                  {task.status === "sedang dikirim" && (
                    <>
                      <Button type="button" loading={savingAction === "deliver"} onClick={() => updateStatus("deliver")}>
                        Tandai Sampai Tujuan
                      </Button>
                      <Button type="button" variant="danger" loading={savingAction === "return"} onClick={() => updateStatus("return")}>
                        Kembalikan Paket
                      </Button>
                    </>
                  )}
                  {task.status === "dikirim balik" && (
                    <Button type="button" variant="outline" loading={savingAction === "return-to-seller"} onClick={() => updateStatus("return-to-seller")}>
                      Kembalikan ke Penjual
                    </Button>
                  )}
                  {!["menunggu kurir", "sedang dikirim", "dikirim balik"].includes(task.status) && (
                    <p className="text-sm text-gray-500">Tidak ada aksi lanjutan untuk status ini.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

