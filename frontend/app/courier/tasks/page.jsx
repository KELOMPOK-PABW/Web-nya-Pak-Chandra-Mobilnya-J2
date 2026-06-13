"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { courierService } from "@/services/courierService";
import normalizeStatus from "@/utils/normalizeStatus";

const COURIER_MENUS = [
  { label: "Dashboard", href: "/courier/dashboard" },
  { label: "Tugas Pengiriman", href: "/courier/tasks", icon: "🚚" },
];

// Dummy data — nanti: GET /courier/task
const TASKS_DUMMY = [
  {
    assignment_id: 1,
    order_item_id: 101,
    product_name: "Sepatu Sneaker Urban X1",
    pickup_address: "Toko Urban Kicks, Jl. Sudirman No. 10, Jakarta",
    delivery_address: "Jl. Merpati No. 12, RT 03/RW 05, Bandung",
    status: "menunggu kurir",
    buyer_name: "Budi Santoso",
    buyer_phone: "0812-3456-7890",
    store_name: "Urban Kicks Store",
    created_at: "2024-05-03T09:00:00Z",
  },
  {
    assignment_id: 2,
    order_item_id: 102,
    product_name: "Tas Kulit Premium Casual",
    pickup_address: "Leather House, Jl. Gatot Subroto No. 5, Jakarta",
    delivery_address: "Jl. Asia Afrika No. 55, Surabaya",
    status: "sedang dikirim",
    buyer_name: "Citra Maharani",
    buyer_phone: "0813-4567-8901",
    store_name: "Leather House ID",
    created_at: "2024-05-02T14:00:00Z",
  },
  {
    assignment_id: 3,
    order_item_id: 103,
    product_name: "Earphone TWS NoisePro X",
    pickup_address: "Gadget World, Jl. Thamrin No. 20, Jakarta",
    delivery_address: "Jl. Diponegoro No. 8, Yogyakarta",
    status: "sampai di tujuan",
    buyer_name: "Eko Wibowo",
    buyer_phone: "0814-5678-9012",
    store_name: "Gadget World",
    created_at: "2024-05-01T10:00:00Z",
  },
];

const STATUS_CONFIG = {
  "menunggu kurir":  { label: "Menunggu Pickup", color: "#F59E0B", bg: "#FEF3C7", next: "Pickup Barang",   action: "pickup"  },
  "sedang dikirim":  { label: "Sedang Dikirim",  color: "#3B82F6", bg: "#DBEAFE", next: "Tandai Terkirim", action: "deliver" },
  "sampai di tujuan":{ label: "Sampai Tujuan",   color: "#10B981", bg: "#D1FAE5", next: null,              action: null      },
  "dikirim balik":   { label: "Dikembalikan",     color: "#EF4444", bg: "#FEE2E2", next: null,              action: null      },
};

