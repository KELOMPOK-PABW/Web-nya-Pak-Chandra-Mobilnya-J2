import React from 'react';
import { Navbar } from '@/components/layout/Navbar'; 

export default function CategoryDetailPage({ params }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Produk Kategori: {params?.id || ''}</h1>
      </main>
    </div>
  );
}
