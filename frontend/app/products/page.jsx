"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Home, Tag, Bot, ShoppingCart, Package, User } from "lucide-react";
import { productService } from "@/services/productService";

// (dummy data removed) 

const formatPrice = (value) => `Rp ${value.toLocaleString("id-ID")}`;

export default function ProductsListPage() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const cats = await productService.getCategories();
        if (!mounted) return;
        setCategories(cats || []);

        const res = await productService.getProducts({ category_id: categoryId });
        if (!mounted) return;
        setProducts(res.data || []);
      } catch (err) {
        setError(err.message || "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } .animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }`}</style>
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Daftar Produk</h1>
            <p className="text-sm text-[#777]">Temukan produk pilihan dengan harga terbaik.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#E0DDD6] bg-white px-4 py-2 text-sm text-[#777]">
              {loading ? "..." : `${products.length} produk`}
            </div>
          </div>
        </div>

        {/* Category Filter — pills style */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategoryId("")}
            className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
              categoryId === ""
                ? "bg-[#1A3C34] text-white"
                : "bg-white border border-[#EBEBEB] text-[#555] hover:border-[#1A3C34]/30"
            }`}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                categoryId === c.id
                  ? "bg-[#1A3C34] text-white"
                  : "bg-white border border-[#EBEBEB] text-[#555] hover:border-[#1A3C34]/30"
              }`}
            >
              {c.category_name}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-red-600">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl p-5 flex flex-col">
                <div className="rounded-2xl h-40 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
                <div className="mt-4 flex-1 space-y-3">
                  <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/2 animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/3 animate-shimmer bg-[length:200%_100%]" />
                </div>
                <div className="mt-4 h-9 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-shimmer bg-[length:200%_100%]" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              <Package size={48} strokeWidth={1} className="mx-auto mb-4 opacity-40" />
              <p className="font-semibold text-[15px]">Produk tidak ditemukan</p>
              <p className="text-[13px] mt-1">Coba ubah kategori atau cari dengan kata kunci lain</p>
              <button
                onClick={() => setCategoryId("")}
                className="mt-4 text-[13px] font-semibold text-[#1A3C34] hover:underline cursor-pointer"
              >
                Tampilkan semua produk
              </button>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white border border-[#E8E8E8] rounded-2xl p-5 flex flex-col">
                <div className="rounded-2xl h-40 flex items-center justify-center bg-[#F3F4F6] overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<svg width=\"32\" height=\"32\" stroke=\"#A5D6D0\" fill=\"none\" stroke-width=\"1\"><path d=\"M20 12v10m0 4v2M4 12h32M4 12l4-8h24l4 8M4 12v16a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V12\"/></svg>'; }} />
                  ) : (
                    <Package size={32} strokeWidth={1} color="#A5D6D0" />
                  )}
                </div>
                <div className="mt-4 flex-1">
                  <div className="flex items-center justify-between text-xs text-[#888]">
                    <span className="px-2 py-1 rounded-full bg-[#FAFAF8] border border-[#E5E2DB]">
                      {product.category?.category_name || product.category}
                    </span>
                    <span>{product.stock} stok</span>
                  </div>
                  <h2 className="text-base font-semibold text-[#1A1A1A] mt-3">{product.name}</h2>
                  <p className="text-sm text-[#777] mt-1">{product.store?.store_name}</p>
                  <p className="text-lg font-bold text-[#1A3C34] mt-3">{formatPrice(product.price)}</p>
                </div>
                <Link
                  href={`/product/${product.id}`}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-2.5 hover:bg-[#16332C] transition-colors"
                >
                  Lihat Detail
                </Link>
              </div>
            ))
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EBEBEB] lg:hidden"
          style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-around px-4 py-2">
            {[
              { href: "/home", icon: <Home size={22} strokeWidth={1.8} />, label: "Beranda" },
              { href: "/products", icon: <Tag size={22} strokeWidth={1.8} />, label: "Produk" },
              { href: "/chat", icon: <Bot size={22} strokeWidth={1.8} />, label: "AI Chat" },
              { href: "/cart", icon: <ShoppingCart size={22} strokeWidth={1.8} />, label: "Keranjang" },
              { href: "/orders", icon: <Package size={22} strokeWidth={1.8} />, label: "Pesanan" },
              { href: "/profile", icon: <User size={22} strokeWidth={1.8} />, label: "Profil" },
            ].map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all no-underline"
                style={{ color: active ? "#1A3C34" : "#9CA3AF" }}>
                {React.cloneElement(item.icon, { color: active ? "#1A3C34" : "#9CA3AF" })}
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          </div>
        </nav>
      </main>
    </div>
  );
}
