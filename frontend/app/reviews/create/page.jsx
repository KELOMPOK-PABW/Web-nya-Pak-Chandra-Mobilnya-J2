"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { reviewService } from "@/services/reviewService";

const ORDER_REVIEW = {
  orderItemId: "OI-2408-001",
  orderId: "ORD-2408-118",
  productName: "Sneaker Harian",
  sellerName: "Toko Sporty",
  variant: "Hitam, 42",
  completedAt: "2026-05-29",
  imageLabel: "SH",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function CreateReviewPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [orderItemId, setOrderItemId] = useState(ORDER_REVIEW.orderItemId);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRating = hoverRating || rating;

  const ratingLabel = useMemo(() => {
    const labels = {
      1: "Buruk",
      2: "Kurang",
      3: "Cukup",
      4: "Bagus",
      5: "Sangat Bagus",
    };
    return labels[activeRating] || "Pilih rating";
  }, [activeRating]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!rating || !orderItemId || comment.trim().length < 10) {
      setMessageType("error");
      setMessage("Isi order item ID, pilih rating, dan isi ulasan minimal 10 karakter.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");

    reviewService
      .createReview({
        order_item_id: Number(String(orderItemId).replace(/\D/g, "")) || orderItemId,
        rating,
        comment: comment.trim(),
      })
      .then(() => {
        setMessageType("success");
        setMessage("Ulasan berhasil dikirim.");
      })
      .catch((err) => {
        setMessageType("error");
        setMessage(err.message || "Gagal mengirim ulasan. Coba lagi.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1A3C34]">Review</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mt-1">Tulis Ulasan Produk</h1>
            <p className="text-sm text-gray-500 mt-1">Bagikan pengalaman setelah pesanan selesai diterima.</p>
          </div>
          <Link href="/my/reviews">
            <Button type="button" variant="outline">Lihat Ulasan Saya</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#E0F2F1] text-[#1A3C34] font-bold flex items-center justify-center">
                {ORDER_REVIEW.imageLabel}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[#111827]">{ORDER_REVIEW.productName}</h2>
                <p className="text-sm text-gray-500 mt-1">{ORDER_REVIEW.sellerName}</p>
                <p className="text-sm text-gray-500">{ORDER_REVIEW.variant}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="success">Selesai</Badge>
                  <Badge variant="default">{ORDER_REVIEW.orderId}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Order Item</span>
                <span className="font-semibold text-[#111827]">{ORDER_REVIEW.orderItemId}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Tanggal selesai</span>
                <span className="font-semibold text-[#111827]">{formatDate(ORDER_REVIEW.completedAt)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-[#374151] block mb-2">Order Item ID</label>
                <input
                  value={orderItemId}
                  onChange={(event) => setOrderItemId(event.target.value)}
                  placeholder="Contoh: 1"
                  className="w-full h-11 rounded-2xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#1A3C34]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#374151] block mb-3">Rating Produk</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(value)}
                        className={`text-4xl leading-none transition-colors ${
                          value <= activeRating ? "text-[#F59E0B]" : "text-[#D1D5DB]"
                        }`}
                        aria-label={`${value} bintang`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#1A3C34]">{ratingLabel}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#374151] block mb-2">Ulasan</label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={6}
                  placeholder="Ceritakan kualitas produk, ukuran, pengiriman, atau pengalaman menggunakan produk."
                  className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#1A3C34] resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">{comment.length}/500 karakter</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#374151] block mb-2">Foto Produk</label>
                <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
                  <p className="text-sm font-semibold text-[#374151]">Upload foto ulasan</p>
                  <p className="text-xs text-gray-500 mt-1">UI statis untuk preview, belum mengunggah file.</p>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-[#374151]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                  className="w-4 h-4 accent-[#1A3C34]"
                />
                Tampilkan sebagai anonim
              </label>

              {message && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                    : "border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
                }`}>
                  {message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1" loading={isSubmitting}>Kirim Ulasan</Button>
                <Link href="/orders" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">Nanti Saja</Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
