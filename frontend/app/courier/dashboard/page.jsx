"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const TASKS = [
  {
    assignment_id: 1,
    product_name: "Sepatu Sneaker Urban X1",
    pickup_address: "Toko Urban Kicks, Jl. Sudirman No. 10, Jakarta",
    delivery_address: "Jl. Merpati No. 12, Bandung",
    status: "menunggu kurir",
    buyer_name: "Budi Santoso",
    store_name: "Urban Kicks Store",
    distance_km: 8.4,
    eta: "10:30",
    created_at: "2026-06-05T08:20:00+08:00",
  },
  {
    assignment_id: 2,
    product_name: "Tas Kulit Premium Casual",
    pickup_address: "Leather House, Jl. Gatot Subroto No. 5, Jakarta",
    delivery_address: "Jl. Asia Afrika No. 55, Surabaya",
    status: "sedang dikirim",
    buyer_name: "Citra Maharani",
    store_name: "Leather House ID",
    distance_km: 14.2,
    eta: "13:15",
    created_at: "2026-06-05T07:45:00+08:00",
  },
  {
    assignment_id: 3,
    product_name: "Earphone TWS NoisePro X",
    pickup_address: "Gadget World, Jl. Thamrin No. 20, Jakarta",
    delivery_address: "Jl. Diponegoro No. 8, Yogyakarta",
    status: "sampai di tujuan",
    buyer_name: "Eko Wibowo",
    store_name: "Gadget World",
    distance_km: 6.8,
    eta: "Selesai",
    created_at: "2026-06-05T06:30:00+08:00",
  },
  {
    assignment_id: 4,
    product_name: "Jaket Outdoor Waterproof",
    pickup_address: "Urban Trek, Jl. Melati No. 7, Jakarta",
    delivery_address: "Jl. Mawar No. 18, Bekasi",
    status: "menunggu kurir",
    buyer_name: "Nadia Putri",
    store_name: "Urban Trek",
    distance_km: 11.6,
    eta: "15:40",
    created_at: "2026-06-05T09:10:00+08:00",
  },
];

const STATUS_META = {
  "menunggu kurir": { label: "Menunggu Pickup", variant: "warning" },
  "sedang dikirim": { label: "Sedang Dikirim", variant: "info" },
  "sampai di tujuan": { label: "Selesai", variant: "success" },
  "dikirim balik": { label: "Dikembalikan", variant: "danger" },
};

function formatDate(value) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CourierDashboardPage() {
  const [tasks, setTasks] = useState(TASKS);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadTasks() {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await courierService.getTasks();
      setTasks(data.length > 0 ? data : TASKS);
    } catch (err) {
      setTasks(TASKS);
      setMessage(err.message || "Menampilkan data contoh karena API tugas kurir belum tersedia.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const summary = useMemo(() => {
    const waiting = tasks.filter((item) => item.status === "menunggu kurir").length;
    const delivering = tasks.filter((item) => item.status === "sedang dikirim").length;
    const done = tasks.filter((item) => item.status === "sampai di tujuan").length;
    const totalDistance = tasks.reduce((sum, item) => sum + Number(item.distance_km || 0), 0);

    return { waiting, delivering, done, total: tasks.length, totalDistance };
  }, [tasks]);

  const nextTasks = tasks.filter((item) => item.status !== "sampai di tujuan").slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Kurir Panel" subtitle="Delivery Center" menus={COURIER_MENUS} />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1A3C34]">Dashboard Kurir</p>
              <h1 className="text-2xl font-bold text-[#111827] mt-1">Ringkasan Pengiriman Hari Ini</h1>
              <p className="text-sm text-gray-500 mt-1">Pantau pickup, pengantaran aktif, dan performa rute dalam satu layar.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/courier/tasks">
                <Button type="button">Lihat Semua Tugas</Button>
              </Link>
              <Button type="button" variant="outline" loading={isLoading} onClick={loadTasks}>Refresh</Button>
            </div>
          </section>

          {message && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Tugas", value: summary.total, hint: "Hari ini", color: "#1A3C34" },
              { label: "Menunggu Pickup", value: summary.waiting, hint: "Perlu diambil", color: "#CA8A04" },
              { label: "Sedang Dikirim", value: summary.delivering, hint: "Dalam perjalanan", color: "#2563EB" },
              { label: "Jarak Rute", value: `${summary.totalDistance.toFixed(1)} km`, hint: "Estimasi total", color: "#16A34A" },
            ].map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-3xl font-bold mt-2" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.hint}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-5 border-b border-[#ECEFF3]">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">Tugas Prioritas</h2>
                  <p className="text-sm text-gray-500">Urutan tugas yang perlu ditangani lebih dulu.</p>
                </div>
                <Badge variant="warning">{summary.waiting + summary.delivering} aktif</Badge>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {nextTasks.map((task) => {
                  const status = STATUS_META[task.status] ?? { label: task.status, variant: "default" };
                  return (
                    <article key={task.assignment_id} className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#111827]">#{task.assignment_id} - {task.product_name}</h3>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{task.store_name} ke {task.buyer_name}</p>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                              <p className="text-xs uppercase font-semibold text-gray-400">Pickup</p>
                              <p className="text-[#374151] mt-1">{task.pickup_address}</p>
                            </div>
                            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                              <p className="text-xs uppercase font-semibold text-gray-400">Tujuan</p>
                              <p className="text-[#374151] mt-1">{task.delivery_address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:text-right shrink-0">
                          <p className="text-sm font-bold text-[#1A3C34]">{task.distance_km} km</p>
                          <p className="text-xs text-gray-500 mt-1">ETA {task.eta}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(task.created_at)}</p>
                          <Link href={`/courier/tasks/${task.assignment_id}`} className="inline-flex mt-3">
                            <Button type="button" size="sm" variant="outline">Detail</Button>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-[#111827]">Performa Kurir</h2>
                <div className="mt-5 space-y-4">
                  {[
                    { label: "Tugas Selesai", value: `${summary.done}/${summary.total}`, width: `${(summary.done / summary.total) * 100}%` },
                    { label: "Pickup Tepat Waktu", value: "92%", width: "92%" },
                    { label: "Rating Pengiriman", value: "4.8/5", width: "96%" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-[#374151]">{item.label}</span>
                        <span className="text-gray-500">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                        <div className="h-full rounded-full bg-[#1A3C34]" style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-[#111827]">Catatan Operasional</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    Ambil paket menunggu pickup sebelum pukul 11:00 agar rute siang tidak tertunda.
                  </div>
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    Pastikan bukti serah terima diunggah setelah paket sampai tujuan.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
