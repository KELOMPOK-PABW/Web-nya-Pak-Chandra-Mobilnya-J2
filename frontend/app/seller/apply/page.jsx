"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const initialForm = {
  storeName: "",
  phone: "",
};

const STATUS_LABEL = {
  pending: { label: "Menunggu Review", variant: "warning" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Ditolak", variant: "danger" },
};

export default function SellerApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoadingStatus(true);
      try {
        const data = await sellerService.getApplicationStatus();
        if (active) setExistingApplication(data);
      } catch {
        if (active) setExistingApplication(null);
      } finally {
        if (active) setIsLoadingStatus(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.storeName.trim() || !form.phone.trim()) {
      setError("Nama toko dan nomor telepon wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const application = await sellerService.submitApplication(form);
      setExistingApplication(application);
      setSuccessMsg("Pengajuan berhasil dikirim. Tim admin akan meninjau secepatnya.");
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Gagal mengirim pengajuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = existingApplication?.status;
  const statusMeta = STATUS_LABEL[status] || STATUS_LABEL.pending;
  const hasActiveApplication = status === "pending" || status === "approved";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Buka Toko Anda</h1>
          <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
            Daftarkan toko untuk mulai mengelola produk dan menerima pesanan.
          </p>
        </div>

        {existingApplication && (
          <Card
            style={{
              marginBottom: "24px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              border: "1.5px solid #E5E7EB",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#1A1A1A" }}>
                Pengajuan terakhir: {existingApplication.storeName}
              </p>
              <div style={{ marginTop: "8px" }}>
                <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
              </div>
            </div>
            <Link href="/seller/application">
              <Button variant="outline" style={{ padding: "8px 16px", fontSize: "12px" }}>Lihat Status</Button>
            </Link>
          </Card>
        )}

        {(error || successMsg) && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              background: error ? "#FEF2F2" : "#F0FDF4",
              border: `1px solid ${error ? "#FECACA" : "#BBF7D0"}`,
              color: error ? "#B91C1C" : "#166534",
            }}
          >
            {error || successMsg}
          </div>
        )}

        <Card style={{ padding: "28px" }}>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>
                Nama Toko
              </label>
              <input
                name="storeName"
                value={form.storeName}
                onChange={onChange}
                disabled={hasActiveApplication}
                placeholder="Contoh: Cahyo Motor Parts"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E7EB",
                  outline: "none",
                  boxSizing: "border-box",
                  background: hasActiveApplication ? "#f8fafc" : "#fff",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>
                No. Telepon
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                disabled={hasActiveApplication}
                placeholder="08xxxxxxxxxx"
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E7EB",
                  outline: "none",
                  boxSizing: "border-box",
                  background: hasActiveApplication ? "#f8fafc" : "#fff",
                }}
              />
            </div>

            <div style={{ marginTop: "8px", display: "flex", gap: "12px", alignItems: "center" }}>
              <Button type="submit" loading={isSubmitting || isLoadingStatus} disabled={hasActiveApplication} style={{ minWidth: "180px" }}>
                Kirim Pengajuan
              </Button>
              {status === "rejected" && (
                <span style={{ fontSize: "12px", color: "#64748b" }}>Pengajuan ditolak dapat dikirim ulang dengan data baru.</span>
              )}
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
