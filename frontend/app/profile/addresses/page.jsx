"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { addressService } from "@/services/addressService";

const emptyForm = { address: "", city: "", postal_code: "" };

export default function ProfileAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isLoggedIn = Boolean(authService.getToken());

  const loadAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await addressService.list();
      setAddresses(list);
    } catch (err) {
      setError(err.message || "Gagal memuat alamat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login untuk melihat alamat.");
      return;
    }
    loadAddresses();
  }, [isLoggedIn]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const startEdit = (item) => {
    setEditingId(item.address_id);
    setForm({
      address: item.address || "",
      city: item.city || "",
      postal_code: item.postal_code || "",
    });
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.postal_code) {
      setError("Alamat, kota, dan kode pos wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        await addressService.update(editingId, form);
        setSuccess("Alamat berhasil diperbarui.");
      } else {
        await addressService.create(form);
        setSuccess("Alamat berhasil ditambahkan.");
      }
      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Gagal menyimpan alamat.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await addressService.remove(id);
      setSuccess("Alamat berhasil dihapus.");
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Gagal menghapus alamat.");
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
          <p className="text-sm text-[#777] mb-6">Silakan login untuk melihat alamat.</p>
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

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Alamat Saya</h1>
            <p className="text-sm text-[#777]">Kelola alamat pengiriman Anda.</p>
          </div>
          <Link href="/profile" className="text-sm font-semibold text-[#1A3C34] hover:underline">
            Kembali ke profil
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
              {editingId ? "Edit Alamat" : "Tambah Alamat"}
            </h2>

            {error && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C] mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-[#BBF7D0] bg-[#ECFDF3] px-4 py-3 text-sm text-[#15803D] mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#888]">Alamat</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Jl. Soekarno Hatta No. 10"
                  className="mt-2 w-full rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#888]">Kota</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Balikpapan"
                  className="mt-2 w-full rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#888]">Kode Pos</label>
                <input
                  type="text"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="76114"
                  className="mt-2 w-full rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-[#1A3C34] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16332C] disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Alamat"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-xl border border-[#E0DDD6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1]"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Daftar Alamat</h2>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-[#777]">Belum ada alamat tersimpan.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((item) => (
                  <div key={item.address_id} className="rounded-xl border border-[#E8E8E8] p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{item.address}</p>
                      <p className="text-sm text-[#777]">{item.city}</p>
                      <p className="text-sm text-[#777]">{item.postal_code}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.address_id)}
                        disabled={saving}
                        className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] disabled:opacity-60"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
