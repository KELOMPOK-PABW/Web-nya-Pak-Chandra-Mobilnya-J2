"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { productService } from "@/services/productService";

// (dummy data removed) 

const formatPrice = (value) => `Rp ${value.toLocaleString("id-ID")}`;

export default function ProductsListPage() {
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

      <main className="max-w-[1280px] mx-auto px-6 py-8">
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

        <div style={{ marginBottom: 12 }}>
          <label className="text-sm mr-2">Filter Kategori:</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 text-red-600">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl p-5 flex flex-col animate-pulse">
                <div className="rounded-2xl h-40 bg-gray-200" />
                <div className="mt-4 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mt-3" />
                </div>
                <div className="mt-4 h-9 bg-gray-200 rounded" />
              </div>
            ))
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white border border-[#E8E8E8] rounded-2xl p-5 flex flex-col">
                <div className="rounded-2xl h-40 flex items-center justify-center text-3xl bg-[#F3F4F6]">
                  📦
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
      </main>
    </div>
  );
}
