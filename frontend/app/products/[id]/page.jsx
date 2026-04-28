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
    description: "Sneaker ringan untuk aktivitas harian, nyaman dipakai seharian.",
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
    description: "Tas kulit premium dengan kompartemen rapi dan jahitan kuat.",
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
    description: "Headphone dengan bass mantap, cocok untuk musik dan gaming.",
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
    description: "Blender compact untuk smoothie, hemat ruang dan mudah dibersihkan.",
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
    description: "Jaket tahan angin dan air, cocok untuk perjalanan outdoor.",
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
    description: "Lampu meja minimalis dengan cahaya hangat untuk ruang kerja.",
    accent: "#FCE4EC",
  },
];

const formatPrice = (value) => `Rp ${value.toLocaleString("id-ID")}`;

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id || "";
  const normalizedId = decodeURIComponent(String(rawId)).trim().toLowerCase();
  const altId = normalizedId.replace(/-/g, "_");
  const productById = PRODUCTS.find((item) => {
    const itemId = item.id.toLowerCase();
    return itemId === normalizedId || itemId === altId;
  });
  const indexMatch = /^\d+$/.test(normalizedId) ? Number(normalizedId) - 1 : -1;
  const productByIndex = indexMatch >= 0 ? PRODUCTS[indexMatch] : null;
  const product = productById || productByIndex;

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C34]"
          >
            ← Kembali ke daftar produk
          </Link>
          {product && (
            <div className="text-xs text-[#888]">
              {product.category} • {product.stock} stok
            </div>
          )}
        </div>

        {!product ? (
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 text-center">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Produk tidak ditemukan</h1>
            <p className="text-sm text-[#777] mt-2">Coba kembali ke halaman daftar produk.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <div
                  className="rounded-3xl h-72 flex items-center justify-center text-6xl"
                  style={{ background: product.accent }}
                >
                  📦
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {["#DFF5F1", "#F6EEE5", "#E9ECF9", "#F6E9F1"].map((color, index) => (
                    <div
                      key={color}
                      className="rounded-2xl h-20 flex items-center justify-center text-2xl border border-[#E8E8E8]"
                      style={{ background: color, opacity: index === 0 ? 1 : 0.75 }}
                    >
                      📦
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">{product.name}</h1>
                    <p className="text-sm text-[#777] mt-1">{product.seller}</p>
                  </div>
                  <div className="text-sm text-[#888]">{product.reviews} ulasan</div>
                </div>

                <p className="text-3xl font-bold text-[#1A3C34] mt-4">{formatPrice(product.price)}</p>
                <p className="text-sm text-[#777] mt-3 leading-relaxed">{product.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Rating</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.rating} / 5</p>
                  </div>
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Stok</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.stock} tersedia</p>
                  </div>
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Kategori</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.category}</p>
                  </div>
                  <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] px-4 py-3">
                    <p className="text-xs text-[#888]">Seller</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{product.seller}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <h2 className="text-base font-semibold text-[#1A1A1A]">Ringkasan Pembelian</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Harga</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Estimasi kirim</span>
                    <span className="font-semibold text-[#1A1A1A]">2-3 hari</span>
                  </div>
                  <div className="flex items-center justify-between text-[#777]">
                    <span>Asuransi</span>
                    <span className="font-semibold text-[#1A1A1A]">Termasuk</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <button className="rounded-xl bg-[#1A3C34] text-white text-sm font-semibold py-3 hover:bg-[#16332C] transition-colors">
                    Tambah ke Keranjang
                  </button>
                  <button className="rounded-xl border border-[#E0DDD6] bg-white text-sm font-semibold text-[#1A1A1A] py-3 hover:bg-[#F7F5F1] transition-colors">
                    Simpan
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                <h3 className="text-base font-semibold text-[#1A1A1A]">Highlight</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#777]">
                  <li>• Garansi 7 hari pengembalian</li>
                  <li>• Pengiriman cepat seluruh Indonesia</li>
                  <li>• Produk asli dari seller terverifikasi</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
