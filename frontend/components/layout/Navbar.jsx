"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "../../services/authService";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isSeller    = pathname.startsWith("/seller");
  const isKurir     = pathname.startsWith("/courier");
  const isDashboard = isSeller || isKurir;

  useEffect(() => {
    setMounted(true);
    const u = authService.getUser();
    if (u) setUser(u);
  }, []);

  const [user, setUser] = useState(null);
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n?.[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : undefined;

  return (
    <nav style={{
      background: "#1A3C34",
      padding: "0 24px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: logo + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href={isSeller ? "/seller/dashboard" : "/home"}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <div style={{
            width: 36, height: 36,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              PABW Shop
            </span>
            {(isSeller || isKurir) && (
              <span style={{ color: "#4DB6AC", fontSize: 10, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", marginTop: 2 }}>
                {isSeller ? "Seller Center" : "Kurir Panel"}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Right: actions (cart for buyer, notifications, avatar) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!isDashboard && (
          <Link href="/cart" style={{ position: "relative", padding: 6, color: "rgba(255,255,255,0.9)", display: "flex", borderRadius: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span style={{
              position: "absolute", top: 4, right: 0,
              background: "#FF6B6B", color: "#fff",
              fontSize: 9, fontWeight: 800,
              width: 14, height: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "1.5px solid #1A3C34",
            }}>3</span>
          </Link>
        )}

        <button aria-label="Notifications" style={{
          width: 38, height: 38, borderRadius: 10,
          background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {isSeller && mounted && (
            <span style={{ position: "absolute", marginLeft: 12, marginTop: -16, width: 8, height: 8, borderRadius: "50%", background: "#FF6B6B", border: "1.5px solid #1A3C34" }} />
          )}
        </button>

        {mounted ? (
          <Link
            href={isSeller ? "/seller/profile" : "/profile"}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              textDecoration: "none",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #4DB6AC, #26A69A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>
              {typeof initials !== "undefined" ? initials : (user?.full_name?.slice(0,1) ?? "U")}
            </div>
          </Link>
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        )}
      </div>
    </nav>
  );
}