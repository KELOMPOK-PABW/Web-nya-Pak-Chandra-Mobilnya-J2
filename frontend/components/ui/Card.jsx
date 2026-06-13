"use client";

import React from "react";

export function Card({ children, className = "", style = {} }) {
    const noPadding = className.includes("p-0");
    const hasOverflow = className.includes("overflow-hidden");
    const pClass = className.match(/\bp-(\d+)\b/);
    const paddingMap = { "5": "20px", "4": "16px", "3": "12px", "6": "24px" };
    const padding = noPadding ? 0 : (pClass ? paddingMap[pClass[1]] ?? "20px" : "20px");

    return (
        <div style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #EBEBEB",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            overflow: hasOverflow ? "hidden" : undefined,
            padding,
            ...style,
        }}>
            {children}
        </div>
    );
}
