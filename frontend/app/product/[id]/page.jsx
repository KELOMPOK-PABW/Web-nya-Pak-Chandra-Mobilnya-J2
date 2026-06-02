"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { productService } from "@/services/productService";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { useCartContext } from "@/components/CartContext";

const formatPrice = (value) => `Rp ${Number(value).toLocaleString("id-ID")}`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  // Cart state
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  const { refreshCartCount } = useCartContext();

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

  const addToCart = async () => {
    const user = authService.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!product || !product.id) return;

    setAddingToCart(true);
    setCartMessage(null);

    try {
      await cartService.addItem({ product_id: product.id, qty: 1 });
      await refreshCartCount();
      setCartMessage({ type: "success", text: "Berhasil ditambahkan ke keranjang" });
    } catch (err) {
      setCartMessage({ type: "error", text: err.message || "Gagal menambahkan ke keranjang" });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C34] hover:text-[#16332C]"
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              {/* Product Image */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <div className="rounded-3xl h-72 flex items-center justify-center text-6xl bg-[#F3F4F6]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
              </div>

              {/* Product Info */}
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
                    <p className="text-sm font-semibold text-[#1A1A1A] capitalize">{product.stock_status || "tersedia"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 sticky top-24">
                <h2 className="text-base font-semibold text-[#1A1A1A]">Ringkasan Pembelian</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Harga</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatPrice(product.price)}</span>
                  </div>
                </div>

                {/* Cart feedback message */}
                {cartMessage && (
                  <div className={`mt-3 rounded-xl px-4 py-2.5 text-[13px] font-medium ${
                    cartMessage.type === "success"
                      ? "bg-[#F0FBF8] border border-[#C8EDE8] text-[#1A3C34]"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                    {cartMessage.text}
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3">
                  <button
                    onClick={addToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-3 text-center hover:bg-[#16332C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full cursor-pointer"
                  >
                    {addingToCart
                      ? "Menambahkan..."
                      : product.stock === 0
                        ? "Stok Habis"
                        : "Tambah ke Keranjang"}
                  </button>
                  <Link
                    href="/products"
                    className="rounded-xl border border-[#E8E8E8] text-[#555] text-sm font-semibold py-3 text-center hover:bg-[#FAFAF8] transition-colors block"
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
