"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/authService";
import { addressService } from "@/services/addressService";

const EMPTY_FORM = { address: "", city: "", postal_code: "" };

function getAddressId(item) {
  return item?.address_id ?? item?.id;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
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

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(getAddressId(item));
    setForm({
      address: item.address || "",
      city: item.city || "",
      postal_code: item.postal_code || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim()) {
      setError("Alamat dan kota wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        address: form.address.trim(),
        city: form.city.trim(),
        postal_code: form.postal_code.trim(),
      };
      if (editingId) {
        await addressService.update(editingId, payload);
        setSuccess("Alamat berhasil diperbarui.");
      } else {
        await addressService.create(payload);
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

  const removeAddress = async (id) => {
    if (!confirm("Hapus alamat ini?")) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await addressService.remove(id);
      setSuccess("Alamat berhasil dihapus.");
      if (editingId === id) resetForm();
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

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Alamat Pengiriman</h1>
            <p className="text-sm text-[#777]">Kelola alamat dari API /addresses.</p>
          </div>
          <Link href="/profile" className="inline-flex items-center justify-center rounded-xl border border-[#E0DDD6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1] transition-colors">
            Kembali
          </Link>
        </div>

        {(error || success) && (
          <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
            error
              ? "bg-red-50 border border-red-200 text-red-600"
              : "bg-[#F0FBF8] border border-[#C8EDE8] text-[#1A3C34]"
          }`}>
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Daftar Alamat</h2>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E0DDD6] p-8 text-center">
                <p className="font-semibold text-[#1A1A1A]">Belum ada alamat</p>
                <p className="text-sm text-[#777] mt-1">Tambahkan alamat pengiriman pertama kamu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((item) => {
                  const id = getAddressId(item);
                  return (
                    <div key={id} className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAF8] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{item.address}</p>
                          <p className="text-sm text-[#777] mt-1">
                            {item.city}{item.postal_code ? `, ${item.postal_code}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-xl border border-[#E0DDD6] bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F7F5F1]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAddress(id)}
                            disabled={saving}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="bg-white border border-[#E8E8E8] rounded-2xl p-6 h-fit">
            <h2 className="font-bold text-[#1A1A1A] mb-4">{editingId ? "Edit Alamat" : "Tambah Alamat"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Alamat lengkap</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Jalan, nomor rumah, RT/RW"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Kota</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Contoh: Pontianak"
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  style={{ height: "46px" }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Kode pos</label>
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="78111"
                  className="w-full px-4 rounded-xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  style={{ height: "46px" }}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-3 hover:bg-[#16332C] disabled:opacity-60 transition-colors"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Alamat"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-3 hover:bg-[#F7F5F1] transition-colors"
                >
                  Batal Edit
                </button>
              )}
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
