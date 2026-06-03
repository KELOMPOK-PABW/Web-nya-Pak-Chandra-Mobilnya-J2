"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { productService } from "@/services/productService";
import { ReviewList } from "@/components/reviews/ReviewList";

export default function ProductDetail() {
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
        setError(err.message || "Gagal mengambil produk");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-7xluto px-6 py-8">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : product ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">{product.name}</h1>
            <div className="mb-4 text-sm text-[#777]">{product.desc}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <img src={product.image_url} alt={product.name} className="w-full rounded-lg object-cover" />
              </div>
              <div>
                <div className="text-lg font-bold">Harga: Rp {product.price.toLocaleString("id-ID")}</div>
                <div className="mt-2">Stok: {product.stock} ({product.stock_status})</div>
                <div className="mt-2">Toko: {product.store?.store_name}</div>
                <div className="mt-2">Kategori: {product.category?.category_name}</div>
              </div>
            </div>
            <ReviewList title={`Ulasan ${product.name}`} />
          </div>
        ) : (
          <div>Produk tidak ditemukan</div>
        )}
      </main>
    </div>
  );
}
