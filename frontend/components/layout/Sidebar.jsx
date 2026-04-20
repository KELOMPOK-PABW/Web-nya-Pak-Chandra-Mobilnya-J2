"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ menus }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#EBEBEB] min-h-[calc(100vh-72px)] py-6">
      <nav className="flex flex-col gap-1 px-4">
        {menus.map((menu, idx) => {
          const isActive = pathname === menu.href || pathname.startsWith(menu.href + "/");
          return (
            <Link 
              key={idx} 
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-[15px] ${
                isActive 
                  ? "bg-[#E0F2F1] text-[#1A3C34]" 
                  : "text-[#555] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
              }`}
            >
              <span className={`${isActive ? "text-[#1A3C34]" : "text-[#888]"}`}>
                {menu.icon}
              </span>
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
