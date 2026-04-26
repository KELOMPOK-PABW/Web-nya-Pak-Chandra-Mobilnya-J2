"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const initialForm = {
  ownerName: "",
  storeName: "",
  storeCategory: "",
  city: "",
  phone: "",
  bankName: "",
  bankAccountNumber: "",
  reason: "",
};

export default function SellerApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const existingApplication = useMemo(() => sellerService.getApplicationStatus(), []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");

    const requiredFields = [
      "ownerName",
      "storeName",
      "storeCategory",
      "city",
      "phone",
      "bankName",
      "bankAccountNumber",
      "reason",
    ];

    const hasEmpty = requiredFields.some((key) => !form[key]?.trim());
    if (hasEmpty) {
      setError("Semua field wajib diisi sebelum mengirim pengajuan.");
      return;
    }

    setIsSubmitting(true);
    try {
      sellerService.submitApplication(form);
      setSuccessMsg("Pengajuan seller berhasil dikirim. Silakan cek status pengajuan.");
      setForm(initialForm);
    } catch {
      setError("Terjadi kesalahan saat mengirim pengajuan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Daftar Seller</h1>
            <p className="text-gray-600 mt-1">Lengkapi data toko untuk proses verifikasi admin.</p>
          </div>
          <Link href="/seller/application">
            <Button variant="outline">Lihat Status Pengajuan</Button>
          </Link>
        </section>

        {existingApplication && (
          <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#FFF7ED] border-[#FFEDD5]">
            <div>
              <p className="font-semibold text-[#9A3412]">Kamu sudah punya pengajuan sebelumnya</p>
              <p className="text-sm text-[#7C2D12] mt-1">Silakan pantau status terbaru di halaman status pengajuan.</p>
            </div>
            <Badge variant="warning" className="w-fit">Status: {existingApplication.status}</Badge>
          </Card>
        )}

        <Card>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-[#374151] block mb-2">Nama Pemilik</label>
              <input name="ownerName" value={form.ownerName} onChange={onChange} placeholder="Contoh: Rahmawati" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#374151] block mb-2">Nama Toko</label>
              <input name="storeName" value={form.storeName} onChange={onChange} placeholder="Contoh: Toko Rahma Jaya" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#374151] block mb-2">Kategori Utama</label>
              <input name="storeCategory" value={form.storeCategory} onChange={onChange} placeholder="Contoh: Fashion" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#374151] block mb-2">Kota Operasional</label>
              <input name="city" value={form.city} onChange={onChange} placeholder="Contoh: Bandung" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#374151] block mb-2">No. HP</label>
              <input name="phone" value={form.phone} onChange={onChange} placeholder="08xxxxxxxxxx" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#374151] block mb-2">Nama Bank</label>
              <input name="bankName" value={form.bankName} onChange={onChange} placeholder="Contoh: BCA" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[#374151] block mb-2">Nomor Rekening</label>
              <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={onChange} placeholder="Masukkan nomor rekening" className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[#374151] block mb-2">Alasan Menjadi Seller</label>
              <textarea name="reason" value={form.reason} onChange={onChange} rows={4} placeholder="Ceritakan produk dan komitmen pelayanan kamu" className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 resize-none" />
            </div>

            {error && <p className="md:col-span-2 text-sm text-[#B91C1C]">{error}</p>}
            {successMsg && <p className="md:col-span-2 text-sm text-[#166534]">{successMsg}</p>}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
              <Button type="submit" loading={isSubmitting}>Kirim Pengajuan</Button>
              <Link href="/seller/application">
                <Button type="button" variant="secondary">Cek Status</Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

