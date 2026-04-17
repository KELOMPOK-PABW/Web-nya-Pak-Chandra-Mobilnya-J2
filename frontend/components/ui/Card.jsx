import React from "react";

export function Card({ children, className = "", noPadding = false }) {
  return (
    <div
      className={`bg-white rounded-3xl ${noPadding ? "" : "p-6 sm:p-8"} ${className}`}
      style={{
        boxShadow: "0 4px 28px rgba(0,0,0,0.06)",
        border: "1px solid #F0F0F0",
      }}
    >
      {children}
    </div>
  );
}
