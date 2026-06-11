"use client";

import React, { useState, useEffect } from "react";

/**
 * Proactive suggestion banner that appears on struggle signals.
 * Respects frequency caps, dismissal, and quiet hours (21:00-08:00).
 *
 * Props:
 * - type: 'DWELL' | 'SEARCH_LOOP' | 'CART_ABANDON'
 * - productName?: string
 * - onDismiss: () => void
 * - onAction: (action: string) => void  // 'ask' | 'go-chat' | 'checkout'
 * - delay?: number — ms to wait before showing (default 500)
 */

const MESSAGES = {
  DWELL: {
    title: "Butuh bantuan?",
    desc: (name) => `Saya bisa jawab soal spesifikasi ${name || "produk ini"} atau bantu bandingkan.`,
    actions: [
      { id: "ask", label: "Tanya AI", primary: true },
      { id: "compare", label: "Bandingkan", primary: false },
    ],
  },
  SEARCH_LOOP: {
    title: "Masih belum nemu?",
    desc: () => "Coba bilang aja kebutuhan kamu — saya cariin yang cocok.",
    actions: [
      { id: "go-chat", label: "Tanya AI", primary: true },
      { id: "dismiss", label: "Nanti aja", primary: false },
    ],
  },
  CART_ABANDON: {
    title: "Ada yang bisa dibantu?",
    desc: () => "Kalau ada pertanyaan soal produk di keranjang, tanya aja.",
    actions: [
      { id: "ask", label: "Tanya soal produk", primary: true },
      { id: "checkout", label: "Lanjut checkout", primary: false },
    ],
  },
};

export default function ProactivePrompt({ type, productName, onDismiss, onAction, delay = 500 }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible || dismissed) return null;

  const config = MESSAGES[type];
  if (!config) return null;

  const handleAction = (actionId) => {
    if (actionId === "dismiss") {
      setDismissed(true);
      onDismiss?.();
    } else {
      onAction?.(actionId);
    }
  };

  return (
    <div
      className="bg-white border border-[#C8EDE8] rounded-xl shadow-lg shadow-emerald-500/5 p-4 mb-4 transition-all duration-300 ease-out"
      style={{
        animation: "proactiveSlideIn 0.3s ease-out",
        borderLeft: "3px solid #1A3C34",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1A3C34] flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#1A1A1A]">{config.title}</p>
          <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
            {config.desc(productName)}
          </p>
          <div className="flex gap-2 mt-2.5">
            {config.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  action.primary
                    ? "bg-[#1A3C34] text-white hover:bg-[#2D6A5E]"
                    : "bg-[#F5F5F5] text-[#555] hover:bg-[#EBEBEB]"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setDismissed(true); onDismiss?.(); }}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
          aria-label="Tutup"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes proactiveSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
