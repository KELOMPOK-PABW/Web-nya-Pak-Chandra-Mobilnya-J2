"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const ToastContext = createContext({
  showToast: () => {},
  toasts: [],
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

const BG_COLORS = {
  success: "bg-white border border-[#D1FAE5] shadow-lg shadow-emerald-500/10",
  error: "bg-white border border-[#FECACA] shadow-lg shadow-red-500/10",
  info: "bg-white border border-[#DBEAFE] shadow-lg shadow-blue-500/10",
};

const TEXT_COLORS = {
  success: "text-emerald-800",
  error: "text-red-800",
  info: "text-blue-800",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const showToast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = ++idCounter.current;

    // Prevent duplicates — if the same message is already showing, skip
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev;
      return [...prev, { id, type, message, duration }];
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: "380px" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl ${BG_COLORS[toast.type]} animate-in slide-in-from-right-8 fade-in duration-200`}
            style={{
              animation: "toastSlideIn 0.3s ease-out, toastFadeOut 0.3s ease-in forwards",
              animationDuration: "0.3s, 0.3s",
              animationDelay: "0s, 3.7s",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <span className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</span>
            <p className={`text-[13px] font-medium leading-snug flex-1 ${TEXT_COLORS[toast.type]}`}>
              {toast.message}
            </p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Toast keyframes — injected once */}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(20px); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
