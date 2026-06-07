"use client";

import React from "react";

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

/**
 * Add-to-cart confirmation card with product image, price, quantity,
 * and undo/change buttons. Shown BEFORE item is added to cart.
 *
 * Props:
 * - product: { id, name, product_name, price, product_price, image_url }
 * - qty?: number (default 1)
 * - onConfirm: () => void
 * - onCancel: () => void
 * - onEditQty?: (qty: number) => void
 * - loading?: boolean
 */
export default function ConfirmationCard({
  product,
  qty = 1,
  onConfirm,
  onCancel,
  onEditQty,
  loading = false,
}) {
  if (!product) return null;

  const name = product.name ?? product.product_name;
  const price = product.price ?? product.product_price;
  const total = Number(price) * qty;

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden shadow-sm my-2">
      {/* ── Product info ── */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg bg-[#F0FBF8] flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <span className="text-xl">📦</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug line-clamp-2">{name}</p>
          <p className="text-[13px] font-bold text-[#1A3C34] mt-0.5">{fmt(price)}</p>
        </div>
      </div>

      {/* ── Quantity controls ── */}
      {onEditQty && (
        <div className="px-3 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-gray-500">Jumlah:</span>
            <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
              <button
                onClick={() => onEditQty(Math.max(1, qty - 1))}
                disabled={qty <= 1 || loading}
                className="w-7 h-7 text-sm text-[#555] hover:bg-[#F5F5F5] transition-colors cursor-pointer disabled:opacity-30"
              >
                −
              </button>
              <span className="w-8 text-center text-[12px] font-semibold text-[#1A1A1A]">{qty}</span>
              <button
                onClick={() => onEditQty(qty + 1)}
                disabled={loading}
                className="w-7 h-7 text-sm text-[#555] hover:bg-[#F5F5F5] transition-colors cursor-pointer disabled:opacity-30"
              >
                +
              </button>
            </div>
            <span className="text-[10px] text-gray-400 ml-auto">Subtotal: {fmt(total)}</span>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-[#F0F0F0]" />

      {/* ── Action buttons ── */}
      <div className="flex gap-2 p-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-[#F5F5F5] text-[#555] text-[11px] font-semibold py-2 rounded-lg hover:bg-[#EBEBEB] transition-colors cursor-pointer disabled:opacity-50"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-[#1A3C34] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Memproses...
            </>
          ) : (
            <>🛒 Tambah ke Keranjang</>
          )}
        </button>
      </div>
    </div>
  );
}
