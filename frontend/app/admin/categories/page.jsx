"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

const ADMIN_MENUS = [
  { label: "Users",           href: "/admin/users",              },
  { label: "Seller Approval", href: "/admin/seller-applications",badge: "3" },
  { label: "Kategori",        href: "/admin/categories",           },
  { label: "Kurir",           href: "/admin/couriers",            },
  { label: "Produk",          href: "/admin/products",            },
  { label: "E-Wallet",        href: "/admin/ewallet",            },
];

const KATEGORI_DUMMY = [
  { id: 1, name: "Fashion",     icon: "👗", product_count: 142, created_at: "2025-01-01" },
  { id: 2, name: "Sepatu",      icon: "👟", product_count: 87,  created_at: "2025-01-01" },
  { id: 3, name: "Tas",         icon: "👜", product_count: 63,  created_at: "2025-01-02" },
  { id: 4, name: "Elektronik",  icon: "📱", product_count: 210, created_at: "2025-01-03" },
  { id: 5, name: "Makanan",     icon: "🍔", product_count: 55,  created_at: "2025-01-05" },
  { id: 6, name: "Rumah",       icon: "🏠", product_count: 98,  created_at: "2025-01-06" },
  { id: 7, name: "Olahraga",    icon: "⚽", product_count: 74,  created_at: "2025-01-07" },
  { id: 8, name: "Kecantikan",  icon: "💄", product_count: 119, created_at: "2025-01-08" },
];

const EMPTY_FORM = { name: "", icon: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(KATEGORI_DUMMY);
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = tambah, object = edit
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id yang mau dihapus
  const [error,      setError]      = useState("");

  const filtered = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  //  Buka modal
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name, icon: cat.icon });
    setError("");
    setShowModal(true);
  };

  // Submit form 
  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Nama kategori wajib diisi."); return; }

    if (editTarget) {
      // UPDATE — nanti: PUT /categories/{id}
      setCategories(prev => prev.map(c =>
        c.id === editTarget.id
          ? { ...c, name: form.name.trim(), icon: form.icon || "🗂️" }
          : c
      ));
    } else {
      // CREATE — nanti: POST /categories
      const newCat = {
        id:            Math.max(...categories.map(c => c.id)) + 1,
        name:          form.name.trim(),
        icon:          form.icon || "🗂️",
        product_count: 0,
        created_at:    new Date().toISOString().slice(0, 10),
      };
      setCategories(prev => [...prev, newCat]);
    }

    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditTarget(null);
  };

  //  Hapus 
  const handleDelete = (id) => {
    // Nanti: DELETE /categories/{id}
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]"
      style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Admin Panel" subtitle="Administrator" menus={ADMIN_MENUS} />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Manajemen Kategori</h1>
              <p className="text-sm text-gray-500 mt-1">{categories.length} kategori tersedia</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A3C34] text-white
                rounded-lg text-sm font-semibold hover:bg-[#16332C] transition-colors">
              + Tambah Kategori
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
            {/* Filter */}
            <div className="flex gap-3 px-5 py-3 border-b border-[#F3F4F6]">
              <div className="relative max-w-xs w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari kategori..."
                  className="w-full h-9 pl-9 pr-3 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB]
                    text-sm focus:outline-none focus:border-[#1A3C34]"
                />
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#F3F4F6]">
                <tr>
                  {["#","Icon","Nama Kategori","Jumlah Produk","Dibuat","Aksi"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold
                      text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}
                    className="border-b border-[#F9FAFB] hover:bg-[#FAFFF9] transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-2xl">{c.icon}</td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-[#E0F2F1] text-[#0F6E56]
                        px-2.5 py-1 rounded-full">
                        {c.product_count} produk
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.created_at}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)}
                          className="text-xs font-semibold text-[#1A3C34] px-3 py-1.5 border
                            border-[#1A3C34] rounded-lg hover:bg-[#E0F2F1] transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(c.id)}
                          className="text-xs font-semibold text-red-600 px-3 py-1.5 border
                            border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <p className="text-3xl mb-2">🗂️</p>
                <p className="font-medium">Tidak ada kategori ditemukan</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modal Tambah / Edit ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">
              {editTarget ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            {/* Field: Icon */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                Icon <span className="text-gray-400 font-normal">(emoji, opsional)</span>
              </label>
              <input
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="contoh: 👗"
                className="w-full h-10 px-3 border border-[#E5E7EB] rounded-lg text-sm
                  focus:outline-none focus:border-[#1A3C34]"
              />
            </div>

            {/* Field: Nama */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(""); }}
                placeholder="Masukkan nama kategori"
                className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none
                  focus:border-[#1A3C34] ${error ? "border-red-400" : "border-[#E5E7EB]"}`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Preview */}
            {(form.name || form.icon) && (
              <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-[#F0FBF8] rounded-xl
                border border-[#C8EDE8]">
                <span className="text-2xl">{form.icon || "🗂️"}</span>
                <span className="font-semibold text-[#1A3C34]">{form.name || "Nama kategori"}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 h-10 rounded-lg border border-[#E5E7EB] text-sm font-semibold
                  text-gray-500 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSubmit}
                className="flex-1 h-10 rounded-lg bg-[#1A3C34] text-white text-sm font-semibold
                  hover:bg-[#16332C] transition-colors">
                {editTarget ? "Simpan Perubahan" : "Tambah Kategori"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🗑️</div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Hapus Kategori?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Kategori <strong>{categories.find(c=>c.id===deleteConfirm)?.name}</strong> akan
                dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-10 rounded-lg border border-[#E5E7EB] text-sm font-semibold
                  text-gray-500 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-10 rounded-lg bg-red-600 text-white text-sm font-semibold
                  hover:bg-red-700 transition-colors">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}