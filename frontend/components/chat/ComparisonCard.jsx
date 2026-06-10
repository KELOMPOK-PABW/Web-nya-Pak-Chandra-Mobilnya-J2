"use client";

import React, { useState } from "react";
import Link from "next/link";

import { formatPrice as fmt } from "@/utils/format";

/**
 * Side-by-side comparison card for 2-3 products.
 * Renders a structured spec table with product images, names, prices, ratings.
 * Handles missing/partial data gracefully with fallback text.
 */
export default function ComparisonCard({ products, onAddToCart, addingToCart }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!products || products.length < 2) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[12px] text-amber-700">
        Minimal 2 produk untuk perbandingan.
      </div>
    );
  }

  const cols = products.slice(0, 3); // Max 3 products

  // Extract all unique spec keys across products
  const specKeys = new Set();
  cols.forEach((p) => {
    const specs = p.specifications || p.specs || p.attributes || {};
    Object.keys(specs).forEach((k) => specKeys.add(k));
  });
  const specList = Array.from(specKeys);

  // Determine which spec rows to show (prioritize common specs)
  const prioritized = [
    "prosesor", "processor", "cpu",
    "gpu", "grafis", "graphics",
    "ram", "memory",
    "storage", "penyimpanan", "ssd", "hdd",
    "layar", "display", "screen",
    "baterai", "battery",
    "berat", "weight",
    "warna", "color",
    "dimensi", "dimensions",
    "os", "operating system",
    "konektivitas", "connectivity",
  ];

  const sortedSpecs = [...specList].sort((a, b) => {
    const aIdx = prioritized.indexOf(a.toLowerCase().trim());
    const bIdx = prioritized.indexOf(b.toLowerCase().trim());
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const getSpec = (product, key) => {
    const specs = product.specifications || product.specs || product.attributes || {};
    return specs[key] || "—";
  };

  const hasAnySpecs = sortedSpecs.length > 0;
  const showExpandToggle = sortedSpecs.length > 5;

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden shadow-sm my-2">
      {/* ── Header row: product images + names ── */}
      <div className="grid gap-px bg-[#EBEBEB]" style={{ gridTemplateColumns: `100px repeat(${cols.length}, 1fr)` }}>
        <div className="bg-[#F9FAFB] px-3 py-2 flex items-center">
          <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Produk</span>
        </div>
        {cols.map((p, i) => (
          <div key={p.product_id ?? p.id ?? i} className="bg-white p-3 text-center">
            <Link
              href={`/product/${p.product_id ?? p.id}`}
              className="block no-underline"
            >
              <div className="w-full h-20 flex items-center justify-center bg-[#F0FBF8] rounded-lg mb-2 overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name ?? p.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-[#1A1A1A] leading-snug line-clamp-2 mb-1">
                {p.name ?? p.product_name}
              </p>
              <p className="text-[12px] font-bold text-[#1A3C34]">
                {fmt(p.price ?? p.product_price)}
              </p>
              {p.rating && (
                <p className="text-[10px] text-amber-500 mt-0.5">
                  ⭐ {Number(p.rating).toFixed(1)}
                </p>
              )}
            </Link>
            {onAddToCart && (
              <button
                onClick={() => onAddToCart(p.product_id ?? p.id)}
                disabled={addingToCart}
                className="mt-2 w-full bg-[#1A3C34] text-white text-[10px] font-semibold py-1.5 px-2 rounded-lg hover:bg-[#2D6A5E] transition-colors cursor-pointer disabled:opacity-50"
              >
                {addingToCart ? "..." : "🛒 + Keranjang"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Spec rows ── */}
      {hasAnySpecs && (
        <div className="grid gap-px bg-[#EBEBEB]" style={{ gridTemplateColumns: `100px repeat(${cols.length}, 1fr)` }}>
          {sortedSpecs.slice(0, expandedRow ? sortedSpecs.length : 5).map((key) => (
            <React.Fragment key={key}>
              <div className="bg-[#F9FAFB] px-3 py-2 flex items-center">
                <span className="text-[10px] font-medium text-[#666] capitalize">{key}</span>
              </div>
              {cols.map((p, i) => {
                const val = getSpec(p, key);
                return (
                  <div key={i} className="bg-white px-3 py-2 flex items-center">
                    <span className={`text-[11px] ${val === "—" ? "text-gray-300" : "text-[#1A1A1A]"}`}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Toggle more specs ── */}
      {showExpandToggle && (
        <button
          onClick={() => setExpandedRow(expandedRow ? null : true)}
          className="w-full bg-white border-t border-[#EBEBEB] text-[11px] font-semibold text-[#1A3C34] py-2 hover:bg-[#F0FBF8] transition-colors cursor-pointer"
        >
          {expandedRow ? "▲ Sembunyikan spesifikasi" : `▼ Lihat semua spesifikasi (${sortedSpecs.length})`}
        </button>
      )}

      {/* ── Price comparison footer ── */}
      <div className="bg-[#F0FBF8] border-t border-[#C8EDE8] px-4 py-2.5">
        <p className="text-[11px] font-semibold text-[#1A3C34] text-center">
          {(() => {
            const prices = cols.map((p) => Number(p.price ?? p.product_price ?? 0)).filter(Boolean);
            if (prices.length < 2) return "";
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const diff = max - min;
            const minName = cols[prices.indexOf(min)]?.name ?? cols[prices.indexOf(min)]?.product_name ?? "";
            return `💰 Selisih harga: ${fmt(diff)} — termurah: ${minName}`;
          })()}
        </p>
      </div>
    </div>
  );
}
