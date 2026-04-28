"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const ROLES = [
  { value: "buyer", label: "Pembeli" },
  { value: "seller", label: "Penjual" },
  { value: "kurir", label: "Kurir" },
];

export default function EditProfilePage() {
  const [form, setForm] = useState({
    username: "rahmi",
    full_name: "Rahmi Syafitri",
    email: "rahmi@mail.com",
    phone: "08123456789",
    role: "buyer",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.full_name || !form.email || !form.phone) {
      setError("Semua field wajib diisi.");
      return;
    }
  };

  const initials = form.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Edit Profil</h1>
            <p className="text-sm text-[#777]">Perbarui data akun yang tersimpan.</p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-xl border border-[#E0DDD6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1] transition-colors"
          >
            Kembali
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="bg-white border border-[#E8E8E8] rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1A3C34] text-white flex items-center justify-center text-lg font-semibold">
                {initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1A1A1A]">{form.full_name}</p>
                <p className="text-sm text-[#777]">@{form.username}</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
              <p className="text-xs text-[#888]">ID Akun</p>
              <p className="text-sm font-medium text-[#1A1A1A]">usr_123</p>
            </div>
          </aside>

          <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl px-4 py-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: "16px" }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9"/>
                  <path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                <p style={{ fontSize: "14px", color: "#DC2626", margin: 0, fontFamily: "inherit" }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Nama lengkap</label>
                <input
                  type="text" name="full_name" value={form.full_name} onChange={handleChange}
                  placeholder="Masukkan nama lengkap" autoComplete="name"
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  style={{ fontFamily: "inherit", height: "46px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Username</label>
                <input
                  type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="Masukkan username" autoComplete="username"
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  style={{ fontFamily: "inherit", height: "46px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Email</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="nama@email.com" autoComplete="email"
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  style={{ fontFamily: "inherit", height: "46px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Nomor HP</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="Masukkan nomor HP" autoComplete="tel"
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  style={{ fontFamily: "inherit", height: "46px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Role</label>
                <input
                  type="text"
                  value={ROLES.find((r) => r.value === form.role)?.label || ""}
                  readOnly
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#F3F3F3] text-[#777] focus:outline-none"
                  style={{ fontFamily: "inherit", height: "46px" }}
                />
                <p className="text-xs text-[#AAAAAA] mt-2">Role tidak dapat diubah.</p>
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-3 hover:bg-[#16332C] transition-colors"
                >
                  Simpan Perubahan
                </button>
                <Link
                  href="/profile"
                  className="flex-1 rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-3 text-center hover:bg-[#F7F5F1] transition-colors"
                >
                  Batal
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
