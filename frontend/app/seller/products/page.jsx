"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { productService } from "@/services/productService";

const sellerMenus = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Produk", href: "/seller/products" },
  { label: "Pesanan", href: "/seller/orders" },
  { label: "Toko Saya", href: "/stores/me" },
  { label: "Status Pengajuan", href: "/seller/application" },
];

function formatRp(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", stock: "", description: "", image_url: "" });
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productService.getSellerProducts();
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat produk");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({ name: "", price: "", stock: "", description: "", image_url: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      description: product.desc || product.description || "",
      image_url: product.image_url || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
        image_url: form.image_url || "",
      };

      if (editingId) {
        await productService.updateProduct(editingId, payload);
      } else {
        await productService.createProduct(payload);
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      setError(err.message || "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    setSaving(true);
    try {
      await productService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Gagal menghapus produk");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Toko Saya" subtitle="Seller Center" menus={sellerMenus} />

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Produk Saya</h1>
              <p className="text-sm text-[#777]">{loading ? "..." : `${products.length} produk`}</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#16332C] transition-colors"
            >
              + Tambah Produk
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 mb-6">
              <h2 className="text-base font-bold text-[#1A1A1A] mb-4">
                {editingId ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-1">Nama Produk</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm outline-none focus:border-[#1A3C34]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm outline-none focus:border-[#1A3C34]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-1">Stok</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm outline-none focus:border-[#1A3C34]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-1">URL Gambar</label>
                  <input
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://example.com/gambar.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm outline-none focus:border-[#1A3C34]"
                  />
                  {form.image_url && (
                    <div className="mt-2 w-16 h-16 rounded-xl border border-[#E5E7EB] overflow-hidden">
                      <img src={form.image_url} alt="preview"
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = "none" }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#374151] block mb-1">Deskripsi</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm outline-none focus:border-[#1A3C34] resize-vertical"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold px-6 py-2.5 hover:bg-[#16332C] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Produk"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-[#E5E7EB] text-sm font-semibold px-6 py-2.5 hover:bg-[#F7F5F1] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-[#EBEBEB] rounded-2xl p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-12 text-center">
              <p className="text-lg mb-2">📦</p>
              <p className="text-sm text-[#888]">Belum ada produk. Klik "Tambah Produk" untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="bg-white border border-[#EBEBEB] rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FBF8] flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = "none"; e.target.parentElement.textContent = "📦"; }} />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{product.name}</p>
                      <p className="text-xs text-[#888]">
                        Stok: {product.stock} · {formatRp(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-4 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold hover:bg-[#F7F5F1] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
