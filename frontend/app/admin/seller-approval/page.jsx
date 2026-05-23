"use client";

import React, { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const ADMIN_MENUS = [
  { label: "Users", href: "/admin/users" },
  { label: "Seller Approval", href: "/admin/seller-approval", badge: "3" },
  { label: "Kategori", href: "/admin/categories" },
  { label: "Kurir", href: "/admin/couriers" },
  { label: "Produk", href: "/admin/products" },
  { label: "E-Wallet", href: "/admin/ewallet" },
];

const INITIAL_APPLICATIONS = [
  {
    id: "APP-2401",
    ownerName: "Arya Zaky",
    storeName: "Zaky Sport Corner",
    category: "Olahraga",
    city: "Bandung",
    phone: "081234567890",
    submittedAt: "2026-05-21 09:20",
    status: "pending",
    bankName: "BCA",
    bankAccountNumber: "1234567890",
    note: "Ingin membuka toko alat olahraga dan aksesoris fitness.",
  },
  {
    id: "APP-2402",
    ownerName: "Siti Rahma",
    storeName: "Rafah Fashion",
    category: "Fashion",
    city: "Jakarta",
    phone: "082233445566",
    submittedAt: "2026-05-21 11:45",
    status: "pending",
    bankName: "Mandiri",
    bankAccountNumber: "9988776655",
    note: "Menjual hijab, blouse, dan outfit muslim modern.",
  },
  {
    id: "APP-2403",
    ownerName: "Budi Santoso",
    storeName: "Budi Gadget Store",
    category: "Elektronik",
    city: "Surabaya",
    phone: "083311122233",
    submittedAt: "2026-05-22 08:05",
    status: "pending",
    bankName: "BRI",
    bankAccountNumber: "5566778899",
    note: "Fokus pada aksesoris gadget dan perangkat pendukung kerja.",
  },
];

const STATUS_STYLE = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABEL = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
};

function formatDate(value) {
  return value;
}

export default function AdminSellerApprovalPage() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selectedId, setSelectedId] = useState(INITIAL_APPLICATIONS[0]?.id ?? null);
  const [reviewNote, setReviewNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const summary = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((item) => item.status === "pending").length,
    approved: applications.filter((item) => item.status === "approved").length,
    rejected: applications.filter((item) => item.status === "rejected").length,
  }), [applications]);

  const filteredApplications = applications.filter((item) => {
    const matchSearch =
      !search ||
      item.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      item.storeName.toLowerCase().includes(search.toLowerCase()) ||
      item.city.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.status === filter;
    return matchSearch && matchFilter;
  });

  const selectedApplication = applications.find((item) => item.id === selectedId) ?? filteredApplications[0] ?? applications[0] ?? null;

  const applyDecision = (id, status) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              reviewedAt: new Date().toLocaleString("id-ID"),
              reviewerNote: reviewNote.trim() || (status === "approved" ? "Disetujui admin." : "Ditolak admin."),
            }
          : item
      )
    );
    setFeedback(status === "approved" ? "Pengajuan berhasil disetujui." : "Pengajuan ditolak.");
    setReviewNote("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar title="Admin Panel" subtitle="Administrator" menus={ADMIN_MENUS} />

        <main className="flex-1 p-8 space-y-6">
          <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Approval Seller</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola pengajuan seller yang masuk, lalu setujui atau tolak secara manual.</p>
            </div>
            <Badge variant="info" className="w-fit">{summary.pending} pengajuan aktif</Badge>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Pengajuan", value: summary.total, color: "#1A3C34" },
              { label: "Menunggu Review", value: summary.pending, color: "#CA8A04" },
              { label: "Disetujui", value: summary.approved, color: "#16A34A" },
              { label: "Ditolak", value: summary.rejected, color: "#DC2626" },
            ].map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-3xl font-bold mt-2" style={{ color: item.color }}>{item.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6 items-start">
            <Card className="p-0 overflow-hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-[#ECEFF3]">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">List Pengajuan</h2>
                  <p className="text-sm text-gray-500">Klik salah satu pengajuan untuk melihat detail.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama / toko / ID"
                    className="h-11 rounded-2xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#1A3C34]"
                  />
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="h-11 rounded-2xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#1A3C34] bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {filteredApplications.map((item) => {
                  const isSelected = selectedApplication?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left p-5 transition-colors ${isSelected ? "bg-[#F7FBFA]" : "hover:bg-[#FAFAFA]"}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#111827]">{item.storeName}</h3>
                            <Badge variant={STATUS_STYLE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.ownerName} • {item.city} • {item.category}</p>
                          <p className="text-xs text-gray-400">ID {item.id} • Diajukan {formatDate(item.submittedAt)}</p>
                        </div>
                        <div className="text-sm text-gray-500 sm:text-right">
                          <div>{item.phone}</div>
                          <div>{item.bankName} • {item.bankAccountNumber}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredApplications.length === 0 && (
                  <div className="p-10 text-center text-gray-500">Tidak ada pengajuan yang cocok dengan filter.</div>
                )}
              </div>
            </Card>

            <Card className="p-6 sticky top-6">
              {selectedApplication ? (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-[#111827]">Detail Pengajuan</h2>
                        <p className="text-sm text-gray-500">Review data sebelum approve atau reject.</p>
                      </div>
                      <Badge variant={STATUS_STYLE[selectedApplication.status]}>{STATUS_LABEL[selectedApplication.status]}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <Detail label="Nama Pemilik" value={selectedApplication.ownerName} />
                    <Detail label="Nama Toko" value={selectedApplication.storeName} />
                    <Detail label="Kategori" value={selectedApplication.category} />
                    <Detail label="Kota" value={selectedApplication.city} />
                    <Detail label="Telepon" value={selectedApplication.phone} />
                    <Detail label="Bank" value={`${selectedApplication.bankName} • ${selectedApplication.bankAccountNumber}`} />
                    <Detail label="ID Pengajuan" value={selectedApplication.id} />
                    <Detail label="Dikirim" value={formatDate(selectedApplication.submittedAt)} />
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Alasan Pengajuan</p>
                    <p className="text-sm text-[#374151] leading-6">{selectedApplication.note}</p>
                  </div>

                  {selectedApplication.reviewerNote && (
                    <div className="rounded-2xl border border-[#E0E7FF] bg-[#EEF2FF] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#4F46E5] mb-1">Catatan Admin</p>
                      <p className="text-sm text-[#3730A3] leading-6">{selectedApplication.reviewerNote}</p>
                      {selectedApplication.reviewedAt && <p className="text-xs text-[#6366F1] mt-2">{selectedApplication.reviewedAt}</p>}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Catatan Review</label>
                    <textarea
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      rows={4}
                      placeholder="Tambahkan catatan untuk seller, misalnya dokumen kurang jelas atau data toko sudah valid."
                      className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#1A3C34] resize-none"
                    />
                  </div>

                  {feedback && (
                    <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
                      {feedback}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => applyDecision(selectedApplication.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="flex-1"
                      onClick={() => applyDecision(selectedApplication.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">Belum ada pengajuan yang dipilih.</div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-[#1F2937] mt-1 wrap-break-word">{value}</p>
    </div>
  );
}