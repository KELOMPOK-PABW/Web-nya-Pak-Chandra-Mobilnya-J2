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
    icon: "🕒",
    hint: "Admin sedang meninjau data Anda. Mohon tunggu maksimal 2x24 jam.",
  },
  approved: {
    label: "Disetujui",
    variant: "success",
    icon: "✅",
    hint: "Selamat! Toko Anda sudah aktif. Anda bisa mulai mengunggah produk sekarang.",
  },
  rejected: {
    label: "Ditolak",
    variant: "danger",
    icon: "❌",
    hint: "Maaf, pengajuan Anda ditolak. Silakan periksa alasan dan ajukan kembali.",
  },
};

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default function SellerApplicationStatusPage() {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const data = await sellerService.getApplicationStatus();
        if (active) setApplication(data);
      } catch (err) {
        if (active) setError(err.message || "Gagal memuat status pengajuan.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
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
          <Card style={{ padding: "48px 32px", textAlign: "center" }}>
            <p style={{ fontSize: "64px", margin: "0 0 20px" }}>📭</p>
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

        <Card style={{ padding: "32px", overflow: "hidden", position: "relative" }}>
          {/* Header Status */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%", background: "#f8f9fa",
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px"
            }}>
              {stat.icon}
            </div>
            <Badge variant={stat.variant} style={{ fontSize: "14px", padding: "6px 20px" }}>{stat.label}</Badge>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "16px", lineHeight: "1.6", maxWidth: "400px", margin: "16px auto 0" }}>
              {stat.hint}
            </p>
          </div>

          <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "32px" }} />

          {/* Detail Data */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>ID Pengajuan</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A" }}>#{application.id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Diajukan Pada</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{fmtDate(application.submittedAt)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Nama Toko</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{application.storeName}</span>
            </div>
          </div>

          {/* Call to Action */}
          <div style={{ marginTop: "40px", display: "flex", gap: "12px" }}>
            {application.status === "rejected" ? (
              <Link href="/seller/apply" style={{ flex: 1 }}>
                <Button style={{ width: "100%" }}>Ajukan Ulang</Button>
              </Link>
            ) : application.status === "approved" ? (
              <Link href="/stores/me" style={{ flex: 1 }}>
                <Button style={{ width: "100%" }}>Buka Dashboard Toko</Button>
              </Link>
            ) : (
              <Button variant="outline" style={{ flex: 1 }} onClick={() => window.location.reload()}>Refresh Status</Button>
            )}
          </div>
        </Card>

      </main>
    </div>
  );
}
