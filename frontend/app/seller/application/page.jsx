"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const statusConfig = {
  pending: {
    label: "Menunggu Review",
    variant: "warning",
    hint: "Admin sedang memeriksa data pengajuan kamu.",
  },
  approved: {
    label: "Disetujui",
    variant: "success",
    hint: "Selamat, akun seller kamu sudah aktif.",
  },
  rejected: {
    label: "Ditolak",
    variant: "danger",
    hint: "Perbaiki data lalu kirim ulang pengajuan.",
  },
};

function formatDate(isoDate) {
  if (!isoDate) return "-";
  return new Date(isoDate).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SellerApplicationStatusPage() {
  const application = useMemo(() => sellerService.getApplicationStatus(), []);

  if (!application) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <Navbar />
        <main className="max-w-[1280px] mx-auto px-6 py-8">
          <Card className="text-center py-12">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Belum Ada Pengajuan Seller</h1>
            <p className="text-gray-600 mt-2">Kamu belum mengirim pengajuan. Isi formulir dulu agar bisa diproses admin.</p>
            <div className="mt-6">
              <Link href="/seller/apply">
                <Button>Ajukan Menjadi Seller</Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const activeStatus = statusConfig[application.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Status Pengajuan Seller</h1>
          <p className="text-gray-600 mt-1">Pantau progres verifikasi akun seller kamu di sini.</p>
        </section>

        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Status Saat Ini</p>
              <p className="text-lg font-semibold text-[#1F2937] mt-1">{activeStatus.label}</p>
              <p className="text-sm text-gray-600 mt-1">{activeStatus.hint}</p>
            </div>
            <Badge variant={activeStatus.variant} className="w-fit">{activeStatus.label}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl bg-[#F9FAFB] p-4 border border-[#ECEFF3]">
              <p className="text-xs uppercase tracking-wide text-gray-500">ID Pengajuan</p>
              <p className="text-sm font-semibold text-[#1F2937] mt-1">{application.id}</p>
            </div>
            <div className="rounded-2xl bg-[#F9FAFB] p-4 border border-[#ECEFF3]">
              <p className="text-xs uppercase tracking-wide text-gray-500">Dikirim Pada</p>
              <p className="text-sm font-semibold text-[#1F2937] mt-1">{formatDate(application.submittedAt)}</p>
            </div>
            <div className="rounded-2xl bg-[#F9FAFB] p-4 border border-[#ECEFF3]">
              <p className="text-xs uppercase tracking-wide text-gray-500">Nama Pemilik</p>
              <p className="text-sm font-semibold text-[#1F2937] mt-1">{application.ownerName}</p>
            </div>
            <div className="rounded-2xl bg-[#F9FAFB] p-4 border border-[#ECEFF3]">
              <p className="text-xs uppercase tracking-wide text-gray-500">Nama Toko</p>
              <p className="text-sm font-semibold text-[#1F2937] mt-1">{application.storeName}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/seller/apply">
              <Button variant="outline">Edit & Kirim Ulang</Button>
            </Link>
            <Link href="/stores/me">
              <Button variant="secondary">Buka Toko Saya</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
