"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const MY_REVIEWS = [
  {
    id: "REV-MY-001",
    productName: "Sneaker Harian",
    sellerName: "Toko Sporty",
    orderId: "ORD-2408-118",
    rating: 5,
    comment: "Nyaman dipakai dan kualitasnya sesuai foto. Packing rapi.",
    date: "2026-05-30",
    status: "published",
  },
  {
    id: "REV-MY-002",
    productName: "Tas Kulit Klasik",
    sellerName: "Leather Hub",
    orderId: "ORD-2408-096",
    rating: 4,
    comment: "Bahan bagus, ruang penyimpanan cukup banyak. Warna sedikit lebih gelap.",
    date: "2026-05-22",
    status: "published",
  },
  {
    id: "REV-MY-003",
    productName: "Headphone Bass",
    sellerName: "Audio Pro",
    orderId: "ORD-2408-071",
    rating: 3,
    comment: "Suara oke, tapi bantalan telinga terasa agak panas setelah lama dipakai.",
    date: "2026-05-15",
    status: "draft",
  },
];

const STATUS_META = {
  published: { label: "Dipublikasikan", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Stars({ rating }) {
  return (
    <span className="inline-flex text-sm" aria-label={`${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? "text-[#F59E0B]" : "text-[#D1D5DB]"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function MyReviewsPage() {
  const [filter, setFilter] = useState("all");

  const filteredReviews = useMemo(() => {
    if (filter === "all") return MY_REVIEWS;
    return MY_REVIEWS.filter((review) => review.status === filter);
  }, [filter]);

  const summary = useMemo(() => ({
    total: MY_REVIEWS.length,
    published: MY_REVIEWS.filter((review) => review.status === "published").length,
    draft: MY_REVIEWS.filter((review) => review.status === "draft").length,
    average: MY_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / MY_REVIEWS.length,
  }), []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1A3C34]">My Reviews</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mt-1">Ulasan Saya</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola ulasan produk yang pernah kamu tulis.</p>
          </div>
          <Link href="/reviews/create">
            <Button type="button">Tulis Ulasan</Button>
          </Link>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Ulasan", value: summary.total },
            { label: "Dipublikasikan", value: summary.published },
            { label: "Draft", value: summary.draft },
            { label: "Rata-rata Rating", value: summary.average.toFixed(1) },
          ].map((item) => (
            <Card key={item.label} className="p-5">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold text-[#1A3C34] mt-2">{item.value}</p>
            </Card>
          ))}
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-[#ECEFF3]">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Daftar Ulasan</h2>
              <p className="text-sm text-gray-500">UI statis untuk halaman `/my/reviews`.</p>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-11 rounded-2xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#1A3C34] bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="published">Dipublikasikan</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {filteredReviews.map((review) => {
              const status = STATUS_META[review.status] ?? STATUS_META.draft;
              return (
                <article key={review.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#E0F2F1] text-[#1A3C34] font-bold flex items-center justify-center shrink-0">
                        {review.productName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-[#111827]">{review.productName}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{review.sellerName} - {review.orderId}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <Stars rating={review.rating} />
                          <span>{review.rating}.0</span>
                          <span>{formatDate(review.date)}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#374151]">{review.comment}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link href="/reviews/create">
                        <Button type="button" size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Button type="button" size="sm" variant="secondary">Lihat Produk</Button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredReviews.length === 0 && (
              <div className="p-10 text-center text-gray-500">Belum ada ulasan dengan status ini.</div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

