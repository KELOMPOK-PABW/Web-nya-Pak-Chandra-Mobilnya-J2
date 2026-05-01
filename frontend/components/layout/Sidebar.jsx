"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "../../services/authService";

export function Sidebar({ menus, title, subtitle }) {
  const pathname = usePathname();

  const defaultMenus = [
    { label: "Dashboard", href: "/seller/dashboard" },
    { label: "Produk", href: "/seller/products" },
    { label: "Pesanan", href: "/seller/orders" },
  ];
  const menuList = menus ?? defaultMenus;

  const [user, setUser] = useState(null);

  useEffect(() => {
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
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#EBEBEB] min-h-[calc(100vh-72px)] py-6 flex flex-col">

      {/* Tampilkan kartu profil jika ada `title` atau `user` (dinamis) */}
      {(title || user) && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-4 border border-[#E8EDE8] mb-2 flex items-center gap-3">
            <div style={{ width:40, height:40 }} className="rounded-full flex items-center justify-center font-bold text-white" >
              <div style={{ width:40, height:40, borderRadius:999, background:"linear-gradient(135deg,#1A3C34,#2D6A5E)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
                {initials ?? (user?.full_name?.slice(0,1) ?? "-")}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#1A1A1A]">{user?.full_name ?? title}</div>
              <div className="text-[11px] text-[#999] mt-1">{subtitle ?? "Seller Center"}</div>
              <div className="inline-flex items-center gap-2 bg-[#E0F5F0] text-[#0F6E56] text-[10px] font-bold px-3 py-1 rounded-full mt-2">Star Seller</div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-[#999] uppercase tracking-wider px-1 mb-2">Menu Utama</div>
        </div>
      )}

      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {menuList.map((menu, idx) => {
          const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
          return (
            <Link
              key={idx}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-[14px] font-medium ${
                isActive
                  ? "bg-[#E0F2F1] text-[#1A3C34]"
                  : "text-[#555] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
              }`}
            >
              <span className={`text-base ${isActive ? "opacity-100" : "opacity-60"}`}>
                {menu.icon}
              </span>
              <span className="flex-1">{menu.label}</span>
              {/* Badge opsional */}
              {menu.badge && (
                <span className="text-[10px] font-bold bg-[#E65100] text-white px-1.5 py-0.5 rounded-full">
                  {menu.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}