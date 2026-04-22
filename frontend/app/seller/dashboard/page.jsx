import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// Data dummy untuk development
const STATS = [
  { label: "Pesanan Hari Ini", value: "Rp 0", sub: "Januari 2025 · Rp 4.351.693"},
  { label: "Pembayaran Gift Card", value: "Rp 0", sub: "Januari 2025 · Rp 4.351.693"},
  { label: "Stok Produk", value: "6.262", sub: "Stok saat ini"},
  { label: "Nilai Stok", value: "Rp 4,3 jt", sub: "Ekskl. PPN"},
];

const ORDERS = [
  { id: "#ORD-0021", buyer: "Andi S.", product: "Sneaker Pro", total: "Rp 249.000", status: "Selesai" },
  { id: "#ORD-0020", buyer: "Budi R.", product: "Tas Kulit", total: "Rp 389.000", status: "Diproses" },
  { id: "#ORD-0019", buyer: "Citra M.", product: "Jaket Hoodie", total: "Rp 185.000", status: "Selesai" },
  { id: "#ORD-0018", buyer: "Dian P.", product: "Sepatu Slip", total: "Rp 210.000", status: "Dikirim" },
  { id: "#ORD-0017", buyer: "Eko W.", product: "Kaos Polos", total: "Rp 79.000", status: "Dibatalkan" },
];

const statusStyle = {
  Selesai:    "bg-[#E0F2F1] text-[#0F6E56]",
  Diproses:   "bg-[#FFF3E0] text-[#E65100]",
  Dikirim:    "bg-[#FFF3E0] text-[#E65100]",
  Dibatalkan: "bg-[#FEF2F2] text-[#DC2626]",
};

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] w-full mx-auto">
        <Sidebar
            title="Toko Saya"
            subtitle="Seller Center"
            menus={[
              { label: "Dashboard",  href: "/seller/dashboard"},
              { label: "Produk",     href: "/seller/products"},
              { label: "Pesanan",    href: "/seller/orders"},
            ]}
          />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Halo Dev Seller, selamat datang kembali!</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-[#EBEBEB]">
                <p className="text-sm font-bold text-[#1A3C34] mb-1">
                  {s.label}
                </p>
                
                <p className="text-xl font-bold text-[#1A1A1A]">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabel Pesanan */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] p-5">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Pesanan Terbaru</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {["ID Pesanan","Pembeli","Produk","Total","Status"].map(h => (
                    <th key={h} className="text-left text-gray-400 font-medium pb-2 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-[#F9FAFB]">
                    <td className="py-2.5 px-2 text-[#1A3C34] font-medium">{o.id}</td>
                    <td className="py-2.5 px-2 text-gray-600">{o.buyer}</td>
                    <td className="py-2.5 px-2 text-gray-600">{o.product}</td>
                    <td className="py-2.5 px-2 font-semibold text-[#1A1A1A]">{o.total}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyle[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}