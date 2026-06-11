"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { chatService } from "@/services/chatService";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { useCartContext } from "@/components/CartContext";
import { Package, Bot, MessageSquare, ChevronDown, Loader2, Trash2, AlertCircle, Send } from "lucide-react";
import ComparisonCard from "@/components/chat/ComparisonCard";
import ReviewSummary from "@/components/chat/ReviewSummary";
import ConfirmationCard from "@/components/chat/ConfirmationCard";
import MemoryPanel from "@/components/chat/MemoryPanel";

const STORAGE_KEY = "chat_session_id";

const QUICK_PROMPTS = [
  "Cari sepatu lari di bawah 500rb",
  "Rekomendasi laptop gaming terbaik",
  "Produk fashion wanita terbaru",
  "Elektronik murah berkualitas",
];

function fmt(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function ProductCard({ product, onAddToCart, addingToCart, sessionId }) {
  const pid = product.product_id ?? product.id;
  const name = product.name ?? product.product_name;
  const price = product.price ?? product.product_price;
  const sellerName = product.store?.store_name ?? product.seller?.name ?? "";
  const productHref = `/product/${pid}?chat=1${sessionId ? `&sid=${sessionId}` : ""}`;
  return (
    <div className="block bg-white rounded-xl border border-[#EBEBEB] overflow-hidden hover:border-[#1A3C34] transition-colors flex-shrink-0 w-[180px]">
      <Link href={productHref} style={{ textDecoration: "none" }}>
        <div className="h-24 flex items-center justify-center bg-[#F0FBF8]">
          <Package size={32} color="#A5D6D0" strokeWidth={1.5} />
        </div>
        <div className="p-3">
          <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug mb-1 line-clamp-2">{name}</p>
          {sellerName && <p className="text-[10px] text-gray-400 mb-1">{sellerName}</p>}
          <p className="text-[13px] font-bold text-[#1A3C34]">{fmt(price)}</p>
        </div>
      </Link>
      {onAddToCart && (
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          disabled={addingToCart}
          className="w-full bg-[#1A3C34] text-white text-[11px] font-semibold py-2 hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50"
        >
          {addingToCart ? "Menambahkan..." : "🛒 Tambah ke Keranjang"}
        </button>
      )}
    </div>
  );
}

const PRODUCT_INTENTS = ["search_product", "compare", "add_to_cart"];

function ChatBubble({ role, content, products, intent, entities, followUpSuggestions, onFollowUp, onAddToCart, onCheckout, onTrackOrder, onClearCart, addingToCart, sessionId, reviewData, confidence, citations }) {
  const isUser = role === "user";
  const isProductRelated = PRODUCT_INTENTS.includes(intent);
  const isCompare = intent === "compare";
  const showCartButton = intent === "add_to_cart" && products && products.length > 0;
  const showCheckoutButton = intent === "checkout_order";
  const showTrackButton = intent === "track_order" && entities?.order_id;
  const showClearCartButton = intent === "clear_cart";
  const hasReviewData = reviewData || (products?.[0]?.review_summary);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className="flex gap-2 max-w-[90%]">
        {!isUser && (
          <div className="w-8 h-8 rounded-xl bg-[#1A3C34] flex items-center justify-center flex-shrink-0 mt-1">
            <Bot size={16} color="white" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <div className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? "bg-gradient-to-br from-[#1A3C34] to-[#2D6A5E] text-white rounded-br-md shadow-md shadow-emerald-900/10"
              : "bg-white border border-[#EBEBEB] text-[#1A1A1A] rounded-bl-md shadow-sm hover:shadow-md transition-shadow"
          }`}>
            {content}
          </div>

          {/* ComparisonCard (2+ products) */}
          {!isUser && isCompare && products && products.length >= 2 && (
            <div className="mt-2">
              <ComparisonCard
                products={products}
                onAddToCart={onAddToCart}
                addingToCart={addingToCart}
              />
            </div>
          )}

          {/* ReviewSummary */}
          {!isUser && hasReviewData && !isCompare && (
            <div className="mt-2">
              <ReviewSummary
                summary={reviewData || products?.[0]?.review_summary}
                reviews={products?.[0]?.reviews || []}
                productName={products?.[0]?.name ?? products?.[0]?.product_name}
              />
            </div>
          )}

          {/* Add-to-cart single button (non-compare) */}
          {!isUser && showCartButton && !isCompare && (
            <div className="mt-2">
              <button
                onClick={() => onAddToCart && onAddToCart(products[0])}
                disabled={addingToCart}
                className="w-full bg-[#1A3C34] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                <span>{addingToCart ? "Menambahkan..." : "Tambah ke Keranjang"}</span>
              </button>
            </div>
          )}

          {!isUser && showCheckoutButton && (
            <div className="mt-2">
              <button
                onClick={onCheckout}
                className="w-full bg-[#E8A838] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#D09828] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>💳</span>
                <span>Lanjut ke Checkout</span>
              </button>
            </div>
          )}

          {!isUser && showTrackButton && (
            <div className="mt-2">
              <button
                onClick={() => onTrackOrder && onTrackOrder(entities.order_id)}
                className="w-full bg-[#2563EB] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#1D4ED8] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📦</span>
                <span>Lacak Pesanan #{entities.order_id}</span>
              </button>
            </div>
          )}

          {!isUser && showClearCartButton && (
            <div className="mt-2">
              <button
                onClick={() => onClearCart && onClearCart()}
                className="w-full bg-red-600 text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🗑️</span>
                <span>Kosongkan Keranjang</span>
              </button>
            </div>
          )}

          {/* Product cards (non-compare search results) */}
          {!isUser && isProductRelated && !isCompare && products && products.length > 0 && !showCartButton && (
            <div className="mt-3 max-w-full">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {products.map((p, i) => (
                  <ProductCard
                    key={p.product_id ?? p.id ?? i}
                    product={p}
                    onAddToCart={onAddToCart}
                    addingToCart={addingToCart}
                    sessionId={sessionId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Follow-up suggestion chips */}
          {!isUser && followUpSuggestions && followUpSuggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {followUpSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp && onFollowUp(suggestion)}
                  className="bg-[#F0FBF8] border border-[#C8EDE8] rounded-full px-3 py-1.5 text-[12px] font-medium text-[#1A3C34] hover:bg-[#D8F5F0] hover:border-[#1A3C34] transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Source citations */}
          {!isUser && citations && citations.length > 0 && (
            <div className="mt-2 border-t border-[#F0F0F0] pt-2">
              <p className="text-[10px] text-gray-400 mb-1 font-medium">Sumber:</p>
              {citations.map((cit, i) => (
                <div key={i} className="text-[10px] text-gray-400">
                  <a href={cit.url} target="_blank" rel="noopener noreferrer"
                    className="text-[#1A3C34] hover:underline">
                    {cit.label || `Sumber ${i + 1}`}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionList({ sessions, activeId, onSelect, onNew, onDelete }) {
  const [collapsed, setCollapsed] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const active = sessions.find((s) => s.id === activeId);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(sessionId);
    try {
      await onDelete(sessionId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 bg-white border border-[#EBEBEB] rounded-xl px-3 py-2 text-[13px] font-semibold text-[#1A1A1A] hover:border-[#1A3C34] transition-colors cursor-pointer"
        >
          <MessageSquare size={14} />
          {active ? active.title : "Riwayat Chat"}
          <ChevronDown size={12} className={`transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
        <button onClick={onNew}
          className="bg-[#1A3C34] text-white rounded-xl px-3 py-2 text-[12px] font-semibold hover:bg-[#2D6A5E] transition-colors cursor-pointer">
          + Baru
        </button>
      </div>

      {!collapsed && sessions.length > 0 && (
        <div className="mt-2 bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
          {sessions.map((s) => (
            <div key={s.id}
              className={`flex items-center border-b border-[#F0F0F0] last:border-b-0 ${
                s.id === activeId ? "bg-[#F0FBF8]" : ""
              }`}>
              <button
                onClick={() => onSelect(s.id)}
                className={`flex-1 text-left px-4 py-3 text-[13px] hover:bg-[#F0FBF8] transition-colors cursor-pointer ${
                  s.id === activeId ? "font-semibold text-[#1A3C34]" : "text-[#1A1A1A]"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="truncate mr-2">{s.title}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{s.message_count} pesan</span>
                </div>
                {s.last_message && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{s.last_message}</p>
                )}
              </button>
              <button
                onClick={(e) => handleDelete(e, s.id)}
                disabled={deletingId === s.id}
                className="px-3 py-3 text-gray-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-30"
                title="Hapus sesi"
              >
                {deletingId === s.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { refreshCartCount } = useCartContext();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null); // { type: 'success'|'error', message }
  const [confirmAction, setConfirmAction] = useState(null); // { action: 'clear_cart' } | null
  const [pendingProduct, setPendingProduct] = useState(null);
  const [confirmQty, setConfirmQty] = useState(1);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const sessionIdRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auth guard
  useEffect(() => {
    const user = authService.getUser();
    if (!user) router.push("/auth/login");
  }, [router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, cartFeedback]);

  // Focus input after loading finishes
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // Clear cart feedback after 5 seconds
  useEffect(() => {
    if (!cartFeedback) return;
    const t = setTimeout(() => setCartFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [cartFeedback]);

  // --- Load sessions and restore last active session on mount ---
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setSessionsLoading(true);
        const sess = await chatService.getSessions();
        if (cancelled) return;
        setSessions(sess);

        const storedId = sessionStorage.getItem(STORAGE_KEY);
        let targetId = null;

        if (storedId && sess.some((s) => String(s.id) === storedId)) {
          targetId = Number(storedId);
        } else if (sess.length > 0) {
          targetId = sess[0].id;
        }

        if (targetId) {
          sessionIdRef.current = targetId;
          sessionStorage.setItem(STORAGE_KEY, String(targetId));

          const msgs = await chatService.getSessionMessages(targetId);
          if (cancelled) return;

          setMessages(
            msgs.map((m) => ({
              role: m.role,
              content: m.content,
              products: m.suggested_products || [],
              intent: m.intent,
              entities: m.entities || {},
              reviewData: m.review_summary || m.review_data || null,
              confidence: m.confidence || null,
              citations: m.citations || [],
            }))
          );
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load sessions:", e);
        }
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // --- Intent action handlers ---

  const handleRequestAddToCart = useCallback((product) => {
    setPendingProduct(product);
    setConfirmQty(1);
  }, []);

  const handleConfirmAddToCart = useCallback(async () => {
    if (!pendingProduct || addingToCart) return;
    setAddingToCart(true);
    setCartFeedback(null);
    try {
      await cartService.addItem({ product_id: pendingProduct.product_id ?? pendingProduct.id, qty: confirmQty });
      await refreshCartCount();
      setCartFeedback({ type: "success", message: `${pendingProduct.name ?? pendingProduct.product_name} (${confirmQty}x) berhasil ditambahkan!` });
      setPendingProduct(null);
    } catch (err) {
      setCartFeedback({ type: "error", message: `Gagal menambahkan: ${err.message}` });
    } finally {
      setAddingToCart(false);
    }
  }, [pendingProduct, addingToCart, confirmQty, refreshCartCount]);

  const handleCheckout = useCallback(() => {
    router.push("/checkout");
  }, [router]);

  const handleTrackOrder = useCallback((orderId) => {
    router.push(`/orders/${orderId}`);
  }, [router]);

  const handleClearCart = useCallback(() => {
    // Show confirmation first
    setConfirmAction({ action: "clear_cart" });
  }, []);

  const executeClearCart = useCallback(async () => {
    setConfirmAction(null);
    setCartFeedback(null);
    try {
      await cartService.clearCart();
      await refreshCartCount();
      setCartFeedback({ type: "success", message: "Keranjang berhasil dikosongkan!" });
    } catch (err) {
      setCartFeedback({ type: "error", message: `Gagal mengosongkan keranjang: ${err.message}` });
    }
  }, [refreshCartCount]);

  const handleFollowUp = useCallback((suggestion) => {
    setInput("");
    // Send the suggestion as a new message immediately
    const msg = suggestion;
    // Use a timeout to let React process setInput first
    setTimeout(() => {
      sendMessageRef.current(msg);
    }, 0);
  }, []);

  // We need a ref to sendMessage to avoid dependency cycles in handleFollowUp
  const sendMessageRef = useRef(null);

  const sendMessage = useCallback(async (msg) => {
    if (!msg.trim() || loading) return;

    setError(null);
    setCartFeedback(null);

    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setLoading(true);

    try {
      const result = await chatService.sendMessage({
        message: msg,
        history,
        session_id: sessionIdRef.current,
      });

      if (result.session_id) {
        sessionIdRef.current = result.session_id;
        sessionStorage.setItem(STORAGE_KEY, String(result.session_id));
        chatService.getSessions().then((sess) => setSessions(sess)).catch(() => {});
      }

      // Build assistant message with all metadata
      const assistantMsg = {
        role: "assistant",
        content: result.reply,
        products: result.suggested_products || [],
        intent: result.intent,
        entities: result.entities || {},
        followUpSuggestions: result.follow_up_suggestions || [],
        reviewData: result.review_summary || result.review_data || null,
        confidence: result.confidence || (result.intent === "search_product" ? "high" : "medium"),
        citations: result.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(err.message || "Gagal mendapatkan respons dari AI");
    } finally {
      setLoading(false);
    }
  }, [loading, messages, refreshCartCount]);

  // Keep ref in sync
  sendMessageRef.current = sendMessage;

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    sendMessage(msg);
  };

  const handleQuickSend = (msg) => {
    setInput("");
    sendMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setCartFeedback(null);
    setInput("");
    sessionIdRef.current = null;
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleSelectSession = async (id) => {
    if (id === sessionIdRef.current) return;
    try {
      setLoading(true);
      const msgs = await chatService.getSessionMessages(id);
      sessionIdRef.current = id;
      sessionStorage.setItem(STORAGE_KEY, String(id));
      setMessages(
        msgs.map((m) => ({
          role: m.role,
          content: m.content,
          products: m.suggested_products || [],
          intent: m.intent,
          entities: m.entities || {},
          reviewData: m.review_summary || m.review_data || null,
          confidence: m.confidence || null,
          citations: m.citations || [],
        }))
      );
      setError(null);
      setCartFeedback(null);
    } catch (e) {
      setError(e.message || "Gagal memuat riwayat chat");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId);

      // Remove from local sessions list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // If we deleted the active session, reset to empty or switch to another
      if (sessionId === sessionIdRef.current) {
        sessionIdRef.current = null;
        sessionStorage.removeItem(STORAGE_KEY);
        setMessages([]);
        setError(null);
        setCartFeedback(null);

        // Auto-switch to the newest remaining session
        setSessions((prev) => {
          if (prev.length > 0) {
            const nextId = prev[0].id;
            sessionIdRef.current = nextId;
            sessionStorage.setItem(STORAGE_KEY, String(nextId));
            chatService.getSessionMessages(nextId).then((msgs) => {
              setMessages(
                msgs.map((m) => ({
                  role: m.role,
                  content: m.content,
                  products: m.suggested_products || [],
                  intent: m.intent,
                  entities: m.entities || {},
                  reviewData: m.review_summary || m.review_data || null,
                  confidence: m.confidence || null,
                  citations: m.citations || [],
                }))
              );
            }).catch(() => {});
          }
          return prev;
        });
      }
    } catch (e) {
      setError(e.message || "Gagal menghapus sesi chat");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Navbar />
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 py-6 flex flex-col">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">AI Shopping Assistant</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Tanyakan produk, cari rekomendasi, atau belanja dengan bantuan AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMemoryPanel(!showMemoryPanel)}
              className={`text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                showMemoryPanel ? "text-[#1A3C34]" : "text-gray-400 hover:text-[#1A3C34]"
              }`}
              title="Yang saya ingat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 00-4 4v1h8V6a4 4 0 00-4-4z"/>
                <path d="M4 10h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z"/>
              </svg>
              Ingatan
            </button>
            {messages.length > 0 && (
              <button onClick={handleReset}
                className="text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                Mulai ulang
              </button>
            )}
          </div>
        </div>

        {/* ── SESSION PICKER ── */}
        {!sessionsLoading && (
          <SessionList
            sessions={sessions}
            activeId={sessionIdRef.current}
            onSelect={handleSelectSession}
            onNew={handleReset}
            onDelete={handleDeleteSession}
          />
        )}

        {/* ── MEMORY PANEL ── */}
        {showMemoryPanel && (
          <div className="mb-4">
            <MemoryPanel
              memories={[
                { id: "budget-1", label: "Budget laptop", value: "Rp 10-15 juta", category: "budget" },
                { id: "brand-1", label: "Brand favorit", value: "Lenovo, ASUS", category: "brand" },
                { id: "pref-1", label: "Preferensi", value: "Laptop tipis, gaming", category: "preference" },
              ]}
              onEdit={(id, val) => console.log("Edit", id, val)}
              onDelete={(id) => console.log("Delete", id)}
              onClearAll={() => console.log("Clear all")}
              onClose={() => setShowMemoryPanel(false)}
            />
          </div>
        )}

        {/* ── CART FEEDBACK BANNER ── */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          cartFeedback ? "max-h-20 opacity-100 mb-3" : "max-h-0 opacity-0 mb-0"
        }`}>
          {cartFeedback && (
            <div className={`rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-2.5 ${
              cartFeedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              <span className="flex-shrink-0">
                {cartFeedback.type === "success" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                )}
              </span>
              <span className="flex-1">{cartFeedback.message}</span>
              <button onClick={() => setCartFeedback(null)} className="flex-shrink-0 text-current opacity-40 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Tutup">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 bg-white rounded-2xl border border-[#EBEBEB] p-4 mb-4 overflow-y-auto overflow-x-hidden min-h-[400px] max-h-[600px] shadow-sm">

          {/* ── Empty state: personality-driven welcome ── */}
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 px-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1A3C34] to-[#2D6A5E] flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/20">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </div>

              {/* Greeting */}
              <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-1.5">
                Halo! Ada yang bisa dibantu?
              </h2>
              <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed mb-6">
                Saya asisten belanja kamu — bisa cari produk, bandingin spesifikasi, cek promo, dan langsung masukin ke keranjang. Bilang aja kebutuhan kamu!
              </p>

              {/* Capability badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-sm">
                {[
                  { icon: "🔍", label: "Cari produk" },
                  { icon: "📊", label: "Bandingkan" },
                  { icon: "⭐", label: "Rekomendasi" },
                  { icon: "🛒", label: "Tambah belanja" },
                  { icon: "💳", label: "Cek promo" },
                ].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-[#F5F5F5] rounded-full px-3 py-1.5 text-[11px] font-medium text-[#555]">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>

              {/* Quick prompts */}
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Coba salah satu:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {QUICK_PROMPTS.map((q, i) => (
                  <button key={i} onClick={() => handleQuickSend(q)}
                    disabled={loading}
                    className="bg-white border border-[#E5E7EB] rounded-full px-4 py-2 text-[12px] font-medium text-[#1A1A1A] hover:border-[#1A3C34] hover:text-[#1A3C34] hover:bg-[#F0FBF8] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Tip */}
              <div className="mt-6 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  💡 <strong>Tips:</strong> Coba bilang natural — misalnya "cari laptop gaming tipis budget 15jt" atau "sepatu lari yang mirip Nike"
                </p>
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              products={msg.products}
              intent={msg.intent}
              entities={msg.entities}
              followUpSuggestions={msg.followUpSuggestions}
              onFollowUp={handleFollowUp}
              onAddToCart={handleRequestAddToCart}
              onCheckout={handleCheckout}
              onTrackOrder={handleTrackOrder}
              onClearCart={handleClearCart}
              addingToCart={addingToCart}
              sessionId={sessionIdRef.current}
              reviewData={msg.reviewData}
              confidence={msg.confidence}
              citations={msg.citations}
            />
          ))}

          {/* ── Confirmation card (above next input) ── */}
          {pendingProduct && (
            <div className="flex justify-center mb-4">
              <div className="w-full max-w-sm">
                <ConfirmationCard
                  product={pendingProduct}
                  qty={confirmQty}
                  onConfirm={handleConfirmAddToCart}
                  onCancel={() => setPendingProduct(null)}
                  onEditQty={setConfirmQty}
                  loading={addingToCart}
                />
              </div>
            </div>
          )}

          {/* ── Loading dots (smooth typing indicator) ── */}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-[#1A3C34] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot size={16} color="white" strokeWidth={2} />
                </div>
                <div className="bg-white border border-[#EBEBEB] rounded-2xl rounded-bl-md px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1A3C34]/60" style={{
                      animation: "typingDot 1.2s ease-in-out infinite",
                      animationDelay: "0ms",
                    }} />
                    <div className="w-2 h-2 rounded-full bg-[#1A3C34]/60" style={{
                      animation: "typingDot 1.2s ease-in-out infinite",
                      animationDelay: "200ms",
                    }} />
                    <div className="w-2 h-2 rounded-full bg-[#1A3C34]/60" style={{
                      animation: "typingDot 1.2s ease-in-out infinite",
                      animationDelay: "400ms",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle size={14} color="#DC2626" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-red-800">Gagal terhubung ke AI</p>
                <p className="text-[12px] text-red-600 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

      {/* ── INPUT AREA ── */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-3 shadow-sm">
          <div className="flex gap-3">
            <input ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan... cari laptop, bandingkan produk, atau tanya promo"
              disabled={loading}
              className="flex-1 bg-[#F5F5F5] border border-transparent focus:bg-white focus:border-[#1A3C34]/30 focus:ring-2 focus:ring-[#1A3C34]/10 rounded-xl px-4 py-3 text-[14px] outline-none transition-all disabled:opacity-50 placeholder:text-gray-400"
            />
            <button onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-[48px] h-[48px] rounded-xl bg-[#1A3C34] flex items-center justify-center disabled:opacity-40 hover:bg-[#2D6A5E] active:scale-95 transition-all cursor-pointer flex-shrink-0 shadow-sm">
              <Send size={18} color="white" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── QUICK PROMPTS (always visible when chat is active) ── */}
        {messages.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} onClick={() => handleQuickSend(q)}
                disabled={loading}
                className="bg-white border border-[#EBEBEB] rounded-full px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:border-[#1A3C34] hover:text-[#1A3C34] hover:bg-[#F0FBF8] transition-all whitespace-nowrap cursor-pointer disabled:opacity-40 shadow-sm">
                {q}
              </button>
            ))}
          </div>
        )}
      </main>
      {confirmAction && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          title="Konfirmasi Tindakan"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 rounded-xl border border-[#EBEBEB] text-[13px] font-semibold text-[#666] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={
                  confirmAction.action === "clear_cart" ? executeClearCart : undefined
                }
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                {confirmAction.action === "clear_cart" ? "Ya, Kosongkan" : "Konfirmasi"}
              </button>
            </div>
          }
        >
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} color="#DC2626" />
            </div>
            <p className="text-[15px] font-semibold text-[#1A1A1A] mb-2">
              {confirmAction.action === "clear_cart"
                ? "Kosongkan Keranjang?"
                : "Konfirmasi tindakan ini"}
            </p>
            <p className="text-[13px] text-gray-500">
              {confirmAction.action === "clear_cart"
                ? "Semua item di keranjang belanja akan dihapus. Tindakan ini tidak dapat dibatalkan."
                : "Apakah Anda yakin ingin melanjutkan?"}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
