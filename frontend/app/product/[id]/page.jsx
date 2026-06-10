"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { BottomBar } from "@/components/layout/BottomBar";
import { productService } from "@/services/productService";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { useCartContext } from "@/components/CartContext";
import { useToast } from "@/components/ui/Toast";
import ChatPopup from "@/components/chat/ChatPopup";
import { ReviewList } from "@/components/reviews/ReviewList";
import ProactivePrompt from "@/components/chat/ProactivePrompt";
import useStruggleDetection from "@/hooks/useStruggleDetection";
import { formatPrice } from "@/utils/format";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  const { showToast } = useToast();

  // Cart state
  const [addingToCart, setAddingToCart] = useState(false);

  // Chat popup state
  const [showChat, setShowChat] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);

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

  // ── Struggle detection (dwell) ──
  const struggle = useStruggleDetection({
    pageType: "pdp",
    productId: id,
    onSignal: (signal) => {
      // Dwell detected — ProactivePrompt will show
    },
  });

  // Auto-open chat sidebar when navigated from /chat (?chat=1)
  useEffect(() => {
    if (searchParams.get("chat") === "1") {
      const sid = searchParams.get("sid");
      if (sid) setChatSessionId(sid);
      setShowChat(true);
      // Clean up URL — remove query params without full page reload
      window.history.replaceState({}, "", `/product/${id}`);
    }
  }, [searchParams, id]);

  const addToCart = async () => {
    const user = authService.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!product || !product.id) return;

    setAddingToCart(true);

    try {
      await cartService.addItem({ product_id: product.id, qty: 1 });
      await refreshCartCount();
      showToast({ type: "success", message: `${product.name} berhasil ditambahkan ke keranjang!` });
    } catch (err) {
      showToast({ type: "error", message: err.message || "Gagal menambahkan ke keranjang" });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } .animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }`}</style>
      <Navbar />

      <div className={`flex ${showChat ? "" : ""}`}>
      <main className={`flex-1 min-w-0 px-6 py-8 transition-all duration-250 ease-out ${
        showChat ? "" : "max-w-[1280px] mx-auto"
      }`}>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left skeleton */}
            <div className="space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <div className="h-72 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-3xl animate-shimmer bg-[length:200%_100%]" />
              </div>
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 space-y-4">
                <div className="h-7 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-2/3 animate-shimmer bg-[length:200%_100%]" />
                <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/3 animate-shimmer bg-[length:200%_100%]" />
                <div className="h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/4 animate-shimmer bg-[length:200%_100%]" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl animate-shimmer bg-[length:200%_100%]" />
                  ))}
                </div>
              </div>
            </div>
            {/* Right skeleton */}
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 sticky top-24 space-y-4">
              <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/2 animate-shimmer bg-[length:200%_100%]" />
              <div className="h-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/3 animate-shimmer bg-[length:200%_100%]" />
              <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl animate-shimmer bg-[length:200%_100%]" />
              <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl animate-shimmer bg-[length:200%_100%]" />
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
              {/* ── Proactive prompt (dwell detection) ── */}
              {struggle.signals.some(s => s.type === "DWELL") && (
                <ProactivePrompt
                  type="DWELL"
                  productName={product?.name}
                  onDismiss={() => struggle.dismiss("DWELL")}
                  onAction={(action) => {
                    if (action === "ask" || action === "compare") {
                      setShowChat(true);
                    }
                    struggle.dismiss("DWELL");
                  }}
                />
              )}

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

              {/* Reviews */}
            <ReviewList productId={product.id ?? id} title={`Ulasan ${product.name}`} />
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

                <div className="mt-5 flex flex-col gap-2">
                  {/* Primary: Add to Cart */}
                  <button
                    onClick={addToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-2.5 text-center hover:bg-[#16332C] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] w-full cursor-pointer"
                  >
                    {addingToCart
                      ? "Menambahkan..."
                      : product.stock === 0
                        ? "Stok Habis"
                        : "🛒 Tambah ke Keranjang"}
                  </button>

                  {/* Secondary row: Chat + Compare side by side */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowChat(true)}
                      className="rounded-xl border border-[#1A3C34]/30 bg-[#F0FBF8] text-[#1A3C34] text-[12px] font-semibold py-2.5 text-center hover:bg-[#D8F5F0] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      Tanya AI
                    </button>
                    <button
                      onClick={() => {
                        setShowChat(true);
                        window.history.replaceState({}, '', `/product/${id}?chat=1&compare=1`);
                      }}
                      className="rounded-xl border border-[#E8E8E8] text-[#555] text-[12px] font-semibold py-2.5 text-center hover:bg-[#FAFAF8] hover:border-[#1A3C34]/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 3h5v5"/>
                        <path d="M8 3H3v5"/>
                        <path d="M16 21h5v-5"/>
                        <path d="M8 21H3v-5"/>
                      </svg>
                      Bandingkan
                    </button>
                  </div>

                  {/* Tertiary: Continue shopping */}
                  <Link
                    href="/products"
                    className="rounded-xl border border-[#E8E8E8] text-[#888] text-[12px] font-medium py-2 text-center hover:bg-[#FAFAF8] hover:text-[#555] transition-colors block"
                  >
                    ← Lanjut Belanja
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

        {/* ── CHAT SIDEBAR ── */}
        {showChat && product && (
          <ChatPopup
            product={product}
            onClose={() => setShowChat(false)}
            initialSessionId={chatSessionId}
          />
        )}
      </div>

      <BottomBar />
    </div>
  );
}
