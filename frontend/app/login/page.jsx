"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(form);
      authService.saveSession(data);
      const role = data.role;
      if (role === "seller") router.push("/seller/dashboard");
      else if (role === "kurir") router.push("/courier/tasks");
      else router.push("/home");
    } catch (err) {
      setError(err.message || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f5f5f5", fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes bobCard {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .fade-up  { animation: fadeUp  0.55s ease both; }
        .fade-up2 { animation: fadeUp  0.55s 0.1s ease both; }
        .float-a  { animation: floatA  5s   ease-in-out infinite; }
        .float-b  { animation: floatB  3.8s ease-in-out infinite; }
        .bob-card { animation: bobCard 4.5s ease-in-out infinite; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #EBEBEB" }} className="w-full flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1A3C34" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "18px", color: "#1A3C34", letterSpacing: "-0.3px" }}>
            PABW Shop
          </span>
        </div>
        <p style={{ fontFamily: "inherit", fontSize: "13px", color: "#888", margin: 0 }}>
          Butuh bantuan?{" "}
          <span style={{ color: "#1A3C34", fontWeight: 600, cursor: "pointer" }}>Hubungi Kami</span>
        </p>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full flex items-center justify-center gap-12 lg:gap-16" style={{ maxWidth: "1280px" }}>

          {/* ══ LEFT — Illustration ══ */}
          <div className="hidden lg:flex flex-col items-center flex-1 relative fade-up2">
            <div className="relative" style={{ zIndex: 1, width: "560px", height: "520px" }}>
              <svg width="560" height="520" viewBox="0 0 560 520" fill="none" xmlns="http://www.w3.org/2000/svg">

                {/* Blob background */}
                <path
                  d="M100 90 C35 125 -10 245 35 365 C80 485 235 568 385 550 C535 532 628 418 612 278 C596 138 492 22 348 6 C204 -10 165 55 100 90Z"
                  fill="#E0F2F1" fillOpacity="0.75"
                />

                {/* Ground shadow */}
                <ellipse cx="280" cy="492" rx="215" ry="16" fill="#A5D6D0" fillOpacity="0.4"/>

                {/* ─── FLOATING PRODUCT CARD (top-left) ─── */}
                <g className="bob-card" style={{ transformOrigin: "95px 155px" }}>
                  <rect x="28" y="80" width="134" height="158" rx="16" fill="white" stroke="#EBEBEB" strokeWidth="1.5"/>
                  <rect x="40" y="92" width="110" height="84" rx="10" fill="#FFF3E0"/>
                  <ellipse cx="95" cy="148" rx="36" ry="14" fill="#FFB74D" fillOpacity="0.4"/>
                  <path d="M62 143 Q72 118 95 122 Q118 118 128 143 Q118 152 95 153 Q72 152 62 143Z" fill="#FF8F00"/>
                  <path d="M70 140 Q80 125 95 128 Q110 125 120 140" fill="#FFA726" stroke="none"/>
                  <path d="M65 143 Q75 133 95 135 Q115 133 125 143" fill="white" fillOpacity="0.25" stroke="none"/>
                  <rect x="67" y="147" width="56" height="7" rx="3" fill="#E65100"/>
                  <line x1="80" y1="135" x2="88" y2="141" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="95" y1="132" x2="95" y2="140" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="110" y1="135" x2="102" y2="141" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <text x="42" y="192" style={{ fontSize: "9px", fill: "#F59E0B" }}>★★★★★</text>
                  <rect x="42" y="197" width="68" height="7" rx="3" fill="#E5E7EB"/>
                  <text x="42" y="226" style={{ fontSize: "13px", fontWeight: 700, fill: "#1A3C34", fontFamily: "DM Sans" }}>Rp 249k</text>
                  <rect x="104" y="214" width="28" height="18" rx="9" fill="#1A3C34"/>
                  <text x="118" y="227" textAnchor="middle" style={{ fontSize: "15px", fill: "white" }}>+</text>
                </g>

                {/* ─── FLOATING REVIEW CARD (bottom-left) ─── */}
                <g className="float-b" style={{ transformOrigin: "90px 400px" }}>
                  <rect x="16" y="358" width="148" height="66" rx="14" fill="white" stroke="#EBEBEB" strokeWidth="1.5"/>
                  <circle cx="40" cy="376" r="13" fill="#DBEAFE"/>
                  <circle cx="40" cy="372" r="5" fill="#93C5FD"/>
                  <path d="M29 387 Q40 381 51 387" fill="#BFDBFE" stroke="none"/>
                  <text x="40" y="401" textAnchor="middle" style={{ fontSize: "8px", fill: "#3B82F6", fontFamily: "DM Sans", fontWeight: 600 }}>Budi</text>
                  <text x="62" y="374" style={{ fontSize: "8px", fill: "#F59E0B" }}>★★★★★</text>
                  <rect x="62" y="378" width="86" height="6" rx="3" fill="#F3F4F6"/>
                  <rect x="62" y="388" width="68" height="6" rx="3" fill="#F3F4F6"/>
                  <rect x="62" y="398" width="50" height="6" rx="3" fill="#F3F4F6"/>
                  <rect x="16" y="414" width="148" height="1" rx="1" fill="#F3F4F6"/>
                </g>

                {/* ─── MAIN PHONE MOCKUP (center) ─── */}
                <rect x="172" y="62" width="216" height="410" rx="32" fill="#1A3C34"/>
                <rect x="176" y="66" width="208" height="402" rx="29" fill="white"/>
                {/* notch */}
                <rect x="234" y="66" width="92" height="18" rx="9" fill="#1A3C34"/>
                {/* header bar */}
                <rect x="176" y="84" width="208" height="36" fill="#1A3C34"/>
                <text x="280" y="107" textAnchor="middle" style={{ fontSize: "12px", fontWeight: 700, fill: "white", fontFamily: "DM Sans" }}>PABW Shop</text>
                {/* search bar */}
                <rect x="190" y="128" width="180" height="22" rx="11" fill="#F5F5F5"/>
                <text x="203" y="143" style={{ fontSize: "9px", fill: "#BDBDBD", fontFamily: "DM Sans" }}>Cari produk...</text>
                {/* banner */}
                <rect x="190" y="158" width="180" height="68" rx="10" fill="#FFF8E1"/>
                <text x="202" y="178" style={{ fontSize: "10px", fontWeight: 700, fill: "#E65100", fontFamily: "DM Sans" }}>Promo Hari Ini!</text>
                <text x="202" y="192" style={{ fontSize: "8px", fill: "#795548", fontFamily: "DM Sans" }}>Diskon hingga 70%</text>
                <text x="202" y="204" style={{ fontSize: "8px", fill: "#795548", fontFamily: "DM Sans" }}>untuk semua kategori</text>
                <rect x="202" y="210" width="48" height="11" rx="5" fill="#FF8F00"/>
                <text x="226" y="219" textAnchor="middle" style={{ fontSize: "7px", fontWeight: 700, fill: "white", fontFamily: "DM Sans" }}>Belanja kini</text>
                <circle cx="335" cy="190" r="28" fill="#FFB74D" fillOpacity="0.3"/>
                <circle cx="335" cy="184" r="20" fill="#FFA726" fillOpacity="0.5"/>
                <text x="335" y="190" textAnchor="middle" style={{ fontSize: "20px" }}>🛍</text>
                {/* categories */}
                <text x="190" y="245" style={{ fontSize: "9px", fontWeight: 700, fill: "#374151", fontFamily: "DM Sans" }}>Kategori</text>
                {[
                  { x: 190, emoji: "👟", label: "Fashion" },
                  { x: 234, emoji: "📱", label: "Gadget" },
                  { x: 278, emoji: "🏠", label: "Rumah" },
                  { x: 322, emoji: "🍔", label: "Makanan" },
                ].map((c) => (
                  <g key={c.x}>
                    <rect x={c.x} y="250" width="36" height="36" rx="10" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1"/>
                    <text x={c.x + 18} y="273" textAnchor="middle" style={{ fontSize: "14px" }}>{c.emoji}</text>
                    <text x={c.x + 18} y="298" textAnchor="middle" style={{ fontSize: "7px", fill: "#6B7280", fontFamily: "DM Sans" }}>{c.label}</text>
                  </g>
                ))}
                {/* product grid */}
                <text x="190" y="318" style={{ fontSize: "9px", fontWeight: 700, fill: "#374151", fontFamily: "DM Sans" }}>Produk Populer</text>
                {[
                  { x: 190, color: "#DBEAFE", accent: "#3B82F6", emoji: "👟", name: "Sneaker", price: "249k" },
                  { x: 278, color: "#FCE7F3", accent: "#EC4899", emoji: "👜", name: "Tas Kulit", price: "389k" },
                ].map((p) => (
                  <g key={p.x}>
                    <rect x={p.x} y="322" width="80" height="100" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
                    <rect x={p.x + 4} y="326" width="72" height="56" rx="7" fill={p.color}/>
                    <text x={p.x + 40} y="360" textAnchor="middle" style={{ fontSize: "22px" }}>{p.emoji}</text>
                    <text x={p.x + 8} y="395" style={{ fontSize: "8px", fontWeight: 600, fill: "#374151", fontFamily: "DM Sans" }}>{p.name}</text>
                    <text x={p.x + 8} y="407" style={{ fontSize: "8px", fontWeight: 700, fill: "#1A3C34", fontFamily: "DM Sans" }}>Rp {p.price}</text>
                    <rect x={p.x + 56} y="398" width="18" height="12" rx="6" fill={p.accent}/>
                    <text x={p.x + 65} y="408" textAnchor="middle" style={{ fontSize: "11px", fill: "white" }}>+</text>
                  </g>
                ))}
                {/* bottom nav */}
                <rect x="176" y="434" width="208" height="34" fill="#FAFAFA"/>
                {["🏠","🔍","🛒","👤"].map((icon, i) => (
                  <text key={i} x={200 + i * 52} y="457" textAnchor="middle" style={{ fontSize: "14px", opacity: i === 0 ? 1 : 0.4 }}>{icon}</text>
                ))}
                <rect x="253" y="461" width="54" height="4" rx="2" fill="#D1D5DB"/>

                {/* ─── FLOATING NOTIFICATION (top-right) ─── */}
                <g className="float-a" style={{ transformOrigin: "430px 110px" }}>
                  <rect x="362" y="76" width="162" height="52" rx="14" fill="white" stroke="#EBEBEB" strokeWidth="1.5"/>
                  <rect x="374" y="88" width="28" height="28" rx="8" fill="#DCFCE7"/>
                  <text x="388" y="107" textAnchor="middle" style={{ fontSize: "15px" }}>✅</text>
                  <text x="412" y="99" style={{ fontSize: "10px", fontWeight: 700, fill: "#16A34A", fontFamily: "DM Sans" }}>Pesanan Dikirim!</text>
                  <text x="412" y="112" style={{ fontSize: "9px", fill: "#6B7280", fontFamily: "DM Sans" }}>Estimasi tiba 2 hari</text>
                </g>

                {/* ─── FLOATING STATS CARD (right) ─── */}
                <g className="float-b" style={{ transformOrigin: "432px 290px" }}>
                  <rect x="392" y="240" width="140" height="98" rx="16" fill="white" stroke="#EBEBEB" strokeWidth="1.5"/>
                  <text x="406" y="262" style={{ fontSize: "10px", fontWeight: 700, fill: "#374151", fontFamily: "DM Sans" }}>Hemat bulan ini</text>
                  <text x="406" y="283" style={{ fontSize: "20px", fontWeight: 800, fill: "#1A3C34", fontFamily: "DM Sans" }}>Rp 1,2jt</text>
                  {[18, 30, 22, 38, 26, 44, 34].map((h, i) => (
                    <rect key={i} x={406 + i * 16} y={320 - h} width="10" height={h} rx="4"
                      fill={i === 5 ? "#1A3C34" : "#D1FAE5"}/>
                  ))}
                </g>

                {/* ─── PARACHUTE DELIVERY (right, lower) ─── */}
                <g className="float-a" style={{ transformOrigin: "470px 395px" }}>
                  <ellipse cx="470" cy="366" rx="30" ry="18" fill="#4DB6AC" fillOpacity="0.9"/>
                  <path d="M443 369 Q470 336 497 369" stroke="#4DB6AC" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <line x1="450" y1="368" x2="456" y2="392" stroke="#4DB6AC" strokeWidth="2"/>
                  <line x1="490" y1="368" x2="484" y2="392" stroke="#4DB6AC" strokeWidth="2"/>
                  <rect x="454" y="392" width="32" height="24" rx="5" fill="#FF8F00"/>
                  <text x="470" y="408" textAnchor="middle" style={{ fontSize: "12px" }}>📦</text>
                </g>

                {/* Sparkles & dots */}
                <path d="M148 220 L151 210 L154 220 L164 223 L154 226 L151 236 L148 226 L138 223Z" fill="#FDD835" fillOpacity="0.85"/>
                <path d="M400 170 L402 163 L404 170 L411 173 L404 176 L402 183 L400 176 L393 173Z" fill="#FDD835" fillOpacity="0.7"/>
                <circle cx="148" cy="320" r="7" fill="#80CBC4" fillOpacity="0.6"/>
                <circle cx="400" cy="440" r="5" fill="#FFA726" fillOpacity="0.7"/>
                <circle cx="138" cy="420" r="4" fill="#EF9A9A" fillOpacity="0.8"/>
              </svg>
            </div>

            {/* Caption */}
            <div style={{ marginTop: "-8px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "inherit", fontSize: "26px", fontWeight: 700, color: "#1A3C34", margin: "0 0 8px 0", letterSpacing: "-0.3px", lineHeight: 1.3 }}>
                Belanja lebih mudah,<br/>lebih hemat, lebih cepat.
              </h2>
              <p style={{ fontFamily: "inherit", fontSize: "15px", color: "#777", margin: 0, lineHeight: 1.65 }}>
                Jutaan produk tersedia untukmu. Masuk dan nikmati<br/>pengalaman belanja terbaik bersama PABW Shop.
              </p>

              {/* Trust badges */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "20px" }}>
                {[
                ].map((b) => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", borderRadius: "999px", padding: "6px 14px", border: "1px solid #EBEBEB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <span style={{ fontSize: "14px" }}>{b.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", fontFamily: "inherit" }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT — Form Card ══ */}
          <div className="w-full lg:flex-shrink-0 fade-up" style={{ maxWidth: "480px" }}>
            <div
              className="bg-white rounded-3xl px-11 py-10"
              style={{ boxShadow: "0 4px 28px rgba(0,0,0,0.09)", border: "1px solid #E8E8E8" }}
            >
              {/* Mobile logo */}
              <div className="lg:hidden mb-7 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1A3C34" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "18px", color: "#1A3C34" }}>PABW Shop</span>
              </div>

              {/* Heading */}
              <div className="mb-7">
                <h1 style={{ fontFamily: "inherit", fontSize: "2rem", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.6px", marginBottom: "8px", lineHeight: 1.2 }}>
                  Masuk ke akun kamu
                </h1>
                <p style={{ fontFamily: "inherit", fontSize: "15px", color: "#555", margin: 0 }}>
                  Belum punya akun?{" "}
                  <Link href="/register" style={{ fontWeight: 700, color: "#1A3C34", textDecoration: "none" }}>
                    Daftar sekarang
                  </Link>
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                className="w-full rounded-2xl border border-[#E0DDD6] bg-white hover:bg-[#F7F5F1] transition-colors flex items-center justify-center gap-3"
                style={{ height: "52px", fontSize: "15px", fontWeight: 600, color: "#1A1A1A", fontFamily: "inherit", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3" style={{ marginBottom: "18px" }}>
                <div className="flex-1 h-px bg-[#EBEBEB]" />
                <span style={{ fontSize: "12px", color: "#C0BDB6", fontWeight: 500, fontFamily: "inherit" }}>atau dengan email</span>
                <div className="flex-1 h-px bg-[#EBEBEB]" />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl px-4 py-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: "16px" }}>
                  <svg className="w-4 h-4 shrink-0" style={{ marginTop: "2px", color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9"/>
                    <path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                  </svg>
                  <p style={{ fontSize: "14px", color: "#DC2626", margin: 0, fontFamily: "inherit" }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px", fontFamily: "inherit" }}>
                    Email
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="kamu@email.com" autoComplete="email"
                    style={{ fontFamily: "inherit", fontSize: "15px", height: "52px" }}
                    className="w-full px-4 rounded-2xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center" style={{ marginBottom: "7px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", fontFamily: "inherit" }}>Password</label>
                    <button type="button" style={{ fontSize: "13px", color: "#1A3C34", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                      placeholder="Minimal 8 karakter" autoComplete="current-password"
                      style={{ fontFamily: "inherit", fontSize: "15px", height: "52px" }}
                      className="w-full px-4 pr-12 rounded-2xl border border-[#E5E2DB] bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#C8C8C8] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#BDBDBD] hover:text-[#777] transition-colors">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  style={{ fontFamily: "inherit", fontSize: "16px", fontWeight: 700, height: "52px", marginTop: "6px" }}
                  className="w-full rounded-2xl bg-[#1A3C34] text-white hover:bg-[#16332C] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Sedang masuk...
                    </>
                  ) : "Masuk"}
                </button>
              </form>

              <p style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "#BBBBBB", lineHeight: 1.7, fontFamily: "inherit" }}>
                Dengan masuk, kamu menyetujui{" "}
                <span style={{ color: "#1A3C34", fontWeight: 500, cursor: "pointer" }}>Syarat & Ketentuan</span>
                {" "}serta{" "}
                <span style={{ color: "#1A3C34", fontWeight: 500, cursor: "pointer" }}>Kebijakan Privasi</span>
                {" "}PABW Shop.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}