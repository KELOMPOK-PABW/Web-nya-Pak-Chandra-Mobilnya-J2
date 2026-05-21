# Web Pak Chandra — Mobilnya J2

Aplikasi e-commerce berbasis web untuk jual–beli kebutuhan sehari-hari (pakaian, sepatu, sabun, dan barang-barang lain). Dilengkapi fitur **chat berbasis LLM Gemini** untuk membantu pengguna mencari produk, menambahkan ke keranjang, melakukan checkout, pembayaran, hingga pelacakan pesanan.

Proyek ini dikerjakan sebagai tugas mata kuliah **PABW (Perancangan dan Analisis Berbasis Web)**.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Cara Menjalankan](#cara-menjalankan)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Endpoint API](#endpoint-api)
- [Dokumentasi Tambahan](#dokumentasi-tambahan)
- [Kontributor](#kontributor)

---

## Tech Stack

**Backend**
- Node.js + Express 5
- Prisma ORM 6 + MySQL 8 (driver `mysql2`)
- Autentikasi: JSON Web Token (JWT) + bcrypt
- Validasi: Joi
- Pengujian: Jest

**Frontend**
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4

**LLM / AI**
- Google Gemini API (digunakan pada branch `feat/chat-llm-gemini` untuk fitur chat)

---

## Struktur Folder

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi aplikasi
│   │   ├── controller/      # Handler request (auth, product, cart, dst.)
│   │   ├── middleware/      # Middleware (cth. authMiddleware untuk JWT)
│   │   ├── repository/      # Lapisan akses data (Prisma)
│   │   ├── routes/          # Definisi route Express
│   │   ├── services/        # Logika bisnis
│   │   ├── validations/     # Skema validasi Joi
│   │   └── index.js         # Entry point server
│   ├── prisma/              # schema.prisma & client Prisma
│   ├── docs/                # Dokumentasi tambahan (lihat bagian bawah)
│   ├── __tests__/           # Unit test Jest
│   ├── database/            # Skrip SQL pendukung
│   └── package.json
│
├── frontend/
│   ├── app/                 # Halaman Next.js (home, products, cart,
│   │                        #   checkout, orders, payment, wallet,
│   │                        #   admin, seller, courier, profile, dst.)
│   ├── components/          # Komponen UI yang dapat dipakai ulang
│   ├── services/            # Integrasi ke API backend
│   ├── public/              # Aset statis
│   └── package.json
│
├── prisma/
│   └── migrations/          # Riwayat migrasi database
│
└── README.md                # File ini
```

---

## Cara Menjalankan

### Prasyarat

- Node.js 18+
- MySQL 8 yang berjalan secara lokal (atau remote)
- npm

### 1. Backend

```bash
cd backend
npm install

# Jalankan migrasi Prisma (sekali saja saat pertama setup)
npx prisma migrate dev

# Jalankan server pengembangan
npm run dev
```

Script lain yang tersedia di `backend/package.json`:

| Script        | Fungsi                                             |
|---------------|----------------------------------------------------|
| `npm run dev` | Menjalankan server dengan nodemon (auto-reload)    |
| `npm start`   | Menjalankan server produksi                        |
| `npm test`    | Menjalankan unit test Jest                         |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Script lain:

| Script           | Fungsi                                  |
|------------------|-----------------------------------------|
| `npm run dev`    | Mode pengembangan                       |
| `npm run build`  | Build produksi                          |
| `npm run start`  | Menjalankan hasil build                 |

---

## Variabel Lingkungan

Buat file `.env` di dalam folder `backend/` dengan isi:

```env
# Koneksi database MySQL untuk Prisma
DATABASE_URL="mysql://<user>:<password>@localhost:3306/pabw"

# Kunci API Google Gemini — hanya diperlukan untuk fitur chat LLM
# (branch feat/chat-llm-gemini)
GEMINI_API_KEY="<masukkan-api-key-gemini>"
```

> Pastikan database `pabw` sudah dibuat di MySQL sebelum menjalankan migrasi Prisma.

---

## Endpoint API

Seluruh endpoint berada di bawah prefix yang ditentukan di `backend/src/index.js`. Endpoint yang ditandai 🔒 memerlukan header `Authorization: Bearer <token>`.

| Resource    | Method & Path (ringkas)              | Auth | Keterangan                                   |
|-------------|--------------------------------------|------|----------------------------------------------|
| Auth        | `POST /auth/register`, `/login`, `/logout` | —   | Registrasi, login, logout pengguna           |
| Users       | `GET /users/...`                     | v   | Profil & data pengguna                       |
| Products    | `GET /products`, `POST /products`    | v\* | Browse publik, create oleh seller            |
| Categories  | `GET /categories`                    | —    | Daftar kategori produk                       |
| Cart        | `GET/POST /cart`                     | v   | Manajemen keranjang belanja                  |
| Checkout    | `POST /checkout`                     | v   | Membuat order dari isi keranjang             |
| Payments    | `POST /payments`                     | v   | Pembayaran via e-wallet                      |
| Wallet      | `GET /wallet`                        | v   | Saldo & riwayat transaksi e-wallet           |
| Seller      | `GET /seller/...`                    | v   | Dashboard & manajemen produk seller          |
| Reviews     | `GET/POST /reviews`                  | v   | Ulasan & rating produk                       |

\* GET publik, POST/PUT/DELETE memerlukan autentikasi seller.

Detail lengkap dapat dilihat pada file route di `backend/src/routes/` (`authRoutes.js`, `productRoutes.js`, `cartRoutes.js`, `checkoutRoutes.js`, `paymentRoutes.js`, `walletRoutes.js`, `sellerRoutes.js`, `reviewRoutes.js`, `categoryRoutes.js`, `usersRoutes.js`).

---

## Dokumentasi Tambahan

Dokumentasi pendukung disimpan di folder [`backend/docs/`](./backend/docs/).

### `intent-entity.json`

Berkas ini berisi spesifikasi **NLU (Natural Language Understanding)** yang digunakan sebagai panduan prompt untuk model Gemini pada fitur chat. Spesifikasi ini mendefinisikan 5 intent utama beserta entitas dan contoh kalimat dalam bahasa Indonesia:

| Intent           | Deskripsi                                                          |
|------------------|--------------------------------------------------------------------|
| `search_product` | Pengguna mencari atau menelusuri produk                            |
| `add_to_cart`    | Pengguna menambahkan/menghapus/mengubah item di keranjang          |
| `checkout`       | Pengguna melanjutkan ke proses checkout                            |
| `payment`        | Pengguna melakukan atau memeriksa status pembayaran                |
| `track_order`    | Pengguna melacak status pengiriman pesanan                         |

Setiap intent mencantumkan daftar entitas seperti `product`, `color`, `price`, `order_id`, `payment_method`, dan `address`, lengkap dengan contoh nilainya. File ini menjadi referensi saat memperluas atau menyetel ulang prompt Gemini di backend.

> Jika menambahkan dokumentasi baru (misal: ER-diagram, flow pembayaran, spesifikasi API rinci), simpan di folder `backend/docs/` dan tambahkan ringkasannya di bagian ini.

---

## Kontributor

