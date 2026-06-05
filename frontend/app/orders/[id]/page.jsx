"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";

/* ── konstanta ── */
const STATUS_LABELS = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  processing: "Diproses",
  menunggu_penjual: "Menunggu Penjual",
  shipped: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  canceled: "Dibatalkan",
};

const STATUS_COLORS = {
  pending: { color: "#F59E0B", bg: "#FEF3C7" },
  paid: { color: "#3B82F6", bg: "#DBEAFE" },
  processing: { color: "#8B5CF6", bg: "#EDE9FE" },
  menunggu_penjual: { color: "#F59E0B", bg: "#FEF3C7" },
  shipped: { color: "#10B981", bg: "#D1FAE5" },
  delivered: { color: "#059669", bg: "#A7F3D0" },
  completed: { color: "#059669", bg: "#A7F3D0" },
  cancelled: { color: "#EF4444", bg: "#FEE2E2" },
  canceled: { color: "#EF4444", bg: "#FEE2E2" },
};

/* Status timeline — urutan langkah proses order */
const STATUS_TIMELINE = [
  { key: "pending", label: "Pesanan Dibuat", icon: "📋" },
  { key: "menunggu_penjual", label: "Menunggu Penjual", icon: "🏪" },
  { key: "paid", label: "Pembayaran Diterima", icon: "💳" },
  { key: "processing", label: "Diproses Penjual", icon: "⚙️" },
  { key: "shipped", label: "Dalam Pengiriman", icon: "🚚" },
  { key: "delivered", label: "Terkirim", icon: "📦" },
  { key: "completed", label: "Selesai", icon: "✅" },
];

/* ── helpers ── */
function fmt(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n || 0));
}

function fmtDate(raw) {
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return null; }
}

function getItemSubtotal(item) {
  if (item.subtotal !== undefined && item.subtotal !== null) return Number(item.subtotal);
  return Number(item.price || item.priceSnap || item.product?.price || 0) * Number(item.qty || item.quantity || 1);
}

