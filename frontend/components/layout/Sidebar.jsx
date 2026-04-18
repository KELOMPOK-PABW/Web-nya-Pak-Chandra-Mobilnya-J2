"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ menus, title, subtitle }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#EBEBEB] min-h-[calc(100vh-72px)] py-6 flex flex-col">

      {/* Header opsional (untuk seller/kurir) */}
      {title && (
        <div className="px-5 mb-4 pb-4 border-b border-[#F3F4F6]">
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-0.5">{subtitle}</p>
          <p className="text-sm font-bold text-[#1A3C34]">{title}</p>
        </div>
      )}

      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {menus.map((menu, idx) => {
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