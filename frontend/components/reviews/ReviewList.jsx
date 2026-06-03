"use client";

import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";

export const REVIEW_DUMMY = [
  {
    id: "rev_001",
    productName: "Sneaker Harian",
    reviewerName: "Alya Putri",
    rating: 5,
    date: "2026-05-28",
    comment: "Barang sesuai deskripsi, ringan dipakai, dan packing aman.",
    variant: "Hitam, 42",
    helpfulCount: 18,
  },
  {
    id: "rev_002",
    productName: "Sneaker Harian",
    reviewerName: "Rizky Pratama",
    rating: 4,
    date: "2026-05-24",
    comment: "Kualitas bagus untuk harga segini. Pengiriman sedikit lebih lama dari estimasi.",
    variant: "Putih, 40",
    helpfulCount: 9,
  },
  {
    id: "rev_003",
    productName: "Sneaker Harian",
    reviewerName: "Maya Sari",
    rating: 5,
    date: "2026-05-20",
    comment: "Nyaman untuk jalan jauh dan ukurannya pas. Akan beli lagi untuk warna lain.",
    variant: "Cream, 39",
    helpfulCount: 12,
  },
];

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Stars({ rating, size = "text-sm" }) {
  return (
    <span className={`inline-flex ${size}`} aria-label={`${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? "text-[#F59E0B]" : "text-[#D1D5DB]"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewList({ reviews = REVIEW_DUMMY, title = "Ulasan Produk" }) {
  const [filter, setFilter] = useState("all");

  const summary = useMemo(() => {
    const total = reviews.length;
    const average = total
      ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
      : 0;

    return {
      total,
      average,
      counts: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        total: reviews.filter((item) => Number(item.rating) === rating).length,
      })),
    };
  }, [reviews]);

  const filteredReviews =
    filter === "all" ? reviews : reviews.filter((item) => Number(item.rating) === Number(filter));

  return (
    <section className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">{title}</h2>
          <p className="text-sm text-[#777] mt-1">Ringkasan pengalaman pembeli setelah transaksi selesai.</p>
        </div>

        <div className="rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] px-4 py-3 min-w-40">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[#1A3C34]">{summary.average.toFixed(1)}</span>
            <span className="text-sm text-gray-500 mb-1">/ 5</span>
          </div>
          <Stars rating={Math.round(summary.average)} />
          <p className="text-xs text-gray-500 mt-1">{summary.total} ulasan</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`h-9 rounded-full px-4 text-sm font-semibold border ${
            filter === "all"
              ? "bg-[#1A3C34] text-white border-[#1A3C34]"
              : "bg-white text-[#374151] border-[#E5E7EB]"
          }`}
        >
          Semua
        </button>
        {summary.counts.map((item) => (
          <button
            key={item.rating}
            type="button"
            onClick={() => setFilter(String(item.rating))}
            className={`h-9 rounded-full px-4 text-sm font-semibold border ${
              filter === String(item.rating)
                ? "bg-[#1A3C34] text-white border-[#1A3C34]"
                : "bg-white text-[#374151] border-[#E5E7EB]"
            }`}
          >
            {item.rating} ★ ({item.total})
          </button>
        ))}
      </div>

      <div className="mt-6 divide-y divide-[#F1F5F9]">
        {filteredReviews.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">Belum ada ulasan untuk filter ini.</div>
        ) : (
          filteredReviews.map((review) => (
            <article key={review.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[#111827]">{review.reviewerName}</p>
                    <Badge variant={review.rating >= 4 ? "success" : "warning"}>{review.rating}.0</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <Stars rating={review.rating} />
                    <span>{formatDate(review.date)}</span>
                    <span>{review.variant}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{review.helpfulCount} merasa terbantu</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#374151]">{review.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

