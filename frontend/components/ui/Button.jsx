"use client";

import React from "react";

const VARIANTS = {
    primary: {
        background: "#1A3C34",
        color: "#fff",
        border: "none",
        hoverBg: "#15312A",
    },
    danger: {
        background: "#FEF2F2",
        color: "#DC2626",
        border: "1.5px solid #FECACA",
        hoverBg: "#FEE2E2",
    },
    outline: {
        background: "#fff",
        color: "#1A3C34",
        border: "1.5px solid #1A3C34",
        hoverBg: "#F0FBF8",
    },
    ghost: {
        background: "transparent",
        color: "#6B7280",
        border: "1.5px solid #E5E7EB",
        hoverBg: "#F3F4F6",
    },
};

export function Button({
    children,
    variant = "primary",
    loading = false,
    disabled = false,
    onClick,
    type = "button",
    className = "",
    style = {},
}) {
    const v = VARIANTS[variant] || VARIANTS.primary;
    const isDisabled = loading || disabled;

    const isFullWidth = className.includes("w-full");

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: isFullWidth ? "100%" : undefined,
                padding: "12px 20px",
                borderRadius: 12,
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 14,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.6 : 1,
                transition: "background 0.15s, opacity 0.15s",
                background: v.background,
                color: v.color,
                border: v.border || "none",
                outline: "none",
                ...style,
            }}
        >
            {loading && (
                <span style={{
                    width: 14, height: 14, border: "2px solid currentColor",
                    borderTopColor: "transparent", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                    flexShrink: 0,
                }} />
            )}
            {children}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
}
