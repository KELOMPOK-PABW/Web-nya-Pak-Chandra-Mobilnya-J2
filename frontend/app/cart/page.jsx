"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const initialItems = [
  {
    id: 1,
    name: "Kaos Basic Premium",
    variant: "Navy - L",
    image: "/images/cart/kaos.svg",
    price: 129000,
    qty: 1,
  },
  {
    id: 2,
    name: "Sepatu Casual Urban",
    variant: "White - 42",
    image: "/images/cart/sepatu.svg",
    price: 349000,
    qty: 2,
  },
  {
    id: 3,
    name: "Tas Sling Bag Everyday",
    variant: "Black",
    image: "/images/cart/tas.svg",
    price: 189000,
    qty: 1,
  },
];

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CartPage() {
  const [items, setItems] = useState(initialItems);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );
  const shipping = items.length > 0 ? 15000 : 0;
  const total = subtotal + shipping;
  const totalQty = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const updateQty = (id, diff) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, qty: Math.max(1, item.qty + diff) };
      })
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <Card className="flex items-center justify-center min-h-75">
                <p className="text-gray-500">Keranjang kamu masih kosong</p>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={88}
                        height={88}
                        className="w-22 h-22 rounded-xl border border-[#E5E7EB] object-cover"
                      />
                      <div>
                        <h2 className="text-lg font-bold text-[#111827]">{item.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">Varian: {item.variant}</p>
                        <p className="font-semibold text-[#1A3C34] mt-2">{formatRupiah(item.price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="w-9 h-9 text-lg text-[#374151] hover:bg-[#F9FAFB]"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-[#111827]">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="w-9 h-9 text-lg text-[#374151] hover:bg-[#F9FAFB]"
                        >
                          +
                        </button>
                      </div>

                      <Button size="sm" variant="danger" type="button" onClick={() => removeItem(item.id)}>
                        Hapus
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="font-bold text-[#0A0A0A] text-lg mb-4">Ringkasan Belanja</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#0A0A0A]">Total Item</span>
                  <span className="font-semibold text-[#0A0A0A]">{totalQty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0A0A0A]">Subtotal</span>
                  <span className="font-semibold text-[#0A0A0A]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0A0A0A]">Ongkir</span>
                  <span className="font-semibold text-[#0A0A0A]">{formatRupiah(shipping)}</span>
                </div>
              </div>

              <div className="border-t border-[#ECEFF3] my-4" />

              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-[#111827]">Total Harga</span>
                <span className="text-lg font-bold text-[#0A0A0A]">{formatRupiah(total)}</span>
              </div>

              <Button className="w-full" disabled={items.length === 0}>
                Beli ({totalQty})
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}