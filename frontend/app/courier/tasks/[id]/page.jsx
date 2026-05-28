"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

const COURIER_MENUS = [
  { label: "Tugas Pengiriman", href: "/courier/tasks", icon: "🚚" },
];

// Dummy data — nanti: GET /courier/assignments/{id}
const TASKS_DETAIL = {
  1: {
    assignment_id: 1,
    order_item_id: 101,
    product_name: "Sepatu Sneaker Urban X1",
    product_variant: "Hitam / 42",
    product_qty: 1,
    pickup_address: "Toko Urban Kicks, Jl. Sudirman No. 10, Jakarta Pusat 10220",
    delivery_address: "Jl. Merpati No. 12, RT 03/RW 05, Bandung, Jawa Barat 40132",
    status: "menunggu kurir",
    buyer_name: "Budi Santoso",
    buyer_phone: "0812-3456-7890",
    store_name: "Urban Kicks Store",
    store_phone: "0811-2233-4455",
    assigned_at: "2024-05-03T09:00:00Z",
    timeline: [
      { label: "Pesanan dibuat",     time: "2024-05-03T08:00:00Z", done: true  },
      { label: "Kurir ditugaskan",   time: "2024-05-03T09:00:00Z", done: true  },
      { label: "Barang di-pickup",   time: null,                   done: false },
      { label: "Sedang dikirim",     time: null,                   done: false },
      { label: "Sampai di tujuan",   time: null,                   done: false },
    ],
  },
  2: {
    assignment_id: 2,
    order_item_id: 102,
    product_name: "Tas Kulit Premium Casual",
    product_variant: "Coklat Tua",
    product_qty: 2,
    pickup_address: "Leather House, Jl. Gatot Subroto No. 5, Jakarta Selatan",
    delivery_address: "Jl. Asia Afrika No. 55, Surabaya, Jawa Timur 60271",
    status: "sedang dikirim",
    buyer_name: "Citra Maharani",
    buyer_phone: "0813-4567-8901",
    store_name: "Leather House ID",
    store_phone: "0812-3344-5566",
    assigned_at: "2024-05-02T14:00:00Z",
    timeline: [
      { label: "Pesanan dibuat",     time: "2024-05-02T13:00:00Z", done: true  },
      { label: "Kurir ditugaskan",   time: "2024-05-02T14:00:00Z", done: true  },
      { label: "Barang di-pickup",   time: "2024-05-02T15:00:00Z", done: true  },
      { label: "Sedang dikirim",     time: "2024-05-02T15:30:00Z", done: true  },
      { label: "Sampai di tujuan",   time: null,                   done: false },
    ],
  },
};

const STATUS_CONFIG = {
  "menunggu kurir":   { label: "Menunggu Pickup", color: "#F59E0B", bg: "#FEF3C7" },
  "sedang dikirim":   { label: "Sedang Dikirim",  color: "#3B82F6", bg: "#DBEAFE" },
  "sampai di tujuan": { label: "Sampai Tujuan",   color: "#10B981", bg: "#D1FAE5" },
  "dikirim balik":    { label: "Dikembalikan",     color: "#EF4444", bg: "#FEE2E2" },
};

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden mb-4"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <div className="px-5 py-3 border-b border-[#F3F4F6] bg-[#FAFAFA]">
        <span className="font-bold text-sm text-[#0A0A0A]">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}

