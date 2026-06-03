"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatService";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { useCartContext } from "@/components/CartContext";

const STORAGE_KEY = "chat_session_id";
const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

/**
 * Slide-in chat sidebar rendered as a block element in the document flow.
 * Sits to the right of the product content — pushes it aside instead of overlaying.
 * Sessions are linked with /chat page via sessionStorage.
 */
export default function ChatPopup({ product, onClose, initialSessionId }) {
  const router = useRouter();
  const { refreshCartCount } = useCartContext();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const hasExistingSessionRef = useRef(!!(initialSessionId || sessionStorage.getItem(STORAGE_KEY)));

  // Slide-in animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // On mount: pick up initialSessionId OR stored session from /chat page, fetch sessions
  useEffect(() => {
    const storedId = sessionStorage.getItem(STORAGE_KEY);
    const sid = initialSessionId || (storedId ? Number(storedId) : null);
    if (sid) {
      setSessionId(sid);
      chatService
        .getSessionMessages(sid)
        .then((msgs) => {
          setMessages(
            msgs.map((m) => ({
              role: m.role,
              content: m.content,
              products: m.suggested_products || [],
              intent: m.intent,
              entities: m.entities || {},
            }))
          );
        })
        .catch(() => {});
    }

    // Fetch recent sessions list (linked with /chat page)
    chatService
      .getSessions()
      .then((sess) => setSessions(sess))
      .catch(() => {});
  }, [initialSessionId]);

  // Sync sessionId to sessionStorage so /chat page can pick it up
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem(STORAGE_KEY, String(sessionId));
    }
  }, [sessionId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Focus input after response
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // Auto-send initial message to seed product context (only for fresh conversations)
  useEffect(() => {
    if (initialized || !product) return;
    setInitialized(true);

    // Don't re-seed if resuming an existing session from /chat page
    if (hasExistingSessionRef.current) return;

    const seedMsg = `Halo! Saya sedang melihat produk "${product.name}" (${fmt(product.price)}). Bisakah kamu kasih info lebih detail tentang produk ini?`;
    sendMessage(seedMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, initialized]);

  // Refresh sessions list in background
  const refreshSessions = useCallback(() => {
    chatService
      .getSessions()
      .then((sess) => setSessions(sess))
      .catch(() => {});
  }, []);

  const handleAddToCart = useCallback(async (productId) => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      await cartService.addItem({ product_id: productId, qty: 1 });
      await refreshCartCount();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "✅ Produk berhasil ditambahkan ke keranjang!", isNotification: true },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Gagal menambahkan: ${err.message}`, isNotification: true },
      ]);
    } finally {
      setAddingToCart(false);
    }
  }, [addingToCart, refreshCartCount]);

  const sendMessage = useCallback(async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;

    setInput("");

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);

    try {
      const result = await chatService.sendMessage({
        message: text,
        session_id: sessionId,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (result.session_id) {
        setSessionId(result.session_id);
        // Refresh sessions list so /chat page sees the new session
        refreshSessions();
      }

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Gagal terhubung ke AI: ${err.message}`, isNotification: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, sessionId, refreshSessions]);

  const handleSelectSession = useCallback(async (id) => {
    if (id === sessionId) return;
    setSessionsOpen(false);
    setLoading(true);
    try {
      const msgs = await chatService.getSessionMessages(id);
      setSessionId(id);
      sessionStorage.setItem(STORAGE_KEY, String(id));
      setMessages(
        msgs.map((m) => ({
          role: m.role,
          content: m.content,
          products: m.suggested_products || [],
          intent: m.intent,
          entities: m.entities || {},
        }))
      );
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Gagal memuat sesi: ${e.message}`, isNotification: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    sessionStorage.removeItem(STORAGE_KEY);
    setSessionsOpen(false);
    setInitialized(false);
    setInput("");
  }, []);

  const handleDeleteSession = useCallback(async (sid) => {
    if (deletingId) return;
    setDeletingId(sid);
    try {
      await chatService.deleteSession(sid);
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sid);
        if (sid === sessionId) {
          // If deleted the active session, switch to newest or reset
          if (remaining.length > 0) {
            handleSelectSession(remaining[0].id);
          } else {
            handleNewChat();
          }
        }
        return remaining;
      });
    } catch (e) {
      // Silently fail
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, sessionId, handleSelectSession, handleNewChat]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250); // wait for slide-out animation
  };

  return (
    <div
      className={`flex flex-col border-l border-[#E8E8E8] bg-white transition-all duration-250 ease-out overflow-hidden ${
        visible
          ? "w-[420px] max-w-[95vw] opacity-100"
          : "w-0 max-w-0 opacity-0"
      }`}
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      {/* ── Header with session picker ── */}
      <div className="border-b border-[#F0F0F0] flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1A3C34] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4m0 0L8 8m4-4l4 4M12 20v-4"/>
                <path d="M12 20a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#1A1A1A] truncate">AI Assistant</p>
              <p className="text-[10px] text-gray-400 truncate">{product?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSessionsOpen(!sessionsOpen)}
              className="flex items-center gap-1 bg-[#F5F5F5] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#555] hover:bg-[#EBEBEB] transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Riwayat
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${sessionsOpen ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button
              onClick={handleNewChat}
              className="bg-[#1A3C34] text-white rounded-lg px-2 py-1.5 text-[11px] font-semibold hover:bg-[#2D6A5E] transition-colors cursor-pointer"
            >
              + Baru
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-colors text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Collapsible recent sessions list ── */}
        {sessionsOpen && (
          <div className="border-t border-[#F0F0F0] max-h-[240px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="px-4 py-3 text-[12px] text-gray-400 text-center">Belum ada percakapan</div>
            ) : (
              sessions.slice(0, 5).map((s) => (
                <div key={s.id}
                  className={`flex items-center border-b border-[#F5F5F5] last:border-b-0 ${
                    s.id === sessionId ? "bg-[#F0FBF8]" : ""
                  }`}>
                  <button
                    onClick={() => handleSelectSession(s.id)}
                    className="flex-1 text-left px-4 py-2.5 hover:bg-[#F0FBF8] transition-colors cursor-pointer min-w-0"
                  >
                    <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">{s.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.message_count} pesan</p>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                    disabled={deletingId === s.id}
                    className="px-3 py-2.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-30"
                    title="Hapus sesi"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Message list ── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth"
      >
        {messages.length === 0 && loading && (
          <div className="flex justify-start">
            <div className="bg-[#F0FBF8] border border-[#C8EDE8] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-[#F0FBF8] flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h10a2 2 0 012 2v8"/>
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">Tanya tentang produk ini</p>
            <p className="text-[11px] text-gray-400 max-w-[220px]">
              Ketik pertanyaan atau klik saran di bawah untuk memulai
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            onAddToCart={handleAddToCart}
            addingToCart={addingToCart}
          />
        ))}

        {loading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-[#F0FBF8] border border-[#C8EDE8] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C34] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Follow-up chips ── */}
      {messages.length > 0 && !loading && (
        <div className="px-4 py-1.5 overflow-x-auto border-t border-[#F0F0F0]">
          <div className="flex gap-1.5">
            {[
              "Info lengkap produk",
              "Produk serupa",
              "Bandingkan",
              "Review produk",
            ].map((chip, i) => (
              <button
                key={i}
                onClick={() => sendMessage(chip)}
                className="whitespace-nowrap bg-[#F0FBF8] border border-[#C8EDE8] rounded-full px-2.5 py-1 text-[11px] font-medium text-[#1A3C34] hover:bg-[#D8F5F0] transition-colors cursor-pointer flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-[#F0F0F0] bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya tentang produk ini..."
            disabled={loading}
            className="flex-1 bg-[#F5F5F5] rounded-xl px-3 py-2.5 text-[13px] outline-none border border-transparent focus:border-[#1A3C34]/30 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-[38px] h-[38px] rounded-xl bg-[#1A3C34] flex items-center justify-center disabled:opacity-40 hover:bg-[#2D6A5E] transition-colors cursor-pointer flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={() => {
              if (sessionId) sessionStorage.setItem(STORAGE_KEY, String(sessionId));
              router.push("/chat");
            }}
            className="text-[11px] text-gray-400 hover:text-[#1A3C34] transition-colors cursor-pointer"
          >
            Buka di halaman Chat penuh →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini Chat Bubble ─── */
const PRODUCT_INTENTS = ["search_product", "add_to_cart"];

function ChatBubble({ msg, onAddToCart, addingToCart }) {
  const isUser = msg.role === "user";
  const isNotification = msg.isNotification;
  const isProductRelated = PRODUCT_INTENTS.includes(msg.intent);
  const showCartButton = msg.intent === "add_to_cart" && msg.products && msg.products.length > 0;

  if (isNotification) {
    return (
      <div className="flex justify-center">
        <div className={`rounded-xl px-3 py-2 text-[12px] font-medium ${
          msg.content.startsWith("✅")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[90%]">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? "bg-[#1A3C34] text-white rounded-br-md"
              : "bg-white border border-[#EBEBEB] text-[#1A1A1A] rounded-bl-md shadow-sm"
          }`}
        >
          {msg.content}
        </div>

        {!isUser && showCartButton && (
          <div className="mt-1.5">
            <button
              onClick={() => onAddToCart && onAddToCart(msg.products[0].product_id ?? msg.products[0].id)}
              disabled={addingToCart}
              className="w-full bg-[#1A3C34] text-white text-[11px] font-semibold py-2 px-3 rounded-lg hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>🛒</span>
              <span>{addingToCart ? "Menambahkan..." : `Tambah "${msg.products[0].name ?? msg.products[0].product_name}" ke Keranjang`}</span>
            </button>
          </div>
        )}

        {!isUser && isProductRelated && msg.products && msg.products.length > 0 && (
          <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
            {msg.products.map((p, i) => (
              <a
                key={p.product_id ?? p.id ?? i}
                href={`/product/${p.product_id ?? p.id}`}
                className="block bg-white rounded-lg border border-[#EBEBEB] overflow-hidden flex-shrink-0 w-[130px] hover:border-[#1A3C34] transition-colors"
              >
                <div className="h-14 flex items-center justify-center bg-[#F0FBF8] overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = "none"; e.target.parentElement.innerText = "📦"; }} />
                  ) : (
                    <span className="text-xl">📦</span>
                  )}
                </div>
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold text-[#1A1A1A] leading-snug line-clamp-2">
                    {p.name ?? p.product_name}
                  </p>
                  <p className="text-[10px] font-bold text-[#1A3C34] mt-0.5">{fmt(p.price ?? p.product_price)}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {!isUser && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {msg.followUpSuggestions.map((s, i) => (
              <span
                key={i}
                className="bg-[#F0FBF8] border border-[#C8EDE8] rounded-full px-2 py-0.5 text-[10px] font-medium text-[#1A3C34]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
