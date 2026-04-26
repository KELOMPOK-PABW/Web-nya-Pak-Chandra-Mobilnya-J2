"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const sellerMenus = [
  { label: "Dashboard", href: "/seller/dashboard", icon: "📊" },
  { label: "Produk", href: "/seller/products", icon: "📦" },
  { label: "Pesanan", href: "/seller/orders", icon: "🛒" },
  { label: "Toko Saya", href: "/stores/me", icon: "🏬" },
  { label: "Status Pengajuan", href: "/seller/application", icon: "📄" },
];

export default function MyStorePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [form, setForm] = useState({
    storeName: "",
    slogan: "",
    city: "",
    address: "",
    phone: "",
    description: "",
  });

  useEffect(() => {
    const store = sellerService.getMyStore();
    setForm({
      storeName: store.storeName || "",
      slogan: store.slogan || "",
      city: store.city || "",
      address: store.address || "",
      phone: store.phone || "",
      description: store.description || "",
    });
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      sellerService.updateMyStore(form);
      setSaveMessage("Informasi toko berhasil diperbarui.");
      setIsEditing(false);
    } catch {
      setSaveMessage("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar menus={sellerMenus} />
        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Toko Saya</h1>
              <p className="text-gray-600 mt-1">Lihat dan edit profil toko yang tampil ke pembeli.</p>
            </div>
            <Badge variant="success" className="w-fit">Status: Aktif</Badge>
          </section>

          <Card>
            <form onSubmit={onSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-2">Nama Toko</label>
                  <input name="storeName" value={form.storeName} onChange={onChange} disabled={!isEditing} className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-2">Slogan</label>
                  <input name="slogan" value={form.slogan} onChange={onChange} disabled={!isEditing} className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-2">Kota</label>
                  <input name="city" value={form.city} onChange={onChange} disabled={!isEditing} className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-2">No. HP</label>
                  <input name="phone" value={form.phone} onChange={onChange} disabled={!isEditing} className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#374151] block mb-2">Alamat Toko</label>
                <textarea name="address" value={form.address} onChange={onChange} disabled={!isEditing} rows={3} className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 resize-none" />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#374151] block mb-2">Deskripsi Toko</label>
                <textarea name="description" value={form.description} onChange={onChange} disabled={!isEditing} rows={4} className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 resize-none" />
              </div>

              {saveMessage && (
                <p className="text-sm text-[#166534]">{saveMessage}</p>
              )}

              <div className="flex flex-wrap gap-3">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>Edit Informasi Toko</Button>
                ) : (
                  <>
                    <Button type="submit" loading={isSaving}>Simpan Perubahan</Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Batal</Button>
                  </>
                )}
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