const TABS = [
  { id: "all",               label: "Semua" },
  { id: "menunggu kurir",    label: "Menunggu" },
  { id: "sedang dikirim",    label: "Dikirim" },
  { id: "sampai di tujuan",  label: "Selesai" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function CourierTasksPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [tasks, setTasks] = useState(TASKS_DUMMY);
  const [confirmModal, setConfirmModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadTasks() {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await courierService.getTasks();
      const normalized = (data.length > 0 ? data : TASKS_DUMMY).map(t => ({ ...t, status: normalizeStatus(t.status) }));
      setTasks(normalized);
    } catch (err) {
      setTasks(TASKS_DUMMY.map(t => ({ ...t, status: normalizeStatus(t.status) })));
      setMessage(err.message || "Menampilkan data contoh karena API tugas kurir belum tersedia.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filtered = tasks.filter(t =>
    activeTab === "all" || t.status === activeTab
  );

  const handleAction = async (task, action) => {
    const statusMap = {
      pickup:  "sedang dikirim",
      deliver: "sampai di tujuan",
      return:  "dikirim balik",
    };

    setSavingId(task.assignment_id);
    setMessage("");
    try {
      if (action === "pickup") await courierService.pickupOrderItem(task.order_item_id);
      if (action === "deliver") await courierService.deliverOrderItem(task.order_item_id);
      if (action === "return") await courierService.returnOrderItem(task.order_item_id);
      setTasks(prev => prev.map(t =>
        t.assignment_id === task.assignment_id
          ? { ...t, status: statusMap[action] }
          : t
      ));
      await loadTasks();
    } catch (err) {
      setMessage(err.message || "Gagal memperbarui status tugas kurir.");
    } finally {
      setSavingId(null);
      setConfirmModal(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]"
      style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar menus={COURIER_MENUS} />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Tugas Pengiriman</h1>
            <p className="text-sm text-gray-500 mt-1">{isLoading ? "Memuat tugas..." : `${tasks.length} tugas aktif`}</p>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Menunggu Pickup", value: tasks.filter(t => t.status === "menunggu kurir").length,   color: "#F59E0B" },
              { label: "Sedang Dikirim",  value: tasks.filter(t => t.status === "sedang dikirim").length,   color: "#3B82F6" },
              { label: "Selesai",         value: tasks.filter(t => t.status === "sampai di tujuan").length, color: "#10B981" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl p-4 border border-[#EBEBEB]">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? "#1A3C34" : "white",
                  color: activeTab === tab.id ? "white" : "#6B7280",
                  border: activeTab === tab.id ? "none" : "1.5px solid #E5E7EB",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task cards */}
          <div className="flex flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#EBEBEB] py-16 text-center text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="font-medium">Tidak ada tugas</p>
              </div>
            ) : (
              filtered.map(task => {
                const cfg = STATUS_CONFIG[task.status] ?? { label: task.status, color: "#6B7280", bg: "#F5F5F5" };
                return (
                  <div key={task.assignment_id}
                    className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6] bg-[#FAFAFA]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{task.assignment_id}</span>
                        <span className="text-xs font-semibold text-gray-600">· {task.store_name}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4">
                      <p className="font-semibold text-[#1A1A1A] mb-3">{task.product_name}</p>

                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">📦</span>
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Pickup</p>
                            <p className="text-sm text-gray-600">{task.pickup_address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">📍</span>
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Tujuan</p>
                            <p className="text-sm text-gray-600">{task.delivery_address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">👤</span>
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Penerima</p>
                            <p className="text-sm text-gray-600">{task.buyer_name} · {task.buyer_phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{formatDate(task.created_at)}</p>
                        <div className="flex gap-2">
                          <Link href={`/courier/tasks/${task.assignment_id}`}
                            className="px-3 py-1.5 text-xs font-semibold border border-[#E5E7EB] rounded-lg text-gray-600 hover:border-[#1A3C34] hover:text-[#1A3C34] transition-colors">
                            Detail
                          </Link>
                          {cfg.next && (
                            <Button
                              type="button"
                              size="sm"
                              loading={savingId === task.assignment_id}
                              onClick={() => setConfirmModal(task)}
                            >
                              {cfg.next}
                            </Button>
                          )}
                          {task.status === "sedang dikirim" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              loading={savingId === task.assignment_id}
                              onClick={() => setConfirmModal({ ...task, forceAction: "return" })}
                            >
                              Kembalikan
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
          onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">
                {confirmModal.forceAction === "return" ? "↩️" : "🚚"}
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {confirmModal.forceAction === "return"
                  ? "Kembalikan Paket?"
                  : confirmModal.status === "menunggu kurir"
                    ? "Konfirmasi Pickup?"
                    : "Tandai Sudah Terkirim?"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{confirmModal.product_name}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 h-10 rounded-lg border border-[#E5E7EB] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                onClick={() => handleAction(
                  confirmModal,
                  confirmModal.forceAction ?? STATUS_CONFIG[confirmModal.status]?.action
                )}
                className="flex-1 h-10 rounded-lg text-sm font-bold text-white transition-colors"
                style={{ background: confirmModal.forceAction === "return" ? "#EF4444" : "#1A3C34" }}>
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
