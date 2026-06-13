"use client";

import React from "react";

const VARIANTS = {
    default: { color: "#6B7280", bg: "#F3F4F6" },
    warning: { color: "#F59E0B", bg: "#FEF3C7" },
    info: { color: "#3B82F6", bg: "#DBEAFE" },
    success: { color: "#059669", bg: "#A7F3D0" },
    danger: { color: "#EF4444", bg: "#FEE2E2" },
    purple: { color: "#8B5CF6", bg: "#EDE9FE" },
};

export function Badge({ children, variant = "default" }) {
    const v = VARIANTS[variant] || VARIANTS.default;
    return (
        <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: v.color,
            background: v.bg,
            borderRadius: 99,
            padding: "4px 12px",
            display: "inline-block",
            whiteSpace: "nowrap",
        }}>
            {children}
        </span>
    );
}
