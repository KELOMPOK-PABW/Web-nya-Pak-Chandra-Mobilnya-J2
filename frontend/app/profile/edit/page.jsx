"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";

const ROLE_LABELS = {
  buyer: "Pembeli",
  seller: "Penjual",
  kurir: "Kurir",
};

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", role: "buyer" });
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
        const profile = await profileService.getMe();
        setForm({
          full_name: profile?.full_name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          role: profile?.roles?.[0] || "buyer",
        });
      } catch (err) {
        setError(err.message || "Gagal memuat data profil.");
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
    if (!form.full_name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await profileService.updateMe({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      });
      setSuccess("Profil berhasil diperbarui.");
      setTimeout(() => router.push("/profile"), 600);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan profil.");
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

  const initials = form.full_name
    ? form.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Edit Profil</h1>
            <p className="text-sm text-[#777]">Perbarui data akun dari API profil.</p>
          </div>
          <Link href="/profile" className="inline-flex items-center justify-center rounded-xl border border-[#E0DDD6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1] transition-colors">
            Kembali
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] animate-pulse">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 h-32" />
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 h-72" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="bg-white border border-[#E8E8E8] rounded-2xl p-6 h-fit">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#1A3C34] text-white flex items-center justify-center text-lg font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1A1A1A]">{form.full_name || "User"}</p>
                  <p className="text-sm text-[#777]">{ROLE_LABELS[form.role] || form.role}</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                <p className="text-xs text-[#888]">Email</p>
                <p className="text-sm font-medium text-[#1A1A1A] break-all">{form.email || "-"}</p>
              </div>
            </aside>

            <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
              {error && (
                <div className="rounded-2xl px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl px-4 py-3 bg-[#F0FBF8] border border-[#C8EDE8] text-[#1A3C34] text-sm mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Nama lengkap</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                    style={{ fontFamily: "inherit", height: "46px" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#F3F3F3] text-[#777] focus:outline-none"
                    style={{ fontFamily: "inherit", height: "46px" }}
                  />
                  <p className="text-xs text-[#AAAAAA] mt-2">Email tidak dapat diubah dari halaman ini.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Nomor HP</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Masukkan nomor HP"
                    autoComplete="tel"
                    className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                    style={{ fontFamily: "inherit", height: "46px" }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Role</label>
                  <input
                    type="text"
                    value={ROLE_LABELS[form.role] || form.role}
                    readOnly
                    className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#F3F3F3] text-[#777] focus:outline-none"
                    style={{ fontFamily: "inherit", height: "46px" }}
                  />
                  <p className="text-xs text-[#AAAAAA] mt-2">Role tidak dapat diubah.</p>
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-3 hover:bg-[#16332C] disabled:opacity-60 transition-colors"
                  >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                  <Link href="/profile" className="flex-1 rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-3 text-center hover:bg-[#F7F5F1] transition-colors">
                    Batal
                  </Link>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
