import React from 'react';
import { Navbar } from '@/components/layout/Navbar'; 

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">E-Wallet</h1>
        <p className="text-gray-600">Routing terkonfigurasi; komponen shared siap pakai.</p>
      </main>
    </div>
  );
}
