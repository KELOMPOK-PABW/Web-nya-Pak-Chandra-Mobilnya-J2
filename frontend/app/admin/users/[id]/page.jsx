"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

const ADMIN_MENUS = [
  { label: "Users",           href: "/admin/users",  },
  { label: "Seller Approval", href: "/admin/seller-applications", badge: "3" },
  { label: "Kategori",        href: "/admin/categories",  },
  { label: "Kurir",           href: "/admin/couriers",     },
  { label: "Produk",          href: "/admin/products",          },
  { label: "E-Wallet",        href: "/admin/ewallet",           },
];

// Data dummy per user — nanti diganti fetch GET /users/{id}
const USERS_DETAIL = {
  1: {
    id: 1, full_name: "Andi Saputra", email: "andi@email.com",
    phone: "081234567890", role: "buyer", status: "aktif",
    created_at: "2025-01-05", address: "Jl. Merdeka No. 10, Jakarta",
    wallet_balance: 250000,
    orders: [
      { id: "ORD-001", date: "2025-02-10", total: 249000,  status: "Selesai" },
      { id: "ORD-002", date: "2025-03-05", total: 389000,  status: "Dikirim" },
      { id: "ORD-003", date: "2025-04-01", total: 185000,  status: "Dibatalkan" },
    ],
    reviews: [
      { id: 1, product: "Sneaker Pro",  rating: 5, comment: "Bagus banget!", date: "2025-02-12" },
      { id: 2, product: "Tas Kulit",    rating: 4, comment: "Oke",           date: "2025-03-08" },
    ],
  },
  2: {
    id: 2, full_name: "Budi Rahmat", email: "budi@email.com",
    phone: "082345678901", role: "seller", status: "aktif",
    created_at: "2025-01-08", address: "Jl. Sudirman No. 5, Surabaya",
    wallet_balance: 1500000,
    orders: [],
    reviews: [],
  },
};

const ROLE_STYLE = {
  buyer:  "bg-[#E0F2F1] text-[#0F6E56]",
  seller: "bg-[#FFF3E0] text-[#E65100]",
  kurir:  "bg-[#EDE7F6] text-[#5E35B1]",
  admin:  "bg-[#FEF2F2] text-[#C62828]",
};

const STATUS_ORDER = {
  Selesai:    "bg-[#E0F2F1] text-[#0F6E56]",
  Dikirim:    "bg-[#FFF3E0] text-[#E65100]",
  Dibatalkan: "bg-[#FEF2F2] text-[#DC2626]",
  Diproses:   "bg-[#FFF3E0] text-[#E65100]",
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const user = USERS_DETAIL[id] ?? {
    id, full_name: "User #" + id, email: "-", phone: "-",
    role: "buyer", status: "aktif", created_at: "-", address: "-",
    wallet_balance: 0, orders: [], reviews: [],
  };

  const [activeTab, setActiveTab] = useState("info");

  const initials = user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const TABS = [
    { key: "info",    label: "Info Akun" },
    { key: "orders",  label: `Pesanan (${user.orders.length})` },
    { key: "reviews", label: `Ulasan (${user.reviews.length})` },
    { key: "wallet",  label: "E-Wallet" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]"
      style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Admin Panel" subtitle="Administrator" menus={ADMIN_MENUS} />

        <main className="flex-1 p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/admin/users" className="hover:text-[#1A3C34]">Users</Link>
            <span>/</span>
            <span className="text-[#1A1A1A] font-medium">{user.full_name}</span>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] p-6 mb-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold
              text-xl text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#1A3C34,#4DB6AC)" }}>
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-[#1A1A1A]">{user.full_name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[user.role]}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user.status === "aktif" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F5F5F5] text-[#757575]"
                }`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{user.email} · {user.phone}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Bergabung</p>
              <p className="text-sm font-semibold text-[#1A1A1A]">{user.created_at}</p>
              <p className="text-xs text-gray-400 mt-2">ID Pengguna</p>
              <p className="text-sm font-semibold text-[#1A3C34]">#{String(user.id).padStart(4,"0")}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
            <div className="flex border-b border-[#E5E7EB] px-4">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-5 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === t.key
                      ? "border-[#1A3C34] text-[#1A3C34] font-bold"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Tab: Info Akun */}
              {activeTab === "info" && (
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Nama Lengkap",    value: user.full_name },
                    { label: "Email",           value: user.email },
                    { label: "No. HP",          value: user.phone },
                    { label: "Role",            value: user.role },
                    { label: "Status Akun",     value: user.status },
                    { label: "Tanggal Daftar",  value: user.created_at },
                    { label: "Alamat",          value: user.address },
                    { label: "Saldo E-Wallet",  value: "Rp " + user.wallet_balance.toLocaleString("id-ID") },
                  ].map(f => (
                    <div key={f.label} className="border-b border-[#F9FAFB] pb-3">
                      <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Pesanan */}
              {activeTab === "orders" && (
                user.orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">🛒</p>
                    <p>Belum ada pesanan</p>
                  </div>
                ) : (
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#FAFAFA]">
                      <tr>
                        {["ID Pesanan","Tanggal","Total","Status"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-bold
                            text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {user.orders.map(o => (
                        <tr key={o.id} className="border-b border-[#F9FAFB]">
                          <td className="px-4 py-3 font-medium text-[#1A3C34]">#{o.id}</td>
                          <td className="px-4 py-3 text-gray-500">{o.date}</td>
                          <td className="px-4 py-3 font-semibold">Rp {o.total.toLocaleString("id-ID")}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                              ${STATUS_ORDER[o.status] ?? "bg-gray-100 text-gray-500"}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Tab: Ulasan */}
              {activeTab === "reviews" && (
                user.reviews.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">⭐</p>
                    <p>Belum ada ulasan</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {user.reviews.map(r => (
                      <div key={r.id} className="p-4 border border-[#F3F4F6] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm text-[#1A1A1A]">{r.product}</p>
                          <p className="text-xs text-gray-400">{r.date}</p>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < r.rating ? "text-amber-400" : "text-gray-200"}>★</span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab: E-Wallet */}
              {activeTab === "wallet" && (
                <div>
                  <div className="bg-[#1A3C34] rounded-xl p-6 text-white mb-6 max-w-sm">
                    <p className="text-xs opacity-70 mb-1">Saldo E-Wallet</p>
                    <p className="text-3xl font-bold">
                      Rp {user.wallet_balance.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs opacity-60 mt-2">{user.full_name}</p>
                  </div>
                  <div className="py-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">💳</p>
                    <p className="text-sm">Riwayat transaksi tersedia setelah integrasi API</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}