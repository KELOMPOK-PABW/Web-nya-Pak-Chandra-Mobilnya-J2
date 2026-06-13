"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from '@/components/layout/Navbar';
import { walletService } from '@/services/walletService';

const TYPE_CONFIG = {
  payment: { label: "Pembayaran", color: "#EF4444", bg: "#FEF2F2", sign: "-" },
  topup:   { label: "Top Up",     color: "#10B981", bg: "#D1FAE5", sign: "+" },
  refund:  { label: "Refund",     color: "#3B82F6", bg: "#DBEAFE", sign: "+"},
};

const FILTER_TABS = [
  { id: "all",     label: "Semua" },
  { id: "topup",   label: "Top Up" },
  { id: "payment", label: "Pembayaran" },
  { id: "refund",  label: "Refund" },
];

function fmt(n) {
  if (n === null || n === undefined) return "-";
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch (e) {
    return iso;
  }
}

export default function WalletPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState(0);
  const [topupLoading, setTopupLoading] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const bal = await walletService.getBalance();
        setBalance(bal);
      } catch (err) {
        setError(err?.message || "Gagal memuat data saldo wallet.");
      }

      try {
        const txns = await walletService.getTransactions();
        setTransactions(txns ?? []);
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleTopupSubmit = async () => {
    setTopupLoading(true);
    try {
      const result = await walletService.topup(Number(topupAmount));
      // refresh data
      const bal = await walletService.getBalance();
      const txns = await walletService.getTransactions();
      setBalance(bal);
      setTransactions(txns ?? []);
      setShowTopup(false);
      setTopupAmount(0);
    } catch (err) {
      alert(err?.message || 'Gagal top up.');
    } finally {
      setTopupLoading(false);
    }
  };

  const handleRefundSubmit = async () => {
    setRefundLoading(true);
    try {
      const result = await walletService.refund(Number(refundOrderId));
      const bal = await walletService.getBalance();
      const txns = await walletService.getTransactions();
      setBalance(bal);
      setTransactions(txns ?? []);
      setShowRefund(false);
      setRefundOrderId("");
    } catch (err) {
      alert(err?.message || 'Gagal memproses refund.');
    } finally {
      setRefundLoading(false);
    }
  };

  const filtered = transactions.filter(t =>
    activeFilter === "all" || t.type === activeFilter
  );

  const totalMasuk  = transactions.filter(t => t.type !== "payment").reduce((s, t) => s + (t.amount || 0), 0);
  const totalKeluar = transactions.filter(t => t.type === "payment").reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">E-Wallet</h1>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl px-4 py-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: "16px" }}>
            <svg className="w-4 h-4 shrink-0" style={{ marginTop: "2px", color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9"/>
              <path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
            </svg>
            <p style={{ fontSize: "14px", color: "#DC2626", margin: 0, fontFamily: "inherit" }}>{error}</p>
          </div>
        )}

        <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Saldo</p>
              <p className="text-3xl font-bold">{loading ? "—" : fmt(balance ?? 0)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowTopup(true)} className="px-4 py-2 rounded-lg border" style={{ background: "#D1FAE5", color: "#065F46" }}>Top Up</button>
              <button onClick={() => setShowRefund(true)} className="px-4 py-2 rounded-lg border" style={{ background: "#FEF2F2", color: "#B91C1C" }}>Tarik</button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {FILTER_TABS.map(t => (
                <button key={t.id} onClick={() => setActiveFilter(t.id)} className={`px-3 py-1 rounded-full ${activeFilter===t.id? 'bg-black text-white':'bg-gray-100 text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <span className="mr-4">Masuk: <strong>{fmt(totalMasuk)}</strong></span>
              <span>Keluar: <strong>{fmt(totalKeluar)}</strong></span>
            </div>
          </div>

          <div>
            {loading ? (
              <p className="text-gray-500">Memuat transaksi…</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">Belum ada transaksi.</p>
            ) : (
              <ul className="space-y-3">
                {filtered.map(tx => (
                  <li key={tx.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: TYPE_CONFIG[tx.type]?.bg || '#fff' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${TYPE_CONFIG[tx.type]?.color || '#ddd'}` }}>
                        <span style={{ color: TYPE_CONFIG[tx.type]?.color || '#000' }}>{TYPE_CONFIG[tx.type]?.label?.[0] ?? '•'}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{tx.title || TYPE_CONFIG[tx.type]?.label || tx.type}</p>
                        <p className="text-xs text-gray-500">{formatDate(tx.created_at || tx.date || tx.createdAt || '')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: TYPE_CONFIG[tx.type]?.color || '#000' }}>{(TYPE_CONFIG[tx.type]?.sign || '')}{fmt(tx.amount)}</p>
                      <p className="text-xs text-gray-400">{tx.status || ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <TopUpModal open={showTopup} onClose={() => setShowTopup(false)} amount={topupAmount} setAmount={setTopupAmount} onSubmit={handleTopupSubmit} loading={topupLoading} />
        <RefundModal open={showRefund} onClose={() => setShowRefund(false)} orderId={refundOrderId} setOrderId={setRefundOrderId} onSubmit={handleRefundSubmit} loading={refundLoading} />
      </main>
    </div>
  );
}

// Top up modal and refund modal components placed at bottom of file
// (kept simple inline to avoid adding new files)
export function TopUpModal({ open, onClose, amount, setAmount, onSubmit, loading }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', padding:24, borderRadius:12, width:360 }}>
        <h3 style={{ margin:0, marginBottom:12 }}>Top Up Saldo</h3>
        <input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #E5E7EB', marginBottom:12 }} />
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid #E5E7EB' }}>Batal</button>
          <button onClick={onSubmit} disabled={loading} style={{ flex:1, padding:10, borderRadius:8, background:'#065F46', color:'#fff' }}>{loading ? 'Memproses...' : 'Top Up'}</button>
        </div>
      </div>
    </div>
  );
}

export function RefundModal({ open, onClose, orderId, setOrderId, onSubmit, loading }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', padding:24, borderRadius:12, width:420 }}>
        <h3 style={{ margin:0, marginBottom:12 }}>Tarik / Refund (by Order ID)</h3>
        <input type="text" value={orderId} onChange={(e)=>setOrderId(e.target.value)} placeholder="Masukkan ID pesanan" style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #E5E7EB', marginBottom:12 }} />
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid #E5E7EB' }}>Batal</button>
          <button onClick={onSubmit} disabled={loading} style={{ flex:1, padding:10, borderRadius:8, background:'#B91C1C', color:'#fff' }}>{loading ? 'Memproses...' : 'Kembalikan'}</button>
        </div>
      </div>
    </div>
  );
}
