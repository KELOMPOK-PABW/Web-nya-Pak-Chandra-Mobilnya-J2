"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import { useCartContext } from "../CartContext";
import {
  ShoppingBag, MessageSquare, ShoppingCart, Bell, Search,
} from "lucide-react";

export function Navbar({ onSearchOpen }) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const { cartCount } = useCartContext();
  const router = useRouter();
  const pathname = usePathname();

  const isSeller    = pathname.startsWith("/seller");
  const isKurir     = pathname.startsWith("/courier");
  const isDashboard = isSeller || isKurir;

  useEffect(() => {
    setMounted(true);
    const u = authService.getUser();
    if (u) setUser(u);
  }, []);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n?.[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : undefined;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "#0D2B26",
        padding: "0 20px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
      }}
    >
      {/* ── Left: logo ── */}
      <Link
        href={isSeller ? "/seller/dashboard" : isKurir ? "/courier/dashboard" : "/home"}
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingBag size={17} color="white" strokeWidth={2} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.2px" }}>
            {isSeller ? "PABW" : "PABW Shop"}
          </span>
          {isDashboard && (
            <span
              style={{
                color: "#4DB6AC",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {isSeller ? "Seller Center" : "Kurir Panel"}
            </span>
          )}
        </div>
      </Link>

      {/* ── Right: actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Search icon — opens mobile search panel on home page, or navigates there */}
        {!isDashboard && (
          <button
            onClick={() => {
              if (onSearchOpen) {
                onSearchOpen();
              } else {
                router.push("/home");
              }
            }}
            style={{
              width: 40,
              height: 40,
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            aria-label="Cari produk"
          >
            <Search size={20} strokeWidth={1.8} />
          </button>
        )}

        {/* Chat — desktop only (moved to bottom bar on mobile) */}
        {!isDashboard && (
          <Link
            href="/chat"
            title="AI Shopping Assistant"
            className="hidden md:flex"
            style={{ padding: 6, color: "rgba(255,255,255,0.8)", borderRadius: 8 }}
          >
            <MessageSquare size={20} strokeWidth={1.8} />
          </Link>
        )}

        {/* Cart — always visible */}
        {!isDashboard && (
          <Link
            href="/cart"
            style={{
              position: "relative",
              padding: 6,
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              borderRadius: 8,
            }}
          >
            <ShoppingCart size={20} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  right: 1,
                  background: "#FF6B6B",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  width: 15,
                  height: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: "1.5px solid #0D2B26",
                  lineHeight: 1,
                }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        )}

        {/* Notification bell — seller/kurir only, with real badge */}
        {isDashboard && (
          <button
            aria-label="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Bell size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            {mounted && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FF6B6B",
                  border: "1.5px solid #0D2B26",
                }}
              />
            )}
          </button>
        )}

        {/* Profile avatar */}
        {mounted ? (
          <Link
            href={isSeller ? "/seller/profile" : "/profile"}
            style={{ display: "flex", textDecoration: "none", flexShrink: 0 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4DB6AC, #26A69A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {typeof initials !== "undefined" ? initials : (user?.full_name?.slice(0, 1) ?? "U")}
            </div>
          </Link>
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </nav>
  );
}
