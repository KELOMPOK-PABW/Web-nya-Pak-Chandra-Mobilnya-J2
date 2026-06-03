"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { productService } from "@/services/productService";
import { ReviewList } from "@/components/reviews/ReviewList";

const formatPrice = (value) => `Rp ${Number(value).toLocaleString("id-ID")}`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const p = await productService.getProductById(id);
        if (!mounted) return;
        setProduct(p);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Gagal memuat produk");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C34]"
          >
            ← Kembali ke daftar produk
          </Link>
          {product && (
            <div className="text-xs text-[#888]">
              {product.category?.category_name} • {product.stock} stok
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 animate-pulse">
            <div className="h-72 bg-gray-200 rounded-3xl" />
            <div className="mt-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/5" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 text-center">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Gagal memuat produk</h1>
            <p className="text-sm text-[#777] mt-2">{error}</p>
            <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-[#1A3C34]">
              ← Kembali ke daftar produk
            </Link>
          </div>
        ) : !product ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 text-center">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Produk tidak ditemukan</h1>
            <p className="text-sm text-[#777] mt-2">Coba kembali ke halaman daftar produk.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <div
                  className="rounded-3xl h-72 flex items-center justify-center text-6xl bg-[#F3F4F6]"
                >
                  📦
                </div>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">{product.name}</h1>
                    <p className="text-sm text-[#777] mt-1">{product.store?.store_name}</p>
                  </div>
                </div>

                <p className="text-3xl font-bold text-[#1A3C34] mt-4">{formatPrice(product.price)}</p>
                <p className="text-sm text-[#777] mt-3 leading-relaxed">{product.desc || product.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Kategori</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.category?.category_name}</p>
                  </div>
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Stok</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.stock} tersedia</p>
                  </div>
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Seller</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.store?.store_name}</p>
                  </div>
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Status</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.stock_status || "tersedia"}</p>
                  </div>
                </div>
              </div>
              </div>

              <aside className="space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <h2 className="text-base font-semibold text-[#1A1A1A]">Ringkasan Pembelian</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Harga</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatPrice(product.price)}</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href={`/product/${product.id}`}
                    className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-3 text-center hover:bg-[#16332C] transition-colors block"
                  >
                    Lihat Detail & Beli
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <h3 className="text-base font-semibold text-[#1A1A1A]">Highlight</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#777]">
                  <li>• Garansi 7 hari pengembalian</li>
                  <li>• Pengiriman cepat seluruh Indonesia</li>
                  <li>• Produk asli dari seller terverifikasi</li>
                </ul>
              </div>
            </aside>
            </div>

            <ReviewList title={`Ulasan ${product.name}`} />
          </div>
        )}
      </main>
    </div>
  );
}
