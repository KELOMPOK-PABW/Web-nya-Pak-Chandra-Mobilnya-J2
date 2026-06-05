"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sellerService } from "@/services/sellerService";

const initialForm = {
  ownerName: "",
  storeName: "",
  storeCategory: "",
  city: "",
  phone: "",
  bankName: "",
  bankAccountNumber: "",
  reason: "",
};

export default function SellerApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await sellerService.getApplicationStatus();
        if (active) setExistingApplication(data);
      } catch {
        if (active) setExistingApplication(null);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const required = ["ownerName", "storeName", "storeCategory", "city", "phone", "reason"];
    if (required.some(k => !form[k]?.trim())) {
      setError("Mohon lengkapi kolom bertanda bintang (*).");
      return;
    }

    setIsSubmitting(true);
    try {
      const application = await sellerService.submitApplication(form);
      setExistingApplication(application);
      setSuccessMsg("Pengajuan berhasil dikirim! Tim kami akan meninjau secepatnya.");
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Gagal mengirim pengajuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Buka Toko Anda</h1>
          <p style={{ fontSize: "16px", color: "#666", marginTop: "8px" }}>Mulai berjualan di PABW Shop dan jangkau lebih banyak pembeli.</p>
        </div>

        {existingApplication && (
          <Card style={{
            marginBottom: "32px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#FFF7ED", border: "1.5px solid #FFEDD5"
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#9A3412" }}>Anda memiliki pengajuan aktif</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#C2410C" }}>Status saat ini sedang dalam tinjauan.</p>
            </div>
            <Link href="/seller/application">
              <Button style={{ padding: "8px 16px", fontSize: "12px" }}>Cek Detail</Button>
            </Link>
          </Card>
        )}

        {(error || successMsg) && (
          <div style={{
            marginBottom: "24px", padding: "12px 16px", borderRadius: "12px", fontSize: "14px",
            background: error ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${error ? "#FECACA" : "#BBF7D0"}`,
            color: error ? "#B91C1C" : "#166534"
          }}>
            {error || successMsg}
          </div>
        )}

        <Card style={{ padding: "32px" }}>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Nama Pemilik *</label>
                <input name="ownerName" value={form.ownerName} onChange={onChange} placeholder="Sesuai KTP"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Nama Toko *</label>
                <input name="storeName" value={form.storeName} onChange={onChange} placeholder="Nama unik toko"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Kategori *</label>
                <input name="storeCategory" value={form.storeCategory} onChange={onChange} placeholder="Contoh: Otomotif"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Kota *</label>
                <input name="city" value={form.city} onChange={onChange} placeholder="Kota domisili"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>No. WhatsApp *</label>
              <input name="phone" value={form.phone} onChange={onChange} placeholder="08xxxxxxxxxx"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ height: "1px", background: "#f1f5f9", margin: "10px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Nama Bank</label>
                <input name="bankName" value={form.bankName} onChange={onChange} placeholder="BCA / Mandiri / dst"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Nomor Rekening</label>
                <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={onChange} placeholder="Untuk pencairan dana"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Alasan Bergabung *</label>
              <textarea name="reason" value={form.reason} onChange={onChange} rows={4} placeholder="Ceritakan singkat tentang produk yang akan Anda jual..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #E5E7EB", outline: "none", boxSizing: "border-box", resize: "none" }} />
            </div>

            <div style={{ marginTop: "12px" }}>
              <Button type="submit" loading={isSubmitting} style={{ width: "100%", height: "48px", fontSize: "16px" }}>
                Kirim Pengajuan
              </Button>
            </div>

            <p style={{ textAlign: "center", margin: 0, fontSize: "12px", color: "#94a3b8" }}>
              Dengan mendaftar, Anda menyetujui Ketentuan Seller PABW Shop.
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
}
