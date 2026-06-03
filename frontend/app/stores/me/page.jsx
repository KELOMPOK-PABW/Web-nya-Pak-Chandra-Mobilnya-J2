"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { productService } from "@/services/productService";
import { sellerService } from "@/services/sellerService";

const sellerMenus = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Produk", href: "/seller/products" },
  { label: "Pesanan", href: "/seller/orders" },
  { label: "Toko Saya", href: "/stores/me" },
  { label: "Status Pengajuan", href: "/seller/application" },
];

export default function MyStorePage() {
  // Store profile state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    storeName: "",
    slogan: "",
    city: "",
    address: "",
    phone: "",
    description: "",
  });

  // Product summary state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStore() {
      setIsLoading(true);
      setError("");
      try {
        const store = await sellerService.getMyStore();
        if (!active) return;
        setForm({
          storeName: store.storeName || "",
          slogan: store.slogan || "",
          city: store.city || "",
          address: store.address || "",
          phone: store.phone || "",
          description: store.description || "",
        });
      } catch (err) {
        if (active) setError(err.message || "Gagal mengambil data toko.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    async function loadProducts() {
      setProductsLoading(true);
      try {
        const res = await productService.getSellerProducts();
        if (!active) return;
        setProducts(res.data || []);
      } catch (err) {
        if (active) setProducts([]);
      } finally {
        if (active) setProductsLoading(false);
      }
    }

    loadStore();
    loadProducts();
    return () => { active = false; };
  }, []);

  const activeProducts = products.filter(p => p.stock > 0);
  const totalValue = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.stock || 0), 0);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setError("");
    try {
      const store = await sellerService.updateMyStore(form);
      setForm((prev) => ({
        ...prev,
        storeName: store.storeName || prev.storeName,
        phone: store.phone || prev.phone,
      }));
      setSaveMessage("Informasi toko berhasil diperbarui.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Toko Saya" subtitle="Seller Center" menus={sellerMenus} />

        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Toko Saya</h1>
            <p className="text-sm text-[#777]">Ringkasan toko dan produk Anda.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {/* Store Profile Form */}
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#1A1A1A]">Informasi Toko</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-[#1A3C34] hover:text-[#2D6A5E] cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Memuat data toko...</div>
            ) : (
              <form onSubmit={onSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Nama Toko</label>
                    <input name="storeName" value={form.storeName} onChange={onChange} disabled={!isEditing}
                      className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Slogan</label>
                    <input name="slogan" value={form.slogan} onChange={onChange} disabled={!isEditing}
                      className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Kota</label>
                    <input name="city" value={form.city} onChange={onChange} disabled={!isEditing}
                      className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-2">No. HP</label>
                    <input name="phone" value={form.phone} onChange={onChange} disabled={!isEditing}
                      className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Alamat</label>
                    <input name="address" value={form.address} onChange={onChange} disabled={!isEditing}
                      className="w-full h-11 rounded-xl border border-[#E5E7EB] px-3 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Deskripsi Toko</label>
                    <textarea name="description" value={form.description} onChange={onChange} disabled={!isEditing} rows={3}
                      className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 bg-white disabled:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20" />
                  </div>
                </div>

                {saveMessage && (
                  <p className="text-sm text-[#166534]">{saveMessage}</p>
                )}

                {isEditing && (
                  <div className="flex gap-3">
                    <button type="submit" disabled={isSaving}
                      className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50">
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-[#E5E7EB] text-[#555] text-sm font-semibold px-5 py-2.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                      Batal
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Product Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs text-[#888] font-semibold tracking-wide">Total Produk</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                {productsLoading ? "..." : products.length}
              </p>
            </div>
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs text-[#888] font-semibold tracking-wide">Produk Aktif</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1">
                {productsLoading ? "..." : activeProducts.length}
              </p>
            </div>
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs text-[#888] font-semibold tracking-wide">Nilai Stok</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                {productsLoading ? "..." : `Rp ${(totalValue / 1000000).toFixed(1)} jt`}
              </p>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1A1A1A] mb-4">Produk</h2>

            {productsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#888]">Belum ada produk.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FBF8] flex items-center justify-center text-lg">📦</div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">{p.name}</p>
                        <p className="text-xs text-[#888]">
                          Rp {Number(p.price).toLocaleString("id-ID")} · Stok: {p.stock}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.stock > 0 ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
                      {p.stock > 0 ? "Tersedia" : "Habis"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
