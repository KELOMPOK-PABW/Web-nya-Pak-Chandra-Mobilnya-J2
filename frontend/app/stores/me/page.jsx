"use client";

import React, { useEffect, useState } from "react";
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

export default function MyStorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await productService.getSellerProducts();
        setProducts(res.data || []);
      } catch (err) {
        setError(err.message || "Gagal memuat data toko");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeProducts = products.filter(p => p.stock > 0);
  const totalValue = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.stock || 0), 0);

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

          {/* Store Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs text-[#888] font-semibold tracking-wide">Total Produk</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                {loading ? "..." : products.length}
              </p>
            </div>
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs text-[#888] font-semibold tracking-wide">Produk Aktif</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1">
                {loading ? "..." : activeProducts.length}
              </p>
            </div>
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs text-[#888] font-semibold tracking-wide">Nilai Stok</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                {loading ? "..." : `Rp ${(totalValue / 1000000).toFixed(1)} jt`}
              </p>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1A1A1A]">Produk</h2>
            </div>

            {loading ? (
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
                      <div className="w-10 h-10 rounded-xl bg-[#F0FBF8] flex items-center justify-center text-lg">
                        📦
                      </div>
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
