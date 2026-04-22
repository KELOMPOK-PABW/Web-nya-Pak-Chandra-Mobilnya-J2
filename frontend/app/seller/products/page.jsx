"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// DATA
const PRODUK_DUMMY = [
  { id:1, name:"Air Jordan 1 x SB Dunk 'Lakers to Chicago'", sku:"NK42MERAH",  harga:2000000, stok:20,  skor:"Sempurna", aktif:true,  emoji:"👟", views:"413rb", terjual:434 },
  { id:2, name:"Nike Air Presto OG Black",                    sku:"NKAP-MERAH", harga:1900000, stok:10,  skor:"Buruk",    aktif:true,  emoji:"👟", views:"98rb",  terjual:22  },
  { id:3, name:"Nike React Element 87 Brown Volt",            sku:"64-HITAM",   harga:1900000, stok:100, skor:"Baik",     aktif:true,  emoji:"👟", views:"210rb", terjual:189 },
  { id:4, name:"Nike React Element 87 AQ1090-002 Abu-abu",    sku:"NRE87-ABU",  harga:2500000, stok:25,  skor:"Cukup",   aktif:false, emoji:"👟", views:"75rb",  terjual:50  },
  { id:5, name:"Sepatu Running Under Armour HOVR Phantom",    sku:"UA-HOVR-01", harga:2500000, stok:5,   skor:"Kurang",  aktif:true,  emoji:"👟", views:"55rb",  terjual:12  },
];

const SKOR_META = {
  Sempurna: { color:"#1A3C34", bars:5 },
  Baik:     { color:"#4DB6AC", bars:4 },
  Cukup:    { color:"#FFA726", bars:3 },
  Kurang:   { color:"#EF5350", bars:2 },
  Buruk:    { color:"#EF5350", bars:1 },
};

const DROPDOWN_ITEMS = [
  { label:"Edit Produk" },
  { label:"Pindah Etalase"},
  { label:"Duplikat Produk"},
  { label:"Pengingat Stok" },
  null,
  { label:"Hapus Produk",     icon:"🗑️", danger:true },
  null,
  { label:"Iklankan Produk" },
  { label:"Buat Kupon", badge:"BARU" },
  { label:"Broadcast Chat" },
  { label:"Produk Unggulan" },
];

const ETALASE_LIST = [
  { id:1, label:"Sneakers",      count:14},
  { id:2, label:"Formal",         count:6},
  { id:3, label:"Boots",          count:3},
  { id:4, label:"Sandal & Slop",  count:4},
  { id:5,label:"Aksesoris",      count:2},
];

// HELPERS
function formatRp(n) {
  return n.toLocaleString("id-ID");
}

// SUB-COMPONENTS
// Using shared `Navbar` and `Sidebar` components for consistent layout

function SidebarStats() {
  const rows = [
    { label:"Penilaian",    val:"4.9 ⭐", green:true },
    { label:"Respons Chat", val:"98%",    green:true },
    { label:"Pengiriman",   val:"< 1 hari" },
    { label:"Produk Aktif", val:"25",     green:true },
  ];
  return (
    <div style={{ background:"#1A3C34", borderRadius:14, padding:14 }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:700, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.8px" }}>
        Performa Toko
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"5px 0", borderTop: i>0?"1px solid rgba(255,255,255,0.08)":"none",
        }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{r.label}</span>
          <span style={{ fontSize:13, fontWeight:700, color: r.green?"#4DB6AC":"#fff" }}>{r.val}</span>
        </div>
      ))}
    </div>
  );
}

// Sidebar replaced by shared component