export default function CourierTaskDetailPage() {
  const { id } = useParams();
  const task = TASKS_DETAIL[id];
  const [status, setStatus] = useState(task?.status);
  const [confirmAction, setConfirmAction] = useState(null);

  if (!task) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div className="max-w-lg mx-auto mt-20 text-center px-6">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Tugas Tidak Ditemukan</h1>
          <Link href="/courier/tasks"
            className="inline-block mt-4 px-6 py-2.5 bg-[#1A3C34] text-white rounded-xl text-sm font-bold">
            Kembali ke Daftar Tugas
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#6B7280", bg: "#F5F5F5" };

  const handleConfirm = () => {
    // nanti: PUT /courier/order-items/{id}/pickup atau /deliver
    const next = {
      "menunggu kurir": "sedang dikirim",
      "sedang dikirim": "sampai di tujuan",
    };
    if (confirmAction === "return") {
      setStatus("dikirim balik");
    } else {
      setStatus(next[status] ?? status);
    }
    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar menus={COURIER_MENUS} />

        <main className="flex-1 p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/courier/tasks" className="hover:text-[#1A3C34]">Tugas</Link>
            <span>/</span>
            <span className="text-[#1A1A1A] font-medium">Detail #{task.assignment_id}</span>
          </div>

          {/* Header card */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] p-5 mb-4 flex items-center justify-between"
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-[#1A1A1A]">Tugas #{task.assignment_id}</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">Ditugaskan: {formatDate(task.assigned_at)}</p>
            </div>
            <div className="flex gap-2">
              {status === "menunggu kurir" && (
                <button onClick={() => setConfirmAction("pickup")}
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl"
                  style={{ background: "#1A3C34" }}>
                   Pickup Barang
                </button>
              )}
              {status === "sedang dikirim" && (
                <>
                  <button onClick={() => setConfirmAction("return")}
                    className="px-4 py-2 text-sm font-semibold border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                    ↩Kembalikan
                  </button>
                  <button onClick={() => setConfirmAction("deliver")}
                    className="px-4 py-2 text-sm font-bold text-white rounded-xl"
                    style={{ background: "#1A3C34" }}>
                    Tandai Terkirim
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left */}
            <div>
              <SectionCard title="📦 Info Produk">
                <InfoRow label="Nama Produk" value={task.product_name} />
                <InfoRow label="Varian"      value={task.product_variant} />
                <InfoRow label="Jumlah"      value={`${task.product_qty} pcs`} />
              </SectionCard>

              <SectionCard title="📍 Alamat">
                <InfoRow label="Pickup dari"     value={task.pickup_address} />
                <InfoRow label="Antar ke"        value={task.delivery_address} />
              </SectionCard>
            </div>

            {/* Right */}
            <div>
              <SectionCard title="👤 Info Penerima">
                <InfoRow label="Nama"   value={task.buyer_name} />
                <InfoRow label="Telepon" value={task.buyer_phone} />
              </SectionCard>

              <SectionCard title="🏪 Info Toko">
                <InfoRow label="Nama Toko" value={task.store_name} />
                <InfoRow label="Telepon"   value={task.store_phone} />
              </SectionCard>

              {/* Timeline */}
              <SectionCard title="📋 Timeline">
                {task.timeline.map((step, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {i < task.timeline.length - 1 && (
                      <div className="absolute left-[9px] top-5 w-0.5 h-full"
                        style={{ background: step.done ? "#1A3C34" : "#E5E7EB" }} />
                    )}
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: step.done ? "#1A3C34" : "#E5E7EB" }}>
                      {step.done && (
                        <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium" style={{ color: step.done ? "#0A0A0A" : "#9CA3AF" }}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(step.time)}</p>
                    </div>
                  </div>
                ))}
              </SectionCard>
            </div>
          </div>
        </main>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
          onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">
              {confirmAction === "return" ? "↩️" : confirmAction === "pickup" ? "📦" : "✅"}
            </div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">
              {confirmAction === "return"  ? "Kembalikan Paket?"    :
               confirmAction === "pickup"  ? "Konfirmasi Pickup?"   :
               "Tandai Sudah Terkirim?"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">{task.product_name}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 h-10 rounded-lg border border-[#E5E7EB] text-sm font-semibold text-gray-500">
                Batal
              </button>
              <button onClick={handleConfirm}
                className="flex-1 h-10 rounded-lg text-sm font-bold text-white"
                style={{ background: confirmAction === "return" ? "#EF4444" : "#1A3C34" }}>
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}