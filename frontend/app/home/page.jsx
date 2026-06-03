"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Send, Star, Plus, Search, Bot, Home,
  ShoppingCart, User, Package, ChevronLeft, ChevronRight,
  Tag, Zap, MessageCircle,
} from "lucide-react";
import { productService } from "@/services/productService";
import { authService } from "@/services/authService";

const QUICK_PROMPTS = [
  "Cari sepatu lari di bawah 500rb",
  "Rekomendasi laptop gaming terbaik",
  "Produk fashion wanita terbaru",
  "Elektronik murah berkualitas",
  "Produk terlaris minggu ini",
];

const CATEGORY_ICONS = {
  Fashion: "👕",
  Gadget: "📱",
  Rumah: "🏠",
  Makanan: "🍕",
  Olahraga: "🏃",
  Kecantikan: "💄",
  Elektronik: "💻",
  Otomotif: "🚗",
};

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}
      className="block bg-white rounded-xl border border-[#EBEBEB] overflow-hidden hover:border-[#1A3C34] transition-colors">
      <div className="h-28 flex items-center justify-center bg-[#F0FBF8] overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<svg width=\"40\" height=\"40\" stroke=\"#A5D6D0\" fill=\"none\" stroke-width=\"1\"><path d=\"M20 12v10m0 4v2M4 12h32M4 12l4-8h24l4 8M4 12v16a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V12\"/></svg>'; }} />
        ) : (
          <Package size={40} strokeWidth={1} color="#A5D6D0" />
        )}
      </div>
      <div className="p-3">
        <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug mb-1">{product.name}</p>
        <p className="text-[11px] text-gray-400 mb-2">{product.store?.store_name}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-[#1A3C34]">{fmt(product.price)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Real API state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const LIMIT = 8;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [prods, cats] = await Promise.all([
          productService.getProducts({ page: 1, limit: 50, keyword: search || undefined, category_id: activeCategory || undefined }),
          productService.getCategories(),
        ]);
        if (!mounted) return;
        setProducts(prods.data || []);
        setTotalItems(prods.meta?.total_items || 0);
        setCategories(cats || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Gagal memuat data");
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [search, activeCategory]);

  const filtered = useMemo(() => {
    if (!products || products.length === 0) return [];
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.store?.store_name?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter(p => p.category?.id === activeCategory);
    }
    return result;
  }, [products, search, activeCategory]);

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    setActiveCategory(null);
    setShowAiResult(false);
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(prev => prev === catId ? null : catId);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setShowAiResult(false);
  };

  const handleAiSendMessage = async (msg) => {
    if (!msg.trim() || aiLoading) return;
    setAiLoading(true);
    setShowAiResult(true);
    setAiResult(null);
    setPrompt("");

    try {
      const token = authService.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/llm/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ message: msg }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Gagal mendapatkan respons AI");
      }
      const result = json.data;
      setAiResult({
        message: result.reply || `Menampilkan hasil untuk "${msg}"`,
        products: result.suggested_products || [],
      });
    } catch {
      // Fallback: search by keyword if LLM fails
      setSearch(msg);
      setSearchInput(msg);
      setAiResult({ message: `Menampilkan hasil untuk "${msg}"`, products: [] });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSend = () => handleAiSendMessage(prompt);

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20"
      style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* ── NAVBAR with search ── */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#EBEBEB] shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between gap-6">
          <Link href="/home" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1A3C34]">
              <ShoppingCart size={18} color="white" strokeWidth={1.8} />
            </div>
            <span className="font-bold text-lg text-[#1A3C34] tracking-tight hidden sm:block">
              PABW Shop
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:flex">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Cari produk impianmu..."
              className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F5F5F5] border border-transparent focus:bg-white focus:border-[#1A3C34]/30 focus:ring-2 focus:ring-[#1A3C34]/10 transition-all text-[15px] outline-none"
            />
            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search size={18} color="#888" />
            </button>
          </form>

          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/chat" className="p-2 text-[#555] hover:text-[#1A3C34] transition-colors" title="AI Shopping Assistant">
              <Bot size={22} strokeWidth={1.8} />
            </Link>
            <Link href="/cart" className="relative p-2 text-[#555] hover:text-[#1A3C34] transition-colors">
              <ShoppingCart size={22} strokeWidth={1.8} />
            </Link>
            <div className="h-6 w-px bg-[#EBEBEB]" />
            <Link href="/profile" className="flex items-center gap-2 hover:bg-[#F9FAFB] p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-[#E5E7EB]">
              <div className="w-8 h-8 rounded-full bg-[#E0F2F1] text-[#1A3C34] flex items-center justify-center font-bold text-sm">
                <User size={16} color="#1A3C34" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO + AI ── */}
      <div style={{ background: "#1A3C34", padding: "24px 20px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4, position: "relative" }}>
          Selamat datang di PABW Shop
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20, position: "relative" }}>
          Temukan produk impianmu dengan bantuan AI
        </p>

        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.15)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", letterSpacing: "0.8px", textTransform: "uppercase" }}>
              AI Shopping Assistant
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAiSend()}
              placeholder="Contoh: sepatu lari wanita di bawah 500rb..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14,
                fontFamily: "inherit", outline: "none",
              }}
            />
            <button onClick={handleAiSend}
              disabled={aiLoading || !prompt.trim()}
              style={{
                width: 44, height: 44, borderRadius: 10, background: "#4DB6AC", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: aiLoading || !prompt.trim() ? "not-allowed" : "pointer",
                opacity: aiLoading || !prompt.trim() ? 0.6 : 1, flexShrink: 0,
              }}>
              <Send size={16} color="white" />
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} onClick={() => handleAiSendMessage(q)} disabled={aiLoading}
                style={{
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 99, padding: "5px 12px", fontSize: 12,
                  color: "rgba(255,255,255,0.8)", cursor: aiLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap", opacity: aiLoading ? 0.5 : 1,
                }}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-6">

        {/* ── AI RESULT ── */}
        {showAiResult && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E0F2F1] flex items-center justify-center">
                  <Bot size={14} color="#1A3C34" />
                </div>
                <span className="text-[15px] font-bold text-[#1A1A1A]">Hasil AI</span>
              </div>
              <button onClick={() => { setShowAiResult(false); setAiResult(null); }}
                className="text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors">
                Hapus hasil
              </button>
            </div>

            {aiLoading ? (
              <div className="bg-white rounded-xl border border-[#EBEBEB] py-12 text-center">
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#1A3C34",
                      animation: `pulse 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <p className="text-sm text-gray-400">AI sedang mencari produk...</p>
              </div>
            ) : aiResult && (
              <>
                <div className="bg-[#F0FBF8] border border-[#C8EDE8] rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1A3C34] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} color="white" />
                  </div>
                  <p className="text-[13px] text-[#1A3C34] font-medium leading-relaxed">
                    {aiResult.message}
                  </p>
                </div>
                {aiResult.products.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[#EBEBEB] py-12 text-center text-gray-400">
                    <Search size={40} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Produk tidak ditemukan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {aiResult.products.map(p => (
                      <Link key={p.id} href={`/product/${p.id}`}
                        style={{ textDecoration: "none" }}
                        className="block bg-white rounded-xl border border-[#EBEBEB] overflow-hidden hover:border-[#1A3C34] transition-colors">
                        <div className="h-28 flex items-center justify-center bg-[#F0FBF8] overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<svg width=\"40\" height=\"40\" stroke=\"#A5D6D0\" fill=\"none\" stroke-width=\"1\"><path d=\"M20 12v10m0 4v2M4 12h32M4 12l4-8h24l4 8M4 12v16a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V12\"/></svg>'; }} />
                          ) : (
                            <Package size={40} strokeWidth={1} color="#A5D6D0" />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug mb-1">{p.name}</p>
                          <p className="text-[11px] text-gray-400 mb-2">{p.store?.store_name}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[13px] font-bold text-[#1A3C34]">{fmt(p.price)}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── BANNER ── */}
        <div className="rounded-2xl mb-6 flex items-center justify-between px-6 py-5"
          style={{ background: "linear-gradient(135deg,#1A3C34 0%,#2D6A5E 100%)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", left: 220, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} color="#4DB6AC" fill="#4DB6AC" />
              <span style={{ color: "#4DB6AC", fontSize: 12, fontWeight: 700 }}>PROMO HARI INI</span>
            </div>
            <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Diskon hingga 70%!</p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Untuk semua kategori pilihan</p>
          </div>
          <Link href="/products" style={{ background: "#4DB6AC", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0, position: "relative", textDecoration: "none" }}>
            Belanja Kini
          </Link>
        </div>

        {/* ── KATEGORI ── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#1A1A1A]">Kategori</h2>
          {activeCategory && (
            <button onClick={() => { setActiveCategory(null); setPage(1); }}
              className="text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors">
              Reset filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-3 mb-6 sm:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-xl border border-[#EBEBEB] animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-200 mb-1.5" />
                <div className="h-3 w-14 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-6 sm:grid-cols-8">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer"
                style={{
                  background: activeCategory === cat.id ? "#E0F2F1" : "white",
                  border: activeCategory === cat.id ? "1.5px solid #1A3C34" : "1px solid #EBEBEB",
                }}>
                <div className="w-10 h-10 rounded-xl bg-[#F0FBF8] flex items-center justify-center mb-1.5 text-lg">
                  {CATEGORY_ICONS[cat.category_name] || "📦"}
                </div>
                <p className="text-[10px] font-semibold text-center"
                  style={{ color: activeCategory === cat.id ? "#1A3C34" : "#374151" }}>
                  {cat.category_name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* ── PRODUK ── */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-[#1A1A1A]">
              {search
                ? `Hasil pencarian "${search}"`
                : activeCategory
                  ? `Kategori: ${categories.find(c => c.id === activeCategory)?.category_name || ""}`
                  : "Produk Populer"}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{loading ? "Memuat..." : `${filtered.length} produk ditemukan`}</p>
          </div>
          <Link href="/products" className="text-[12px] font-semibold text-[#1A3C34]" style={{ textDecoration: "none" }}>
            Lihat semua
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden animate-pulse">
                <div className="h-28 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBEBEB] py-16 text-center text-gray-400">
            <Search size={40} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Produk tidak ditemukan</p>
            <button onClick={() => { setSearch(""); setSearchInput(""); setActiveCategory(null); setPage(1); }}
              className="mt-3 text-[13px] font-semibold text-[#1A3C34] hover:underline">
              Reset pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {paginated.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-lg border border-[#EBEBEB] bg-white flex items-center justify-center disabled:opacity-40 hover:border-[#1A3C34] transition-colors">
              <ChevronLeft size={16} color="#555" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i}
                onClick={() => setPage(i + 1)}
                className="w-9 h-9 rounded-lg text-[13px] font-semibold transition-colors"
                style={{
                  background: page === i + 1 ? "#1A3C34" : "white",
                  color: page === i + 1 ? "white" : "#555",
                  border: page === i + 1 ? "none" : "1px solid #EBEBEB",
                }}>
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-lg border border-[#EBEBEB] bg-white flex items-center justify-center disabled:opacity-40 hover:border-[#1A3C34] transition-colors">
              <ChevronRight size={16} color="#555" />
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EBEBEB]"
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
    </div>
  );
}


