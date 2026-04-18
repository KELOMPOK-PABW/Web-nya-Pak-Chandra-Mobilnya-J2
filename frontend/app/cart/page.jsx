import React from 'react';
import { Navbar } from '@/components/layout/Navbar'; 
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Keranjang Belanja</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2">
            <Card className="flex items-center justify-center min-h-[300px]">
              <p className="text-gray-500">Keranjang kamu masih kosong</p>
            </Card>
          </div>
          <div className="col-span-1">
            <Card>
              <h2 className="font-bold text-lg mb-4">Ringkasan Belanja</h2>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">Total Harga</span>
                <span className="font-semibold">Rp 0</span>
              </div>
              <Button className="w-full">Beli (0)</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}