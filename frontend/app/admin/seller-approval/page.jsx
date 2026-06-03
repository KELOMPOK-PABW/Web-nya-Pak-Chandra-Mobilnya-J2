"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const ADMIN_MENUS = [
  { label: "Users", href: "/admin/users" },
  { label: "Seller Approval", href: "/admin/seller-approval" },
  { label: "Kategori", href: "/admin/categories" },
  { label: "Kurir", href: "/admin/couriers" },
  { label: "Produk", href: "/admin/products" },
  { label: "E-Wallet", href: "/admin/ewallet" },
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
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminSellerApprovalPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const summary = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((item) => item.status === "pending").length,
    approved: applications.filter((item) => item.status === "approved").length,
    rejected: applications.filter((item) => item.status === "rejected").length,
  }), [applications]);

  const filteredApplications = applications.filter((item) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      !keyword ||
      String(item.ownerName).toLowerCase().includes(keyword) ||
      String(item.storeName).toLowerCase().includes(keyword) ||
      String(item.city).toLowerCase().includes(keyword) ||
      String(item.id).toLowerCase().includes(keyword);
    const matchFilter = filter === "all" || item.status === filter;
    return matchSearch && matchFilter;
  });

  const selectedApplication =
    applications.find((item) => item.id === selectedId) ??
    filteredApplications[0] ??
    applications[0] ??
    null;

  async function loadApplications() {
    setIsLoading(true);
    setError("");
    try {
      const data = await sellerService.getSellerApplications();
      setApplications(data);
      setSelectedId((current) => current ?? data[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Gagal mengambil data pengajuan seller.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const applyDecision = async (id, status) => {
    setActionLoading(`${status}-${id}`);
    setFeedback("");
    setError("");

    try {
      if (status === "approved") {
        await sellerService.approveApplication(id);
        setFeedback("Pengajuan berhasil disetujui.");
      } else {
        await sellerService.rejectApplication(id, reviewNote.trim() || "Pengajuan ditolak admin.");
        setFeedback("Pengajuan ditolak.");
      }

      setReviewNote("");
      await loadApplications();
    } catch (err) {
      setError(err.message || "Gagal memperbarui status pengajuan.");
    } finally {
      setActionLoading("");
    }
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
              <p className="text-sm text-gray-500 mt-1">Kelola pengajuan seller dari API admin approval.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="info" className="w-fit">{summary.pending} pengajuan aktif</Badge>
              <Button type="button" variant="outline" size="sm" onClick={loadApplications} disabled={isLoading}>
                Refresh
              </Button>
            </div>
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

          {feedback && (
            <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
              {feedback}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}

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
                {isLoading ? (
                  <div className="p-10 text-center text-gray-500">Memuat pengajuan seller...</div>
                ) : filteredApplications.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">Tidak ada pengajuan yang cocok dengan filter.</div>
                ) : (
                  filteredApplications.map((item) => {
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
                              <Badge variant={STATUS_STYLE[item.status] ?? "default"}>
                                {STATUS_LABEL[item.status] ?? item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.ownerName} - {item.city} - {item.category}</p>
                            <p className="text-xs text-gray-400">ID {item.id} - Diajukan {formatDate(item.submittedAt)}</p>
                          </div>
                          <div className="text-sm text-gray-500 sm:text-right">
                            <div>{item.phone}</div>
                            <div>{item.bankName} - {item.bankAccountNumber}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>

            <Card className="p-6 sticky top-6">
              {selectedApplication ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#111827]">Detail Pengajuan</h2>
                      <p className="text-sm text-gray-500">Review data sebelum approve atau reject.</p>
                    </div>
                    <Badge variant={STATUS_STYLE[selectedApplication.status] ?? "default"}>
                      {STATUS_LABEL[selectedApplication.status] ?? selectedApplication.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <Detail label="Nama Pemilik" value={selectedApplication.ownerName} />
                    <Detail label="Nama Toko" value={selectedApplication.storeName} />
                    <Detail label="Kategori" value={selectedApplication.category} />
                    <Detail label="Kota" value={selectedApplication.city} />
                    <Detail label="Telepon" value={selectedApplication.phone} />
                    <Detail label="Bank" value={`${selectedApplication.bankName} - ${selectedApplication.bankAccountNumber}`} />
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
                      {selectedApplication.reviewedAt && (
                        <p className="text-xs text-[#6366F1] mt-2">{formatDate(selectedApplication.reviewedAt)}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-[#374151] block mb-2">Catatan Review</label>
                    <textarea
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      rows={4}
                      placeholder="Tambahkan catatan untuk seller."
                      className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#1A3C34] resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={selectedApplication.status !== "pending"}
                      loading={actionLoading === `approved-${selectedApplication.id}`}
                      onClick={() => applyDecision(selectedApplication.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="flex-1"
                      disabled={selectedApplication.status !== "pending"}
                      loading={actionLoading === `rejected-${selectedApplication.id}`}
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
      <p className="text-sm font-semibold text-[#1F2937] mt-1 break-words">{value}</p>
    </div>
  );
}
