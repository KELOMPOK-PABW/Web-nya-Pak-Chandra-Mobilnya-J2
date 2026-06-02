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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A5D6D0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div className="p-3">
          <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug mb-1 line-clamp-2">{name}</p>
          {sellerName && <p className="text-[10px] text-gray-400 mb-1">{sellerName}</p>}
          <p className="text-[13px] font-bold text-[#1A3C34]">{fmt(price)}</p>
        </div>
      </Link>
      {onAddToCart && (
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(pid); }}
          disabled={addingToCart}
          className="w-full bg-[#1A3C34] text-white text-[11px] font-semibold py-2 hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50"
        >
          {addingToCart ? "Menambahkan..." : "🛒 Tambah ke Keranjang"}
        </button>
      )}
    </div>
  );
}

function ChatBubble({ role, content, products, intent, entities, followUpSuggestions, onFollowUp, onAddToCart, onCheckout, onTrackOrder, onClearCart, addingToCart, sessionId }) {
  const isUser = role === "user";
  const showCartButton = intent === "add_to_cart" && products && products.length > 0;
  const showCheckoutButton = intent === "checkout_order" || (intent === "search_product" && products && products.length > 0);
  const showTrackButton = intent === "track_order" && entities?.order_id;
  const showClearCartButton = intent === "clear_cart";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className="flex gap-2 max-w-[85%]">
        {!isUser && (
          <div className="w-8 h-8 rounded-xl bg-[#1A3C34] flex items-center justify-center flex-shrink-0 mt-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4m0 0L8 8m4-4l4 4M12 20v-4"/>
              <path d="M12 20a8 8 0 100-16 8 8 0 000 16z"/>
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <div className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? "bg-[#1A3C34] text-white rounded-br-md"
              : "bg-white border border-[#EBEBEB] text-[#1A1A1A] rounded-bl-md shadow-sm"
          }`}>
            {content}
          </div>

          {/* Intent action buttons */}
          {!isUser && showCartButton && (
            <div className="mt-2">
              <button
                onClick={() => onAddToCart && onAddToCart(products[0].product_id ?? products[0].id)}
                disabled={addingToCart}
                className="w-full bg-[#1A3C34] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                <span>{addingToCart ? "Menambahkan..." : `Tambahkan "${products[0].name ?? products[0].product_name}" ke Keranjang`}</span>
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

          {/* Product cards */}
          {products && products.length > 0 && (
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

          {/* Follow-up suggestion chips (recommendation bubbles) */}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {active ? active.title : "Riwayat Chat"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${collapsed ? "" : "rotate-180"}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
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

  const handleAddToCart = useCallback(async (productId) => {
    if (addingToCart) return;
    setAddingToCart(true);
    setCartFeedback(null);
    try {
      await cartService.addItem({ product_id: productId, qty: 1 });
      await refreshCartCount();
      setCartFeedback({ type: "success", message: "✅ Produk berhasil ditambahkan ke keranjang!" });
    } catch (err) {
      setCartFeedback({ type: "error", message: `❌ Gagal menambahkan: ${err.message}` });
    } finally {
      setAddingToCart(false);
    }
  }, [addingToCart, refreshCartCount]);

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
      setCartFeedback({ type: "success", message: "✅ Keranjang berhasil dikosongkan!" });
    } catch (err) {
      setCartFeedback({ type: "error", message: `❌ Gagal mengosongkan keranjang: ${err.message}` });
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
      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 py-6 flex flex-col">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">AI Shopping Assistant</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Tanyakan produk, cari rekomendasi, atau belanja dengan bantuan AI
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={handleReset}
              className="text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
              Mulai ulang
            </button>
          )}
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

        {/* ── CART FEEDBACK BANNER ── */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          cartFeedback ? "max-h-20 opacity-100 mb-3" : "max-h-0 opacity-0 mb-0"
        }`}>
          {cartFeedback && (
            <div className={`rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 ${
              cartFeedback.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {cartFeedback.message}
              <button onClick={() => setCartFeedback(null)} className="ml-auto text-current opacity-50 hover:opacity-100 cursor-pointer">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 bg-white rounded-2xl border border-[#EBEBEB] p-4 mb-4 overflow-y-auto overflow-x-hidden min-h-[400px] max-h-[600px] shadow-sm">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#F0FBF8] flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A3C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h10a2 2 0 012 2v8"/>
                  <path d="M12 8V4m0 0L8 8m4-4l4 4"/>
                </svg>
              </div>
              <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-2">Mulai Belanja dengan AI</h2>
              <p className="text-[13px] text-gray-400 max-w-sm mb-6">
                Klik salah satu saran di bawah atau ketik pertanyaanmu sendiri untuk memulai percakapan.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {QUICK_PROMPTS.map((q, i) => (
                  <button key={i} onClick={() => handleQuickSend(q)}
                    disabled={loading}
                    className="bg-[#F0FBF8] border border-[#C8EDE8] rounded-full px-4 py-2 text-[12px] font-medium text-[#1A3C34] hover:bg-[#E0F2F1] transition-colors cursor-pointer disabled:opacity-50">
                    {q}
                  </button>
                ))}
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
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
              onTrackOrder={handleTrackOrder}
              onClearCart={handleClearCart}
              addingToCart={addingToCart}
              sessionId={sessionIdRef.current}
            />
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-[#1A3C34] flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4m0 0L8 8m4-4l4 4M12 20v-4"/>
                    <path d="M12 20a8 8 0 100-16 8 8 0 000 16z"/>
                  </svg>
                </div>
                <div className="bg-white border border-[#EBEBEB] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p className="text-[13px] font-semibold text-red-700">Gagal terhubung ke AI</p>
                <p className="text-[12px] text-red-500 mt-0.5">{error}</p>
              </div>
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
              placeholder="Ketik pesan... (contoh: cari baju putih)"
              disabled={loading}
              className="flex-1 bg-[#F5F5F5] border border-transparent focus:bg-white focus:border-[#1A3C34]/30 focus:ring-2 focus:ring-[#1A3C34]/10 rounded-xl px-4 py-3 text-[14px] outline-none transition-all disabled:opacity-50"
            />
            <button onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-[48px] h-[48px] rounded-xl bg-[#1A3C34] flex items-center justify-center disabled:opacity-40 hover:bg-[#2D6A5E] transition-colors cursor-pointer flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── QUICK PROMPTS (always visible when chat is active) ── */}
        {messages.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} onClick={() => handleQuickSend(q)}
                disabled={loading}
                className="bg-white border border-[#EBEBEB] rounded-full px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:border-[#1A3C34] hover:text-[#1A3C34] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-40">
                {q}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── CONFIRMATION MODAL ── */}
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
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
