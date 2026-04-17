import React from "react";

export function Badge({ children, variant = "info", className = "" }) {
  const variants = {
    success: "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]",
    warning: "bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A]",
    danger:  "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]",
    info:    "bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]",
    default: "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
