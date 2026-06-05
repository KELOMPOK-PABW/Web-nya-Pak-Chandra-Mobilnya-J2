"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { apiUrl, buildAuthHeaders, handleResponse } from "@/services/apiClient";

export default function ProfileEditPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isLoggedIn = Boolean(authService.getToken());

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login untuk mengubah profil.");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiUrl("/me"), {
          headers: buildAuthHeaders(),
        });
        const data = await handleResponse(res);
        const profile = data.data ?? data;
        setForm({
          full_name: profile?.full_name || "",
          phone: profile?.phone || "",
          email: profile?.email || "",
        });
      } catch (err) {
        setError(err.message || "Gagal memuat data profil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isLoggedIn]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      setError("Nama dan nomor telepon wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(apiUrl("/me"), {
        method: "PUT",
        headers: buildAuthHeaders(true),
        body: JSON.stringify({ full_name: form.full_name, phone: form.phone }),
      });
      await handleResponse(res);
      setSuccess("Profil berhasil diperbarui.");
      router.push("/profile");
    } catch (err) {
      setError(err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-4">Login Diperlukan</h1>
          <p className="text-sm text-[#777] mb-6">Silakan login untuk mengubah profil.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center rounded-xl bg-[#1A3C34] px-5 py-2.5 text-sm font-semibold text-white">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Edit Profil</h1>
            <p className="text-sm text-[#777]">Perbarui data profil akun Anda.</p>
          </div>
          <Link href="/profile" className="text-sm font-semibold text-[#1A3C34] hover:underline">
            Kembali ke profil
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#E8E8E8] rounded-2xl p-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-[#BBF7D0] bg-[#ECFDF3] px-4 py-3 text-sm text-[#15803D]">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#888]">Nama Lengkap</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="mt-2 w-full rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#888]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="mt-2 w-full rounded-xl border border-[#E5E2DB] bg-[#F4F4F2] px-4 py-3 text-sm text-[#777]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#888]">No. Telepon</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="mt-2 w-full rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link href="/profile" className="rounded-xl border border-[#E0DDD6] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1]">
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#1A3C34] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16332C] disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
