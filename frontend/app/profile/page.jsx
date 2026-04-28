import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const ROLE_LABELS = {
  buyer: "Pembeli",
  seller: "Penjual",
  kurir: "Kurir",
};

const profile = {
  id: "usr_123",
  username: "rahmi",
  email: "rahmi@mail.com",
  full_name: "Rahmi Syafitri",
  phone: "08123456789",
  roles: ["buyer"],
  updated_at: "2026-04-08T10:00:00Z",
};

export default function ProfilePage() {
  const initials = profile.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const primaryRole = profile.roles[0] || "buyer";

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Profil Saya</h1>
            <p className="text-sm text-[#777]">Data profil sesuai payload terbaru.</p>
          </div>
          <Link
            href="/profile/edit"
            className="inline-flex items-center justify-center rounded-xl bg-[#1A3C34] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16332C] transition-colors"
          >
            Edit Profil
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1A3C34] text-white flex items-center justify-center text-lg font-semibold">
                {initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1A1A1A]">{profile.full_name}</p>
                <p className="text-sm text-[#777]">{ROLE_LABELS[primaryRole]}</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
              <p className="text-xs text-[#888]">ID Akun</p>
              <p className="text-sm font-medium text-[#1A1A1A]">{profile.id}</p>
            </div>
            <p className="text-xs text-[#999] mt-4">Terakhir diperbarui: {profile.updated_at}</p>
          </section>

          <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">Informasi Akun</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                <p className="text-xs text-[#888]">Nama lengkap</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{profile.full_name}</p>
              </div>
              <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                <p className="text-xs text-[#888]">Email</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{profile.email}</p>
              </div>
              <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                <p className="text-xs text-[#888]">Username</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{profile.username}</p>
              </div>
              <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                <p className="text-xs text-[#888]">Nomor HP</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{profile.phone}</p>
              </div>
              <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                <p className="text-xs text-[#888]">Roles</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{ROLE_LABELS[primaryRole]}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
