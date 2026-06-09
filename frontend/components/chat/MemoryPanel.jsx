"use client";

import React, { useState } from "react";

/**
 * Memory controls panel — shows what the assistant remembers
 * and allows edit/delete per item, or clear all.
 *
 * Props:
 * - memories: Array<{ id: string, label: string, value: string, category: string }>
 * - onEdit: (id: string, newValue: string) => void
 * - onDelete: (id: string) => void
 * - onClearAll: () => void
 * - onClose: () => void
 */

const CATEGORY_LABELS = {
  preference: "Preferensi",
  size: "Ukuran & Size",
  budget: "Budget",
  brand: "Brand Favorit",
  history: "Riwayat",
};

const CATEGORY_COLORS = {
  preference: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  size: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  budget: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  brand: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  history: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
};

export default function MemoryPanel({ memories = [], onEdit, onDelete, onClearAll, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  if (!memories || memories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FBF8] flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 00-4 4v1h8V6a4 4 0 00-4-4z"/>
              <path d="M4 10h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z"/>
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">Belum ada memori</p>
          <p className="text-[11px] text-gray-400">
            Saya belum tahu preferensi kamu. Coba tanya produk dulu!
          </p>
        </div>
      </div>
    );
  }

  const grouped = memories.reduce((acc, m) => {
    const cat = m.category || "preference";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A3C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 00-4 4v1h8V6a4 4 0 00-4-4z"/>
            <path d="M4 10h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z"/>
          </svg>
          <span className="text-[13px] font-bold text-[#1A1A1A]">Yang saya ingat</span>
        </div>
        <div className="flex items-center gap-1">
          {memories.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-[10px] font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              Hapus semua
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Confirm clear */}
      {confirmClear && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
          <p className="text-[11px] font-medium text-red-700">Hapus semua memori?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmClear(false)}
              className="text-[10px] font-semibold text-red-500 hover:text-red-700 px-2 py-1 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => { onClearAll?.(); setConfirmClear(false); }}
              className="text-[10px] font-semibold bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Memory groups */}
      <div className="max-h-[300px] overflow-y-auto">
        {Object.entries(grouped).map(([cat, items]) => {
          const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.preference;
          return (
            <div key={cat} className="px-4 py-2.5 border-b border-[#F5F5F5] last:border-b-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                  {CATEGORY_LABELS[cat] || cat}
                </span>
              </div>
              {items.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1 group">
                  {editingId === m.id ? (
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 bg-[#F5F5F5] border border-[#E5E7EB] rounded-lg px-2 py-1 text-[11px] outline-none focus:border-[#1A3C34]/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onEdit?.(m.id, editValue);
                            setEditingId(null);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => { onEdit?.(m.id, editValue); setEditingId(null); }}
                        className="text-[10px] font-semibold text-[#1A3C34] hover:text-[#2D6A5E] cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-[#1A1A1A]">{m.label}</p>
                        <p className="text-[10px] text-gray-500 truncate">{m.value}</p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(m.id); setEditValue(m.value); }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-gray-400 hover:text-[#1A3C34] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete?.(m.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-[#F9FAFB] border-t border-[#F0F0F0] px-4 py-2">
        <p className="text-[9px] text-gray-400 text-center">
          Memori disimpan di akun kamu • kamu bisa edit atau hapus kapan saja
        </p>
      </div>
    </div>
  );
}