/* ── komponen kecil ── */
function SectionCard({ title, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1px solid #EBEBEB",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      {title && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>{title}</span>
        </div>
      )}
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] ?? { color: "#6B7280", bg: "#F3F4F6" };
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg,
      borderRadius: 99, padding: "4px 14px", display: "inline-block", whiteSpace: "nowrap",
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* Status history item dari BE (jika endpoint sudah tersedia) */
function HistoryItem({ entry, isLast }) {
  return (
    <div style={{ display: "flex", gap: 16, paddingBottom: isLast ? 0 : 20, position: "relative" }}>
      {/* garis vertikal */}
      {!isLast && (
        <div style={{
          position: "absolute", left: 7, top: 18,
          width: 2, height: "calc(100% - 4px)",
          background: "#E5E7EB",
        }} />
      )}
      {/* dot */}
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        background: "#1A3C34", border: "2px solid #E0F2EE",
        flexShrink: 0, marginTop: 2, zIndex: 1,
      }} />
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0A0A0A" }}>
          {STATUS_LABELS[entry.status] || entry.status}
        </p>
        {entry.note && (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{entry.note}</p>
        )}
        {entry.created_at && (
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9CA3AF" }}>
            {fmtDate(entry.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}

/* Progress timeline berdasarkan status saat ini */
function StatusTimeline({ status }) {
  if (status === "cancelled" || status === "canceled") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>❌</div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#DC2626" }}>Pesanan Dibatalkan</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>Pesanan ini telah dibatalkan.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_TIMELINE.findIndex(s => s.key === status);
  const safeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
      {STATUS_TIMELINE.map((step, idx) => {
        const isDone = idx < safeIdx;
        const isCurrent = idx === safeIdx;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 72 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isCurrent ? 18 : 16,
                background: isDone ? "#1A3C34" : isCurrent ? "#E0F2F1" : "#F3F4F6",
                border: isCurrent ? "2px solid #1A3C34" : "none",
                transition: "background 0.2s",
              }}>
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isCurrent ? 700 : 500, textAlign: "center",
                color: isDone || isCurrent ? "#0A0A0A" : "#9CA3AF",
                lineHeight: 1.3, maxWidth: 68,
              }}>
                {step.label}
              </span>
            </div>
            {idx < STATUS_TIMELINE.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 16,
                background: idx < safeIdx ? "#1A3C34" : "#E5E7EB",
                marginBottom: 22,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── page ── */
export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLoggedIn = Boolean(authService.getToken());

  async function loadOrder() {
    setLoading(true);
    setError("");
    try {
      const [orderData, historyData] = await Promise.allSettled([
        orderService.getOrderById(id),
        orderService.getOrderHistory(id),
      ]);
      if (orderData.status === "fulfilled") setOrder(orderData.value);
      else throw orderData.reason;
      if (historyData.status === "fulfilled") setHistory(historyData.value);
    } catch (err) {
      setError(err.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); setError("Silakan login untuk melihat detail pesanan."); return; }
    if (id) loadOrder();
  }, [id, isLoggedIn]);

  /* derived */
  const items = order?.items || [];
  const status = order?.status || "pending";
  const orderId = order?.orderId ?? order?.id ?? id;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getItemSubtotal(item), 0), [items]);
  const total = Number(order?.total || subtotal);

  const canCancel = ["pending", "menunggu_penjual", "paid", "processing"].includes(status);
  const canConfirm = ["shipped", "delivered"].includes(status);

  const runAction = async (action) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (action === "cancel") {
        await orderService.cancelOrder(orderId);
        setSuccess("Pesanan berhasil dibatalkan.");
      } else {
        await orderService.confirmOrder(orderId);
        setSuccess("Pesanan dikonfirmasi diterima. Terima kasih!");
      }
      await loadOrder();
    } catch (err) {
      setError(err.message || "Gagal memperbarui status pesanan. Pastikan backend sudah mendukung endpoint ini.");
    } finally {
      setSaving(false);
    }
  };

  /* ── skeletons / guard ── */
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 460, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>🔐</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0A", marginBottom: 8 }}>Login Diperlukan</h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Silakan login untuk melihat detail pesanan.</p>
          <Link href="/auth/login" style={{
            padding: "12px 28px", borderRadius: 12, background: "#1A3C34", color: "#fff",
            fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block",
          }}>Login</Link>
        </div>
      </div>
    );
  }

  /* ── main ── */
  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 64px" }}>

        {/* back + judul */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/orders" style={{ fontSize: 13, fontWeight: 600, color: "#1A3C34", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Pesanan
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0A0A0A" }}>
              Detail Pesanan {orderId ? `#${orderId}` : ""}
            </h1>
            {order && <StatusBadge status={status} />}
          </div>
          {order?.createdAt && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>
              Dibuat: {fmtDate(order.createdAt)}
            </p>
          )}
        </div>

        {/* notif error / success */}
        {(error || success) && (
          <div style={{
            marginBottom: 16, padding: "12px 16px", borderRadius: 12, fontSize: 13,
            background: error ? "#FEF2F2" : "#F0FBF8",
            border: `1px solid ${error ? "#FECACA" : "#A7F3D0"}`,
            color: error ? "#DC2626" : "#065F46",
          }}>
            {error || success}
          </div>
        )}

        {/* loading skeleton */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB", padding: 20 }}>
                <div style={{ height: 14, width: "50%", background: "#F3F4F6", borderRadius: 6, marginBottom: 12 }} />
                <div style={{ height: 14, width: "75%", background: "#F3F4F6", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 14, width: "35%", background: "#F3F4F6", borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : !order ? (
          <SectionCard>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 48, margin: "0 0 12px" }}>🔍</p>
              <p style={{ fontWeight: 600, fontSize: 15, color: "#374151", margin: "0 0 6px" }}>Pesanan tidak ditemukan</p>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>Cek kembali ID pesanan atau hubungi support.</p>
            </div>
          </SectionCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* CTA bayar jika pending */}
            {status === "pending" && (
              <Link href={`/payment/${orderId}`} style={{ textDecoration: "none" }}>
                <Button className="w-full">💳 Bayar Sekarang</Button>
              </Link>
            )}

            {/* Progress timeline */}
            <SectionCard title="📊 Status Pesanan">
              <StatusTimeline status={status} />
            </SectionCard>

            {/* Produk */}
            <SectionCard title="🛍 Produk Dipesan">
              {items.length === 0 ? (
                <p style={{ color: "#9CA3AF", fontSize: 13 }}>Tidak ada item pesanan.</p>
              ) : (
                <div>
                  {items.map((item, index) => (
                    <div
                      key={item.order_item_id ?? item.id ?? index}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 0",
                        borderBottom: index < items.length - 1 ? "1px solid #F3F4F6" : "none",
                      }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                      }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>
                          {item.product_name || item.productNameSnap || item.product?.name || `Item #${index + 1}`}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>
                          {item.store_name || item.seller?.full_name || "Toko"} · x{item.qty || item.quantity || 1}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1A3C34", whiteSpace: "nowrap" }}>
                        {fmt(getItemSubtotal(item))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Alamat */}
            {order.address && (
              <SectionCard title="📍 Alamat Pengiriman">
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0A0A0A" }}>
                  {order.address.address}
                </p>
                {order.address.city && (
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
                    {order.address.city}
                  </p>
                )}
              </SectionCard>
            )}

            {/* Ringkasan biaya */}
            <SectionCard title="🧾 Ringkasan Biaya">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>Subtotal</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ height: 1, background: "#F3F4F6" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#1A3C34" }}>{fmt(total)}</span>
                </div>
              </div>
            </SectionCard>

            {/* Riwayat Status — tampil jika BE sudah kirim data */}
            {history.length > 0 && (
              <SectionCard title="🕐 Riwayat Status">
                <div>
                  {history.map((entry, idx) => (
                    <HistoryItem key={idx} entry={entry} isLast={idx === history.length - 1} />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Aksi: cancel / konfirmasi */}
            {(canCancel || canConfirm) && (
              <div style={{ display: "grid", gridTemplateColumns: canCancel && canConfirm ? "1fr 1fr" : "1fr", gap: 10 }}>
                {canCancel && (
                  <Button variant="danger" loading={saving} onClick={() => runAction("cancel")}>
                    Batalkan Pesanan
                  </Button>
                )}
                {canConfirm && (
                  <Button loading={saving} onClick={() => runAction("confirm")}>
                    ✅ Konfirmasi Terima
                  </Button>
                )}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
