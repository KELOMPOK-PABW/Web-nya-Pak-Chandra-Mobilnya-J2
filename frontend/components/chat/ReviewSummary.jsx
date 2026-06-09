"use client";

import React, { useState } from "react";

/**
 * Review summary component — shows sentiment breakdown, key pros/cons,
 * and expandable source citations linking to individual reviews.
 *
 * Props:
 * - summary: { sentiment: {positif, netral, negatif}, pros: string[], cons: string[], highlights: string[] }
 * - reviews: Array<{id, user_name, rating, content, date}>
 * - productName: string
 */
export default function ReviewSummary({ summary, reviews = [], productName = "" }) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!summary && reviews.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[12px] text-gray-500">
        Belum ada ulasan untuk produk ini.
      </div>
    );
  }

  const sentiment = summary?.sentiment || {};
  const total = (sentiment.positif || 0) + (sentiment.netral || 0) + (sentiment.negatif || 0);
  const positifPct = total > 0 ? Math.round((sentiment.positif || 0) / total * 100) : 0;
  const netralPct = total > 0 ? Math.round((sentiment.netral || 0) / total * 100) : 0;
  const negatifPct = total > 0 ? Math.round((sentiment.negatif || 0) / total * 100) : 0;

  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden my-2">
      {/* ── Sentiment bar ── */}
      {total > 0 && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#1A1A1A]">Ringkasan Ulasan</span>
            <span className="text-[10px] text-gray-400">({total} ulasan)</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            {sentiment.positif > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${positifPct}%` }}
                title={`Positif ${positifPct}%`}
              />
            )}
            {sentiment.netral > 0 && (
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${netralPct}%` }}
                title={`Netral ${netralPct}%`}
              />
            )}
            {sentiment.negatif > 0 && (
              <div
                className="bg-red-400 transition-all"
                style={{ width: `${negatifPct}%` }}
                title={`Negatif ${negatifPct}%`}
              />
            )}
          </div>
          <div className="flex gap-3 mt-1.5 text-[10px]">
            <span className="text-green-600 font-medium">👍 {positifPct}%</span>
            <span className="text-amber-600 font-medium">➖ {netralPct}%</span>
            <span className="text-red-500 font-medium">👎 {negatifPct}%</span>
          </div>
        </div>
      )}

      {/* ── Pros / Cons ── */}
      {(summary?.pros?.length > 0 || summary?.cons?.length > 0) && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-3">
          {summary.pros?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-green-700 mb-1">✅ Yang disukai</p>
              <ul className="space-y-0.5">
                {summary.pros.map((pro, i) => (
                  <li key={i} className="text-[10px] text-gray-600 leading-relaxed">• {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {summary.cons?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-red-600 mb-1">⚠️ Yang dikeluhkan</p>
              <ul className="space-y-0.5">
                {summary.cons.map((con, i) => (
                  <li key={i} className="text-[10px] text-gray-600 leading-relaxed">• {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Highlights ── */}
      {summary?.highlights?.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-[10px] font-bold text-[#1A3C34] mb-1">💬 Sorotan</p>
          <div className="space-y-1">
            {summary.highlights.map((h, i) => (
              <p key={i} className="text-[10px] text-gray-600 italic leading-relaxed">"{h}"</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Individual reviews (sourced citations) ── */}
      {displayReviews.length > 0 && (
        <div className="border-t border-[#F0F0F0] px-4 py-2">
          <p className="text-[10px] font-bold text-[#1A1A1A] mb-1.5">
            📝 Ulasan pembeli {productName ? `— ${productName}` : ""}
          </p>
          <div className="space-y-2">
            {displayReviews.map((review, i) => (
              <div key={review.id ?? i} className="bg-[#FAFAFA] rounded-lg px-3 py-2 border border-[#F0F0F0]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#1A1A1A]">{review.user_name || "Pembeli"}</span>
                    <span className="text-[9px] text-amber-500">
                      {"★".repeat(Math.round(review.rating || 0))}{"☆".repeat(5 - Math.round(review.rating || 0))}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {review.date ? new Date(review.date).toLocaleDateString("id-ID") : ""}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-3">{review.content}</p>
                {/* Citation link */}
                {review.id && (
                  <a
                    href={`/reviews/${review.id}`}
                    className="text-[9px] font-medium text-[#1A3C34] hover:underline mt-1 inline-block"
                    target="_blank"
                    rel="noopener"
                  >
                    Sumber →
                  </a>
                )}
              </div>
            ))}
          </div>
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full text-[10px] font-semibold text-[#1A3C34] py-1.5 hover:text-[#2D6A5E] transition-colors cursor-pointer"
            >
              {showAllReviews ? "▲ Sembunyikan" : `▼ Lihat semua ${reviews.length} ulasan`}
            </button>
          )}
        </div>
      )}

      {/* ── Source attribution footer ── */}
      <div className="bg-[#F9FAFB] border-t border-[#F0F0F0] px-4 py-1.5">
        <p className="text-[9px] text-gray-400 text-center">
          Ringkasan berdasarkan ulasan pembeli • Klik "Sumber" untuk lihat ulasan asli
        </p>
      </div>
    </div>
  );
}
