"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartContext } from "../CartContext";
import { Home, Tag, Sparkles, ShoppingCart, User } from "lucide-react";

const TABS = [
  { href: "/home",     icon: Home,         label: "Beranda"   },
  { href: "/products", icon: Tag,          label: "Produk"    },
  { href: "/chat",     icon: Sparkles,     label: "AI", isFab: true },
  { href: "/cart",     icon: ShoppingCart, label: "Keranjang", isCart: true },
  { href: "/profile",  icon: User,         label: "Profil"    },
];

export function BottomBar() {
  const pathname = usePathname();
  const { cartCount } = useCartContext();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // ── hide on scroll down, show on scroll up ──
  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const current = window.scrollY;
        if (current > lastScrollY.current && current > 60) {
          setVisible(false);
        } else if (current < lastScrollY.current) {
          setVisible(true);
        }
        lastScrollY.current = current;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── hide on dashboard/auth pages ──
  if (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/courier") ||
    pathname.startsWith("/admin")    ||
    pathname.startsWith("/auth")
  ) return null;

  return (
    <>
      {/* spacer — preserves scroll position under the fixed bar */}
      <div className="md:hidden" style={{ height: 72 }} />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden select-none"
        style={{
          background: "#0D2B26",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around px-2" style={{ height: 64 }}>
          {TABS.map(({ href, icon: Icon, label, isFab, isCart }) => {
            const isActive = pathname === href || (href !== "/home" && pathname.startsWith(href + "/"));

            // ── AI FAB (center, elevated) ──
            if (isFab) {
              const fabActive = pathname.startsWith("/chat");
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center no-underline"
                  style={{ marginTop: -16 }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: fabActive
                        ? "linear-gradient(135deg, #4DB6AC, #26A69A)"
                        : "linear-gradient(135deg, #4DB6AC, #2D6A5E)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: fabActive
                        ? "0 4px 20px rgba(77,182,172,0.45)"
                        : "0 4px 14px rgba(77,182,172,0.25)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Icon size={24} color="white" strokeWidth={2} />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: fabActive ? "#4DB6AC" : "rgba(255,255,255,0.5)",
                      marginTop: 4,
                      letterSpacing: "0.3px",
                    }}
                  >
                    AI
                  </span>
                </Link>
              );
            }

            // ── regular tab ──
            const color = isActive ? "#4DB6AC" : "rgba(255,255,255,0.35)";

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 no-underline transition-all duration-150"
                style={{
                  color,
                  padding: "4px 10px",
                  borderRadius: 12,
                  minWidth: 56,
                }}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                  {isCart && cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -7,
                        background: "#FF6B6B",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        width: 17,
                        height: 17,
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
                </div>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