function SummaryCards() {
  const cards = [
    { label:"Total Produk",  val:29,  sub:"+3 bulan ini",   accent:"#1A3C34" },
    { label:"Produk Aktif",  val:25,  sub:"86% dari total", accent:"#4DB6AC" },
    { label:"Stok Rendah",   val:2,   sub:"Perlu restok",   accent:"#FFA726" },
    { label:"Pelanggaran",   val:1,   sub:"Perlu ditinjau", accent:"#EF5350" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background:"#fff", borderRadius:12, padding:"14px 16px",
          border:"1px solid #E8EDE8", position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            height:3, borderRadius:"0 0 12px 12px", background:c.accent,
          }} />
          <div style={{ fontSize:11, color:"#999", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:6 }}>{c.label}</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#1A1A1A", letterSpacing:"-0.5px" }}>{c.val}</div>
          <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ skor, views, terjual }) {
  const meta = SKOR_META[skor] ?? SKOR_META["Buruk"];
  return (
    <div style={{ minWidth:120 }}>
      <div style={{ fontSize:11, fontWeight:700, color:meta.color, marginBottom:4 }}>Skor: {skor}</div>
      <div style={{ display:"flex", gap:3, marginBottom:4 }}>
        {Array.from({length:5},(_,i) => (
          <div key={i} style={{
            width:16, height:5, borderRadius:3,
            background: i < meta.bars ? meta.color : "#E5E7EB",
          }} />
        ))}
      </div>
      <div style={{ fontSize:11, color:"#aaa" }}>{views} views · {terjual} terjual</div>
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width:40, height:22, borderRadius:11, border:"none", cursor:"pointer",
      position:"relative", background: on ? "#1A3C34" : "#E0E0E0",
      transition:"background 0.2s",
    }}>
      <div style={{
        position:"absolute", top:2, width:18, height:18,
        background:"#fff", borderRadius:"50%", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
        transform: on ? "translateX(20px)" : "translateX(2px)",
        transition:"transform 0.2s",
      }} />
    </button>
  );
}

