import React from 'react';
import { Navbar } from '@/components/layout/Navbar'; 
import { Sidebar } from '@/components/layout/Sidebar';

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar menus={[
          { label: "Dashboard", href: "/seller/dashboard", icon: "📊" },
          { label: "Produk", href: "/seller/products", icon: "📦" },
          { label: "Pesanan", href: "/seller/orders", icon: "🛒" },
          { label: "Toko Saya", href: "/stores/me", icon: "🏬" },
          { label: "Status Pengajuan", href: "/seller/application", icon: "📄" },
        ]} />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Dashboard Seller</h1>
          <p className="text-gray-600">Routing terkonfigurasi; komponen shared siap pakai.</p>
        </main>
      </div>
    </div>
  );
}
