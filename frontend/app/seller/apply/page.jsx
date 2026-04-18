import React from 'react';
import { Navbar } from '@/components/layout/Navbar'; 

export default function SellerApplyPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Pengajuan Penjual (Seller)</h1>
        <p className="text-gray-600">Form untuk mendaftar sebagai penjual.</p>
      </main>
    </div>
  );
}
