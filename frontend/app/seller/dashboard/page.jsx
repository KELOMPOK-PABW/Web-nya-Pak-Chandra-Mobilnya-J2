"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { productService } from "@/services/productService";
import { authService } from "@/services/authService";

const sellerMenus = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Produk", href: "/seller/products" },
  { label: "Pesanan", href: "/seller/orders" },
  { label: "Toko Saya", href: "/stores/me" },
  { label: "Status Pengajuan", href: "/seller/application" },
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auth guard: redirect to login if not authenticated
    const token = authService.getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await productService.getSellerProducts();
        setProducts(res.data || []);
      } catch (err) {
        setError(err.message || "Gagal memuat data");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const activeProducts = products.filter(p => p.stock > 0);
  const totalStock = products.reduce((s, p) => s + Number(p.stock || 0), 0);
  const totalValue = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.stock || 0), 0);

  const STATS = [
    { label: "Total Produk", value: products.length.toString(), sub: "Semua produk" },
    { label: "Produk Aktif", value: activeProducts.length.toString(), sub: "Tersedia" },
    { label: "Total Stok", value: totalStock.toString(), sub: "Unit" },
    { label: "Nilai Stok", value: `Rp ${(totalValue / 1000000).toFixed(1)} jt`, sub: "Ekskl. PPN" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar title="Toko Saya" subtitle="Seller Center" menus={sellerMenus} />

        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
            <p className="text-sm text-[#777]">Ringkasan toko Anda.</p>
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <p className="text-xs text-[#888] font-semibold tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-xs text-[#999] mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent products */}
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1A1A1A]">Produk Terbaru</h2>
              <Link href="/seller/products" className="text-sm font-semibold text-[#1A3C34]">
                Kelola Produk
              </Link>
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
                <Link href="/seller/products" className="text-sm font-semibold text-[#1A3C34] mt-2 inline-block">
                  Tambah Produk
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FBF8] flex items-center justify-center text-lg">
                        📦
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">{p.name}</p>
                        <p className="text-xs text-[#888]">Stok: {p.stock}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#1A3C34]">
                      Rp {Number(p.price).toLocaleString("id-ID")}
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
