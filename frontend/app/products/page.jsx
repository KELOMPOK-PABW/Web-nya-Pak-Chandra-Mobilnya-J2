import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const PRODUCTS = [
  {
    id: "prd_101",
    name: "Sneaker Harian",
    price: 249000,
    category: "Fashion",
    rating: 4.8,
    reviews: 128,
    stock: 24,
    seller: "Toko Sporty",
    accent: "#E0F2F1",
  },
  {
    id: "prd_102",
    name: "Tas Kulit Klasik",
    price: 389000,
    category: "Fashion",
    rating: 4.6,
    reviews: 74,
    stock: 12,
    seller: "Leather Hub",
    accent: "#FFF3E0",
  },
  {
    id: "prd_103",
    name: "Headphone Bass",
    price: 499000,
    category: "Gadget",
    rating: 4.7,
    reviews: 203,
    stock: 31,
    seller: "Audio Pro",
    accent: "#E8EAF6",
  },
  {
    id: "prd_104",
    name: "Blender Mini",
    price: 229000,
    category: "Rumah",
    rating: 4.5,
    reviews: 56,
    stock: 18,
    seller: "Dapur Fresh",
    accent: "#F1F8E9",
  },
  {
    id: "prd_105",
    name: "Jaket Outdoor",
    price: 559000,
    category: "Fashion",
    rating: 4.9,
    reviews: 91,
    stock: 7,
    seller: "Urban Trek",
    accent: "#E3F2FD",
  },
  {
    id: "prd_106",
    name: "Lampu Meja",
    price: 159000,
    category: "Rumah",
    rating: 4.4,
    reviews: 42,
    stock: 40,
    seller: "Homey",
    accent: "#FCE4EC",
  },
];

const formatPrice = (value) => `Rp ${value.toLocaleString("id-ID")}`;

export default function ProductsListPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Daftar Produk</h1>
            <p className="text-sm text-[#777]">Temukan produk pilihan dengan harga terbaik.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#E0DDD6] bg-white px-4 py-2 text-sm text-[#777]">
              {PRODUCTS.length} produk
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white border border-[#E8E8E8] rounded-2xl p-5 flex flex-col">
              <div
                className="rounded-2xl h-40 flex items-center justify-center text-3xl"
                style={{ background: product.accent }}
              >
                📦
              </div>
              <div className="mt-4 flex-1">
                <div className="flex items-center justify-between text-xs text-[#888]">
                  <span className="px-2 py-1 rounded-full bg-[#FAFAF8] border border-[#E5E2DB]">
                    {product.category}
                  </span>
                  <span>{product.stock} stok</span>
                </div>
                <h2 className="text-base font-semibold text-[#1A1A1A] mt-3">{product.name}</h2>
                <p className="text-sm text-[#777] mt-1">{product.seller}</p>
                <p className="text-lg font-bold text-[#1A3C34] mt-3">{formatPrice(product.price)}</p>
                <p className="text-xs text-[#888] mt-1">Rating {product.rating} ({product.reviews} ulasan)</p>
              </div>
              <Link
                href={`/products/${product.id}`}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-2.5 hover:bg-[#16332C] transition-colors"
              >
                Lihat Detail
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
