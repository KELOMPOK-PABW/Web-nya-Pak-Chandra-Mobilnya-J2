"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";
import { useToast } from "@/components/ui/Toast";

const ROLE_LABELS = {
  buyer: "Pembeli",
  seller: "Penjual",
  kurir: "Kurir",
};

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isLoggedIn = Boolean(authService.getToken());

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login untuk melihat profil.");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const data = await profileService.getMe();
        setProfile(data);
      } catch (err) {
        setError(err.message || "Gagal memuat data profil");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [isLoggedIn]);

  const handleLogout = () => {
    authService.logout();
    showToast({ type: "success", message: "Berhasil keluar. Sampai jumpa!" });
    setTimeout(() => router.push("/auth/login"), 500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-4">Login Diperlukan</h1>
          <p className="text-sm text-[#777] mb-6">Silakan login untuk melihat profil.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center rounded-xl bg-[#1A3C34] px-5 py-2.5 text-sm font-semibold text-white">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const primaryRole = profile?.roles?.[0] || "buyer";

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Profil Saya</h1>
            <p className="text-sm text-[#777]">Data profil dari akun Anda.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] animate-pulse">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#1A3C34] text-white flex items-center justify-center text-lg font-semibold">
                  {initials}
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A1A]">{profile.full_name}</h2>
                  <p className="text-sm text-[#777]">{ROLE_LABELS[primaryRole] || primaryRole}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <Link href="/profile/edit" className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-2.5 text-center hover:bg-[#16332C] transition-colors">
                  Edit Profil
                </Link>
                <Link href="/profile/wallet" className="rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-2.5 text-center hover:bg-[#F7F5F1] transition-colors">
                  Dompet Saya
                </Link>
                <Link href="/profile/addresses" className="rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-2.5 text-center hover:bg-[#F7F5F1] transition-colors">
                  Alamat Saya
                </Link>
                <Link href="/profile/reviews" className="rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-2.5 text-center hover:bg-[#F7F5F1] transition-colors">
                  Ulasan Saya
                </Link>
                <Link href="/orders" className="rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-2.5 text-center hover:bg-[#F7F5F1] transition-colors">
                  Pesanan Saya
                </Link>
              </div>
            </section>

            <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Detail Profil</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#888] font-semibold uppercase tracking-wide">Nama Lengkap</p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-1">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#888] font-semibold uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-1">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#888] font-semibold uppercase tracking-wide">No. Telepon</p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-1">{profile.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#888] font-semibold uppercase tracking-wide">Role</p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-1">{ROLE_LABELS[primaryRole] || primaryRole}</p>
                </div>
                <div>
                  <p className="text-xs text-[#888] font-semibold uppercase tracking-wide">Status Akun</p>
                  <p className="text-sm font-medium text-[#1A3C34] mt-1">
                    {profile.is_active ? "Aktif" : "Non-aktif"}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold py-3 text-center hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Keluar
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center border border-[#F0F0F0]">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Yakin ingin keluar?</h3>
              <p className="text-sm text-gray-500 mb-6">Kamu perlu login kembali untuk mengakses akun ini.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-[#E5E7EB] text-[#374151] text-sm font-semibold py-3 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-xl bg-red-600 text-white text-sm font-semibold py-3 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
