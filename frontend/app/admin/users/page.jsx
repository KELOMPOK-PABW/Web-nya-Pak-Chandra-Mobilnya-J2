"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

const ADMIN_MENUS = [
  { label: "Users",           href: "/admin/users",               },
  { label: "Seller Approval", href: "/admin/seller-applications", badge: "3" },
  { label: "Kategori",        href: "/admin/categories", },
  { label: "Kurir",           href: "/admin/couriers"},
  { label: "Produk",          href: "/admin/products"},
  { label: "E-Wallet",        href: "/admin/ewallet" },
];

const USERS_DUMMY = [
  { id: 1,  full_name: "Andi Saputra",   email: "andi@email.com",  role: "buyer",  status: "aktif",    created_at: "2025-01-05", phone: "081234567890" },
  { id: 2,  full_name: "Budi Rahmat",    email: "budi@email.com",  role: "seller", status: "aktif",    created_at: "2025-01-08", phone: "082345678901" },
  { id: 3,  full_name: "Citra Maharani", email: "citra@email.com", role: "buyer",  status: "aktif",    created_at: "2025-01-12", phone: "083456789012" },
  { id: 4,  full_name: "Dian Pertiwi",   email: "dian@email.com",  role: "seller", status: "nonaktif", created_at: "2025-01-15", phone: "084567890123" },
  { id: 5,  full_name: "Eko Wibowo",     email: "eko@email.com",   role: "buyer",  status: "aktif",    created_at: "2025-01-18", phone: "085678901234" },
  { id: 6,  full_name: "Fajar Nugroho",  email: "fajar@email.com", role: "kurir",  status: "aktif",    created_at: "2025-01-20", phone: "086789012345" },
  { id: 7,  full_name: "Gita Nuraini",   email: "gita@email.com",  role: "buyer",  status: "aktif",    created_at: "2025-01-22", phone: "087890123456" },
  { id: 8,  full_name: "Hadi Kusuma",    email: "hadi@email.com",  role: "seller", status: "aktif",    created_at: "2025-01-25", phone: "088901234567" },
  { id: 9,  full_name: "Indah Lestari",  email: "indah@email.com", role: "buyer",  status: "nonaktif", created_at: "2025-01-28", phone: "089012345678" },
  { id: 10, full_name: "Joko Santoso",   email: "joko@email.com",  role: "admin",  status: "aktif",    created_at: "2025-02-01", phone: "081122334455" },
];

const ROLE_STYLE = {
  buyer:  "bg-[#E0F2F1] text-[#0F6E56]",
  seller: "bg-[#FFF3E0] text-[#E65100]",
  kurir:  "bg-[#EDE7F6] text-[#5E35B1]",
  admin:  "bg-[#FEF2F2] text-[#C62828]",
};

const STATUS_STYLE = {
  aktif:    "bg-[#E8F5E9] text-[#2E7D32]",
  nonaktif: "bg-[#F5F5F5] text-[#757575]",
};

export default function AdminUsersPage() {
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = USERS_DUMMY.filter(u => {
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter   || u.role   === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]"
      style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Admin Panel" subtitle="Administrator" menus={ADMIN_MENUS} />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Daftar Pengguna</h1>
            <p className="text-sm text-gray-500 mt-1">{USERS_DUMMY.length} pengguna terdaftar</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total User", value: USERS_DUMMY.length,                                 color: "#0F6E56" },
              { label: "Buyer",      value: USERS_DUMMY.filter(u=>u.role==="buyer").length,      color: "#2E7D32" },
              { label: "Seller",     value: USERS_DUMMY.filter(u=>u.role==="seller").length,     color: "#E65100" },
              { label: "Nonaktif",   value: USERS_DUMMY.filter(u=>u.status==="nonaktif").length, color: "#C62828" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl p-4 border border-[#EBEBEB]">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
            {/* Filter bar */}
            <div className="flex gap-3 px-5 py-3 border-b border-[#F3F4F6]">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB]
                    text-sm focus:outline-none focus:border-[#1A3C34]"
                />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="h-9 px-3 border border-[#E5E7EB] rounded-lg bg-white text-sm
                  text-gray-500 focus:outline-none focus:border-[#1A3C34]">
                <option value="">Semua Role</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="kurir">Kurir</option>
                <option value="admin">Admin</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="h-9 px-3 border border-[#E5E7EB] rounded-lg bg-white text-sm
                  text-gray-500 focus:outline-none focus:border-[#1A3C34]">
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            {/* Table */}
            <table className="w-full text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#F3F4F6]">
                <tr>
                  {["#","Nama","Email","No. HP","Role","Status","Bergabung","Aksi"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold
                      text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-b border-[#F9FAFB] hover:bg-[#FAFFF9] transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center
                          bg-[#E0F2F1] text-[#1A3C34] font-bold text-xs flex-shrink-0">
                          {u.full_name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#1A1A1A]">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[u.role]}`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[u.status]}`}>
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.created_at}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`}
                        className="text-xs font-semibold text-[#1A3C34] px-3 py-1.5 border
                          border-[#1A3C34] rounded-lg hover:bg-[#E0F2F1] transition-colors">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <p className="text-3xl mb-2">👥</p>
                <p className="font-medium">Tidak ada pengguna ditemukan</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}