"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const isSeller = pathname.startsWith("/seller");
  const isKurir  = pathname.startsWith("/courier");
  const isDashboard = isSeller || isKurir; // elemen buyer di-disable

  const initials = user?.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#EBEBEB] shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href={isSeller ? "/seller/dashboard" : "/home"} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1A3C34]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-lg text-[#1A3C34] tracking-tight leading-none">
              PABW Shop
            </span>
            {/* Label konteks di bawah logo */}
            {isSeller && (
              <span className="text-[10px] font-semibold text-[#4DB6AC] tracking-wide uppercase leading-none mt-0.5">
                Seller Center
              </span>
            )}
            {isKurir && (
              <span className="text-[10px] font-semibold text-[#4DB6AC] tracking-wide uppercase leading-none mt-0.5">
                Kurir Panel
              </span>
            )}
          </div>
        </Link>

        {/* Search — hanya tampil di halaman buyer */}
        {!isDashboard && (
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <input
              type="text"
              placeholder="Cari produk impianmu..."
              className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F5F5F5] border-transparent focus:bg-white focus:border-[#1A3C34]/30 focus:ring-2 focus:ring-[#1A3C34]/10 transition-all text-[15px]"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        )}

        {/* Spacer untuk seller/kurir agar avatar tetap di kanan */}
        {isDashboard && <div className="flex-1" />}

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">

          {/* Cart — hanya buyer */}
          {!isDashboard && (
            <Link href="/cart" className="relative p-2 text-[#555] hover:text-[#1A3C34] transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span className="absolute top-1 right-0 bg-[#E65100] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </Link>
          )}

          {/* Notifikasi — hanya seller */}
          {isSeller && mounted && (
            <button className="relative p-2 text-[#555] hover:text-[#1A3C34] transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className="absolute top-1 right-0 bg-[#E65100] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                2
              </span>
            </button>
          )}

          <div className="h-6 w-px bg-[#EBEBEB] hidden sm:block" />

          {/* Avatar */}
          {mounted ? (
            <Link
              href={isSeller ? "/seller/profile" : "/profile"}
              className="flex items-center gap-2.5 hover:bg-[#F9FAFB] p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-[#E5E7EB]"
            >
              <div className="w-8 h-8 rounded-full bg-[#E0F2F1] text-[#1A3C34] flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-semibold text-[#374151] leading-none">
                  {user?.full_name?.split(" ")[0] ?? "User"}
                </span>
                {isSeller && (
                  <span className="text-[10px] text-[#888] leading-none mt-0.5">Seller</span>
                )}
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F5F5F5] animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}