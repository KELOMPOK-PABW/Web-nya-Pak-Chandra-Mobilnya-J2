"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BottomBar } from "@/components/layout/BottomBar";
import {
  Sparkles, Star, Plus, Search, Bot, Home,
  ShoppingCart, User, Package, ChevronLeft, ChevronRight,
  Tag, Zap, MessageCircle,
} from "lucide-react";
import { productService } from "@/services/productService";
import { authService } from "@/services/authService";

/* ── Natural language detection ── */
function isNaturalLanguage(query) {
  const trimmed = query.trim();
  if (!trimmed) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 3) return true;
  const nlTriggers = ["cari", "butuh", "rekomendasi", "rekomendasiin", "saran", "tanya", "yang", "mirip", "terbaik", "murah"];
  const lower = trimmed.toLowerCase();
  return nlTriggers.some(t => lower.startsWith(t) || lower.includes(` ${t}`));
}

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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [chatSessionId, setChatSessionId] = useState(null);
  const [searchMode, setSearchMode] = useState("auto"); // 'auto' | 'search' | 'ai'

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
    const q = searchInput.trim();
    if (!q) return;

    // Decide mode: auto-detect NL, or respect explicit mode
    const useAi = searchMode === "ai" || (searchMode === "auto" && isNaturalLanguage(q));

    if (useAi) {
      handleAiSendMessage(q);
    } else {
      setSearch(q);
      setPage(1);
      setActiveCategory(null);
      setShowAiResult(false);
    }
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
    setAiSearchQuery(msg);

    try {
      const token = authService.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/llm/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          message: msg,
          ...(chatSessionId ? { session_id: chatSessionId } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Gagal mendapatkan respons AI");
      }
      const result = json.data;
      if (result.session_id) setChatSessionId(result.session_id);
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

  const handleQuickPrompt = (q) => {
    setSearchInput(q);
    setSearchMode("ai");
    setShowMobileSearch(false);
    handleAiSendMessage(q);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]"
      style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* ── NAVBAR (unified) ── */}
      <Navbar onSearchOpen={() => setShowMobileSearch(true)} />

      {/* ── SEARCH BAR ── */}
      <div className="bg-white border-b border-[#EBEBEB] shadow-sm">
        <div className="max-w-[1280px] mx-auto px-5 py-3">
          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative flex-1">
              <input
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (searchMode === "auto" && isNaturalLanguage(e.target.value)) {
                    setSearchMode("auto");
                  }
                }}
                placeholder="Cari produk impianmu..."
                className="w-full h-11 pl-12 pr-24 rounded-full bg-[#F5F5F5] border border-transparent focus:bg-white focus:border-[#1A3C34]/30 focus:ring-2 focus:ring-[#1A3C34]/10 transition-all text-[15px] outline-none"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search size={18} color="#888" />
              </button>
              {searchInput.trim() && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSearchMode(searchMode === "ai" ? "auto" : "ai")}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                      searchMode === "ai" || (searchMode === "auto" && isNaturalLanguage(searchInput))
                        ? "bg-[#0D2B26] text-white border-[#0D2B26]"
                        : "bg-white text-[#888] border-[#E5E7EB] hover:border-[#0D2B26]"
                    }`}
                  >
                    {searchMode === "ai" || isNaturalLanguage(searchInput) ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
                        <Sparkles size={11} strokeWidth={2.5} />
                        AI
                      </span>
                    ) : (
                      <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
                        <Search size={11} strokeWidth={2.5} />
                        Cari
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Mobile search (toggled by Navbar search icon) */}
          {showMobileSearch && (
            <form onSubmit={handleSearch} className="md:hidden relative">
              <input
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  if (searchMode === "auto" && isNaturalLanguage(e.target.value)) {
                    setSearchMode("auto");
                  }
                }}
                placeholder="Cari produk impianmu..."
                autoFocus
                className="w-full h-11 pl-12 pr-24 rounded-full bg-[#F5F5F5] border border-[#E5E7EB] focus:border-[#0D2B26]/30 focus:ring-2 focus:ring-[#0D2B26]/10 transition-all text-[15px] outline-none"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search size={18} color="#888" />
              </button>
              {searchInput && (
                <>
                  <button
                    type="button"
                    onClick={() => setSearchMode(searchMode === "ai" ? "auto" : "ai")}
                    className={`absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      searchMode === "ai" || (searchMode === "auto" && isNaturalLanguage(searchInput))
                        ? "bg-[#0D2B26] text-white border-[#0D2B26]"
                        : "bg-white text-[#888] border-[#E5E7EB]"
                    }`}
                  >
                    {searchMode === "ai" || isNaturalLanguage(searchInput) ? (
                      <Sparkles size={10} strokeWidth={2.5} />
                    ) : (
                      <Search size={10} strokeWidth={2.5} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchInput(""); setSearch(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>

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

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, position: "relative" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #4DB6AC, #26A69A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.4 }}>
              Coba tanya AI untuk rekomendasi produk — atau langsung
              <span style={{ color: "#4DB6AC", fontWeight: 600 }}> cari </span>
              di kolom pencarian di atas
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => handleQuickPrompt(q)} disabled={aiLoading}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 99, padding: "6px 14px", fontSize: 12,
                color: "rgba(255,255,255,0.85)", cursor: aiLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap", opacity: aiLoading ? 0.5 : 1,
                }}>
                {q}
              </button>
            ))}
          </div>
        <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes typingDot{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-6">

        {/* ── AI RESULT ── */}
        {showAiResult && (
          <div className="mb-8">
            {/* ── AI response header ── */}
            {aiLoading ? (
              <div className="bg-white rounded-xl border border-[#EBEBEB] py-8 text-center">
                {/* Animated gradient bar instead of dots */}
                <div style={{
                  maxWidth: 240, margin: "0 auto 16px",
                  height: 4, borderRadius: 2, overflow: "hidden",
                  background: "#E5E7EB",
                }}>
                  <div style={{
                    width: "40%", height: "100%", borderRadius: 2,
                    background: "linear-gradient(90deg, #4DB6AC, #1A3C34, #4DB6AC)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }} />
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                  Mencari &ldquo;{aiSearchQuery.length > 50 ? aiSearchQuery.slice(0, 50) + "…" : aiSearchQuery}&rdquo;
                </p>
                <p className="text-xs text-gray-400">
                  {chatSessionId ? "Melanjutkan percakapan…" : "AI sedang menganalisis permintaan…"}
                </p>
              </div>
            ) : aiResult && (
              <>
                {/* ── AI message bubble ── */}
                <div className="bg-gradient-to-br from-[#1A3C34] to-[#2D6A5E] rounded-2xl px-5 py-4 mb-5 flex items-start gap-3 shadow-lg shadow-emerald-900/15">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5 backdrop-blur-sm">
                    <Bot size={16} color="white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-white/90 font-medium leading-relaxed">
                      {aiResult.message}
                    </p>
                  </div>
                  <button onClick={() => { setShowAiResult(false); setAiResult(null); setSearch(""); setSearchInput(""); }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* ── AI product grid ── */}
                {aiResult.products.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-[15px] font-bold text-[#1A1A1A]">Rekomendasi AI</h2>
                      <span className="text-[11px] text-gray-400">{aiResult.products.length} produk</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {aiResult.products.map(p => (
                        <Link key={p.id} href={`/product/${p.id}`}
                          style={{ textDecoration: "none" }}
                          className="block bg-white rounded-xl border border-[#EBEBEB] overflow-hidden hover:border-[#1A3C34] hover:shadow-md transition-all">
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
                            <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug mb-1 line-clamp-2">{p.name}</p>
                            <p className="text-[11px] text-gray-400 mb-2">{p.store?.store_name}</p>
                            <p className="text-[13px] font-bold text-[#1A3C34]">{fmt(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Empty state ── */}
                {aiResult.products.length === 0 && (
                  <div className="bg-white rounded-xl border border-[#EBEBEB] py-12 text-center text-gray-400">
                    <Search size={40} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Produk tidak ditemukan</p>
                    <button onClick={() => { setShowAiResult(false); setAiResult(null); }}
                      className="mt-3 text-[13px] font-semibold text-[#1A3C34] hover:underline cursor-pointer">
                      Coba pencarian lain
                    </button>
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
              {showAiResult
                ? "Jelajahi Produk Lainnya"
                : search
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

      <BottomBar />
    </div>
  );
}


