"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { productService } from "@/services/productService";
import { sellerService } from "@/services/sellerService";

const SELLER_MENUS = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Produk", href: "/seller/products" },
  { label: "Pesanan", href: "/seller/orders" },
  { label: "Toko Saya", href: "/stores/me" },
  { label: "Status Pengajuan", href: "/seller/application" },
];

function fmt(n) {
  return "Rp" + Number(n || 0).toLocaleString("id-ID");
}

export default function MyStorePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    storeName: "",
    slogan: "",
    city: "",
    address: "",
    phone: "",
    description: "",
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      setError("");
      try {
        const [store, productsRes] = await Promise.all([
          sellerService.getMyStore(),
          productService.getSellerProducts().catch(() => ({ data: [] }))
        ]);

        if (!active) return;

        setForm({
          storeName: store.storeName || "",
          slogan: store.slogan || "",
          city: store.city || "",
          address: store.address || "",
          phone: store.phone || "",
          description: store.description || "",
        });
        setProducts(Array.isArray(productsRes) ? productsRes : productsRes.data || []);
      } catch (err) {
        if (active) setError(err.message || "Gagal mengambil data toko.");
      } finally {
        if (active) {
          setIsLoading(false);
          setProductsLoading(false);
        }
      }
    }

    loadData();
    return () => { active = false; };
  }, []);

  const totalStockValue = products.reduce((s, p) => s + (Number(p.price || 0) * Number(p.stock || 0)), 0);
  const activeProductsCount = products.filter(p => Number(p.stock) > 0).length;

  const onSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setError("");
    try {
      const updated = await sellerService.updateMyStore(form);
      setForm(prev => ({
        ...prev,
        storeName: updated.storeName || prev.storeName,
        phone: updated.phone || prev.phone,
      }));
      setSaveMessage("Informasi toko berhasil diperbarui!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar menus={SELLER_MENUS} />

        <main style={{ flex: 1, padding: "32px", maxWidth: "1200px" }}>

          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Profil Toko</h1>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>Kelola informasi identitas dan performa toko Anda.</p>
          </div>

          {(error || saveMessage) && (
            <div style={{
              marginBottom: "20px", padding: "12px 16px", borderRadius: "12px", fontSize: "14px",
              background: error ? "#FEF2F2" : "#F0FDF4",
              border: `1px solid ${error ? "#FECACA" : "#BBF7D0"}`,
              color: error ? "#B91C1C" : "#166534"
            }}>
              {error || saveMessage}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

            {/* LEFT: Info Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <Card style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>Informasi Dasar</h2>
                  {!isEditing && (
                    <Button variant="outline" style={{ padding: "6px 16px", fontSize: "12px" }} onClick={() => setIsEditing(true)}>
                      Edit Profil
                    </Button>
                  )}
                </div>

                {isLoading ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>Memuat informasi toko...</div>
                ) : (
                  <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Nama Toko</label>
                        <input
                          disabled={!isEditing} value={form.storeName}
                          onChange={e => setForm({ ...form, storeName: e.target.value })}
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                            background: isEditing ? "#fff" : "#f8f9fa", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Slogan</label>
                        <input
                          disabled={!isEditing} value={form.slogan}
                          onChange={e => setForm({ ...form, slogan: e.target.value })}
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                            background: isEditing ? "#fff" : "#f8f9fa", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Kota</label>
                        <input
                          disabled={!isEditing} value={form.city}
                          onChange={e => setForm({ ...form, city: e.target.value })}
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                            background: isEditing ? "#fff" : "#f8f9fa", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>No. Telepon</label>
                        <input
                          disabled={!isEditing} value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          style={{
                            width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                            background: isEditing ? "#fff" : "#f8f9fa", outline: "none", boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Alamat Lengkap</label>
                      <input
                        disabled={!isEditing} value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                          background: isEditing ? "#fff" : "#f8f9fa", outline: "none", boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px", display: "block" }}>Deskripsi Toko</label>
                      <textarea
                        disabled={!isEditing} value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                          background: isEditing ? "#fff" : "#f8f9fa", outline: "none", boxSizing: "border-box", resize: "none"
                        }}
                      />
                    </div>

                    {isEditing && (
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <Button type="submit" loading={isSaving}>Simpan Perubahan</Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Batal</Button>
                      </div>
                    )}
                  </form>
                )}
              </Card>

              {/* Products List Partial */}
              <Card style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>Katalog Produk</h2>
                  <Button variant="outline" style={{ padding: "6px 16px", fontSize: "12px" }}>
                    <a href="/seller/products" style={{ textDecoration: "none", color: "inherit" }}>Kelola Produk</a>
                  </Button>
                </div>

                {productsLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: "50px", background: "#f1f5f9", borderRadius: "10px" }} />)}
                  </div>
                ) : products.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#999", fontSize: "13px" }}>Belum ada produk di toko Anda.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {products.slice(0, 5).map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", border: "1px solid #f1f5f9", borderRadius: "12px" }}>
                        <div style={{ width: "40px", height: "40px", background: "#f0fdf4", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: "#1A3C34" }}>P</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>{p.name}</p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{fmt(p.price)} - Stok: {p.stock}</p>
                        </div>
                        <Badge variant={p.stock > 0 ? "success" : "danger"}>{p.stock > 0 ? "Aktif" : "Habis"}</Badge>
                      </div>
                    ))}
                    {products.length > 5 && (
                      <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: "12px", color: "#666" }}>Menampilkan 5 dari {products.length} produk</p>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* RIGHT: Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <Card style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", margin: "0 0 16px", textTransform: "uppercase" }}>Performa Toko</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>Total Produk</p>
                    <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800 }}>{products.length}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>Produk Aktif</p>
                    <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#059669" }}>{activeProductsCount}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>Estimasi Nilai Stok</p>
                    <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#1A3C34" }}>{fmt(totalStockValue)}</p>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: "20px", background: "#1A3C34" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Status Toko</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <div style={{ width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%" }} />
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>Aktif Berjualan</span>
                </div>
              </Card>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
