"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu Review",
    variant: "warning",
    marker: "!",
    hint: "Admin sedang meninjau data toko Anda.",
  },
  approved: {
    label: "Disetujui",
    variant: "success",
    marker: "OK",
    hint: "Toko Anda sudah aktif. Anda bisa mulai mengelola toko dan produk.",
  },
  rejected: {
    label: "Ditolak",
    variant: "danger",
    marker: "X",
    hint: "Pengajuan ditolak. Silakan ajukan kembali dengan data yang benar.",
  },
};

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SellerApplicationStatusPage() {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplication = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await sellerService.getApplicationStatus();
      setApplication(data);
    } catch (err) {
      setError(err.message || "Gagal memuat status pengajuan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <Navbar />
        <main style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center" }}>
          <p style={{ color: "#666" }}>Memuat status pengajuan...</p>
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />
        <main style={{ maxWidth: "600px", margin: "80px auto", padding: "0 24px" }}>
          {error && (
            <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: "14px" }}>
              {error}
            </div>
          )}
          <Card style={{ padding: "48px 32px", textAlign: "center" }}>
            <p style={{ fontSize: "44px", fontWeight: 800, color: "#CBD5E1", margin: "0 0 16px" }}>--</p>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Belum Ada Pengajuan</h1>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "12px", lineHeight: "1.6" }}>
              Anda belum mengirimkan pengajuan sebagai seller. Buka toko sekarang untuk mulai berjualan.
            </p>
            <div style={{ marginTop: "32px" }}>
              <Link href="/seller/apply">
                <Button>Buka Toko Sekarang</Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const stat = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <main style={{ maxWidth: "660px", margin: "40px auto", padding: "0 24px 64px" }}>
        <div style={{ marginBottom: "32px" }}>
          <Link href="/home" style={{ fontSize: "13px", fontWeight: 600, color: "#1A3C34", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            Kembali ke Beranda
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A1A", margin: "16px 0 0" }}>Status Pengajuan</h1>
        </div>

        {error && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <Card style={{ padding: "32px", overflow: "hidden", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                minWidth: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#f8f9fa",
                margin: "0 auto 16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#1A3C34",
              }}
            >
              {stat.marker}
            </div>
            <Badge variant={stat.variant} style={{ fontSize: "14px", padding: "6px 20px" }}>{stat.label}</Badge>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "16px", lineHeight: "1.6", maxWidth: "400px", margin: "16px auto 0" }}>
              {stat.hint}
            </p>
          </div>

          <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "32px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              ["ID Pengajuan", `#${application.id}`],
              ["Diajukan Pada", fmtDate(application.submittedAt)],
              ["Nama Toko", application.storeName],
              ["No. Telepon", application.phone],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "12px 16px", background: "#f8fafc", borderRadius: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A", textAlign: "right" }}>{value || "-"}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "40px", display: "flex", gap: "12px" }}>
            {application.status === "rejected" ? (
              <Link href="/seller/apply" style={{ flex: 1 }}>
                <Button style={{ width: "100%" }}>Ajukan Ulang</Button>
              </Link>
            ) : application.status === "approved" ? (
              <Link href="/stores/me" style={{ flex: 1 }}>
                <Button style={{ width: "100%" }}>Buka Toko Saya</Button>
              </Link>
            ) : (
              <Button variant="outline" style={{ flex: 1 }} onClick={loadApplication}>Refresh Status</Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
