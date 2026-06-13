"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

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
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function WalletPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile/wallet');
  }, [router]);

  return null;
}