function DropdownMenu({ onClose }) {
  return (
    <div style={{
      position:"absolute", right:0, top:"calc(100% + 4px)", zIndex:200,
      background:"#fff", border:"1px solid #E8EDE8", borderRadius:12,
      overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", width:200,
    }}>
      {DROPDOWN_ITEMS.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height:1, background:"#F3F4F6", margin:"4px 0" }} />
        ) : (
          <button key={i} onClick={onClose} style={{
            display:"flex", alignItems:"center", gap:10, padding:"9px 14px",
            fontSize:13, color: item.danger ? "#EF5350" : "#333",
            background:"none", border:"none", width:"100%", textAlign:"left",
            cursor:"pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = item.danger?"#FEF2F2":"#F5FAF8"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <span style={{ fontSize:13, width:18, textAlign:"center" }}>{item.icon}</span>
            {item.label}
            {item.badge && (
              <span style={{
                marginLeft:"auto", background:"#E65100", color:"#fff",
                fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:10,
              }}>{item.badge}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}

function EtalaseDropdown() {
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = ETALASE_LIST.find(e => e.id === active);

  return (
    <div ref={ref} style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height:36, padding:"0 12px",
          border: active ? "1.5px solid #4DB6AC" : "1.5px solid #E5E7EB",
          borderRadius:10, fontSize:13,
          background: active ? "#E0F5F0" : "#fff",
          color: active ? "#1A3C34" : "#555",
          cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          fontWeight: active ? 700 : 400,
        }}
      >
        {selected
          ? <><span style={{ fontSize:14 }}>{selected.emoji}</span> {selected.label}</>
          : <><span style={{ fontSize:14 }}></span> Etalase</>
        }
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:300,
          background:"#fff", border:"1px solid #E8EDE8", borderRadius:14,
          boxShadow:"0 8px 28px rgba(0,0,0,0.1)", width:248, padding:"6px 0",
        }}>
          {/* Header */}
          <div style={{ padding:"6px 14px 10px", borderBottom:"1px solid #F3F4F6" }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#999", textTransform:"uppercase", letterSpacing:"0.8px" }}>
              Pilih Etalase
            </div>
          </div>

          {/* All */}
          <button
            onClick={() => { setActive(null); setOpen(false); }}
            style={{
              width:"100%", padding:"9px 12px", border:"none",
              background: active === null ? "#F0FAF7" : "none",
              cursor:"pointer", display:"flex", alignItems:"center", gap:10,
              margin:"4px 0 2px",
            }}
            onMouseEnter={e => { if (active !== null) e.currentTarget.style.background = "#F8FAF9"; }}
            onMouseLeave={e => { if (active !== null) e.currentTarget.style.background = "none"; }}
          >
            {/* <div style={{
              width:32, height:32, borderRadius:9, background:"#F3F4F6",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0,
            }}></div> */}
            <div style={{ textAlign:"left", flex:1 }}>
              <div style={{ fontSize:13, fontWeight: active===null ? 700 : 500, color: active===null ? "#1A3C34" : "#333" }}>
                Semua Etalase
              </div>
              <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>29 produk</div>
            </div>
            {active === null && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A3C34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>

          {/* Divider */}
          <div style={{ height:1, background:"#F3F4F6", margin:"4px 12px" }} />

          {/* Etalase items */}
          {ETALASE_LIST.map(e => (
            <button
              key={e.id}
              onClick={() => { setActive(e.id); setOpen(false); }}
              style={{
                width:"100%", padding:"9px 12px", border:"none",
                background: active === e.id ? "#F0FAF7" : "none",
                cursor:"pointer", display:"flex", alignItems:"center", gap:10,
              }}
              onMouseEnter={ev => { if (active !== e.id) ev.currentTarget.style.background = "#F8FAF9"; }}
              onMouseLeave={ev => { if (active !== e.id) ev.currentTarget.style.background = "none"; }}
            >
              {/* <div style={{
                width:32, height:32, borderRadius:9,
                background: e.color,
                border: `1.5px solid ${e.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0,
              }}>{e.emoji}</div> */}
              <div style={{ textAlign:"left", flex:1 }}>
                <div style={{ fontSize:13, fontWeight: active===e.id ? 700 : 500, color: active===e.id ? "#1A3C34" : "#333" }}>
                  {e.label}
                </div>
                <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>{e.count} produk</div>
              </div>
              <span style={{
                fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20,
                background: e.color, color: e.border, flexShrink:0,
              }}>{e.count}</span>
              {active === e.id && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A3C34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}

          {/* Footer */}
          <div style={{ borderTop:"1px solid #F3F4F6", margin:"6px 0 0", padding:"8px 12px 4px" }}>
            <button style={{
              fontSize:12, fontWeight:700, color:"#1A3C34", background:"none",
              border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{
                width:18, height:18, borderRadius:5, background:"#E0F5F0",
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                fontSize:13, color:"#1A3C34",
              }}>+</span>
              Tambah Etalase Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// MAIN PAGE
export default function SellerProductsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search,    setSearch]    = useState("");
  const [sortBy,    setSortBy]    = useState("");
  const [produk,    setProduk]    = useState(PRODUK_DUMMY);
  const [openMenu,  setOpenMenu]  = useState(null);

  const filtered = useMemo(() => {
    let list = produk.filter(p => {
      if (activeTab === "aktif"    && !p.aktif) return false;
      if (activeTab === "nonaktif" &&  p.aktif) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortBy === "name")  list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    if (sortBy === "harga") list = [...list].sort((a,b) => a.harga - b.harga);
    if (sortBy === "stok")  list = [...list].sort((a,b) => a.stok - b.stok);
    return list;
  }, [produk, activeTab, search, sortBy]);

  const toggleAktif = (id) =>
    setProduk(prev => prev.map(p => p.id === id ? { ...p, aktif: !p.aktif } : p));

  const updateStok = (id, val) =>
    setProduk(prev => prev.map(p => p.id === id ? { ...p, stok: parseInt(val) || 0 } : p));

  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div
      style={{ minHeight:"100vh", background:"#F0F2F0", fontFamily:"'DM Sans','Inter',sans-serif" }}
      onClick={() => setOpenMenu(null)}
    >
      <Navbar />

      <div style={{ display:"flex", maxWidth:1200, margin:"0 auto", width:"100%", padding:"20px 16px", gap:20 }}>
        <Sidebar
          menus={[
            { label: "Dashboard", href: "/seller/dashboard" },
            { label: "Produk", href: "/seller/products", active: true },
            { label: "Pesanan", href: "/seller/orders" },
          ]}
        />

        <main style={{ flex:1, minWidth:0 }}>
          {/* Page Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:12, color:"#999", marginBottom:4 }}>Seller Center › Produk</div>
              <h1 style={{ fontSize:22, fontWeight:800, color:"#1A1A1A", letterSpacing:"-0.5px" }}>Daftar Produk</h1>
              <div style={{ fontSize:13, color:"#888", marginTop:2 }}>Kelola semua produk toko kamu</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{
                display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
                border:"1.5px solid #1A3C34", borderRadius:10, color:"#1A3C34",
                fontSize:13, fontWeight:700, background:"#fff", cursor:"pointer",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Atur Sekaligus
              </button>
              <button style={{
                display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
                border:"none", borderRadius:10, background:"#1A3C34", color:"#fff",
                fontSize:13, fontWeight:700, cursor:"pointer",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Produk
              </button>
            </div>
          </div>

          <SummaryCards />

          {/* Table Card */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EDE8", overflow:"hidden" }}>

            {/* Filters */}
            <div style={{ display:"flex", gap:10, padding:"14px 16px", borderBottom:"1px solid #F5F5F5", flexWrap:"wrap" }}>
              {/* Search */}
              <div style={{ position:"relative", flex:1, minWidth:200 }}>
                <svg
                  style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:15, height:15, stroke:"#aaa" }}
                  viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama produk atau SKU..."
                  style={{
                    width:"100%", height:36, padding:"0 12px 0 34px",
                    border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:13,
                    background:"#FAFAFA", outline:"none", color:"#333",
                  }}
                />
              </div>
              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                height:36, padding:"0 10px", border:"1.5px solid #E5E7EB",
                borderRadius:10, fontSize:13, background:"#fff", color:"#555", outline:"none",
              }}>
                <option value="">Urutkan</option>
                <option value="name">Nama A-Z</option>
                <option value="harga">Harga ↑</option>
                <option value="stok">Stok ↑</option>
              </select>
              {/* Kategori */}
              <select style={{
                height:36, padding:"0 10px", border:"1.5px solid #E5E7EB",
                borderRadius:10, fontSize:13, background:"#fff", color:"#555", outline:"none",
              }}>
                <option>Kategori</option>
              </select>
              {/* Etalase */}
              <EtalaseDropdown />
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead style={{ background:"#F8FAF9" }}>
                  <tr>
                    <th style={{ width:40, padding:"10px 14px", textAlign:"left" }}>
                      <input type="checkbox" style={{ width:16, height:16, accentColor:"#1A3C34" }} />
                    </th>
                    {["Info Produk","Statistik","Harga","Stok","Status","Aksi"].map(h => (
                      <th key={h} style={{
                        padding:"10px 14px", textAlign:"left",
                        fontSize:10, fontWeight:800, color:"#1A3C34",
                        textTransform:"uppercase", letterSpacing:1,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} style={{ borderTop:"1px solid #F5F5F5" }}>
                      <td style={{ padding:"14px" }}>
                        <input type="checkbox" style={{ width:16, height:16, accentColor:"#1A3C34" }} />
                      </td>

                      {/* Product Info */}
                      <td style={{ padding:"14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{
                            width:48, height:48, borderRadius:10, background:"#F3F4F6",
                            border:"1px solid #EBEBEB", display:"flex", alignItems:"center",
                            justifyContent:"center", flexShrink:0, fontSize:22,
                          }}>{p.emoji}</div>
                          <div>
                            <div style={{ fontWeight:700, color:"#1A1A1A", maxWidth:200, lineHeight:1.4 }}>{p.name}</div>
                            <div style={{ fontSize:11, color:"#bbb", marginTop:3 }}>SKU: {p.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td style={{ padding:"14px" }}>
                        <ScoreBar skor={p.skor} views={p.views} terjual={p.terjual} />
                      </td>

                      {/* Price */}
                      <td style={{ padding:"14px" }}>
                        <div style={{
                          display:"inline-flex", alignItems:"center",
                          border:"1px solid #E5E7EB", borderRadius:8, overflow:"hidden", height:32,
                        }}>
                          <span style={{
                            padding:"0 8px", background:"#F5F5F5", color:"#999",
                            fontSize:11, fontWeight:700, height:"100%",
                            display:"flex", alignItems:"center", borderRight:"1px solid #E5E7EB",
                          }}>Rp</span>
                          <span style={{ padding:"0 10px", fontSize:13, fontWeight:700, color:"#1A1A1A" }}>
                            {formatRp(p.harga)}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td style={{ padding:"14px" }}>
                        <input
                          type="number" defaultValue={p.stok} min={0}
                          onChange={e => updateStok(p.id, e.target.value)}
                          style={{
                            width:60, height:32, border:"1.5px solid #E5E7EB", borderRadius:8,
                            textAlign:"center", fontSize:13, fontWeight:700, outline:"none",
                            color: p.stok <= 10 ? "#EF5350" : "#1A3C34",
                          }}
                        />
                      </td>

                      {/* Toggle */}
                      <td style={{ padding:"14px" }}>
                        <Toggle on={p.aktif} onToggle={() => toggleAktif(p.id)} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding:"14px" }}>
                        <div style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                            style={{
                              padding:"7px 12px", border:"1.5px solid #E5E7EB", borderRadius:9,
                              background:"#fff", fontSize:12, fontWeight:700, color:"#555", cursor:"pointer",
                              display:"flex", alignItems:"center", gap:5,
                            }}
                          >
                            Atur
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points={openMenu===p.id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                            </svg>
                          </button>
                          {openMenu === p.id && (
                            <DropdownMenu onClose={() => setOpenMenu(null)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div style={{ padding:"48px", textAlign:"center", color:"#bbb" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>Tidak ada produk ditemukan</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}