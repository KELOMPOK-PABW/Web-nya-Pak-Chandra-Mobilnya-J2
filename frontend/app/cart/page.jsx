"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { useCartContext } from "@/components/CartContext";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import ProactivePrompt from "@/components/chat/ProactivePrompt";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const getProductImage = (item) => {
  const imageUrl = item?.product?.image_url || item?.product?.image || item?.image;
  return imageUrl || "/images/cart/kaos.svg";
};

const getCartItemId = (item) => item.id ?? item.cart_item_id ?? item.cartItemId;

const getItemSubtotal = (item) => {
  if (item.subtotal !== undefined && item.subtotal !== null) return Number(item.subtotal);
  return Number(item.product?.price || item.price || 0) * Number(item.qty || 1);
};

export default function CartPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [countInfo, setCountInfo] = useState({ total_items: 0, total_quantity: 0 });
  const [validateInfo, setValidateInfo] = useState({ valid: true, invalid_items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingItemId, setSavingItemId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const isLoggedIn = Boolean(authService.getToken());
  const { refreshCartCount } = useCartContext();

  // ── Cart abandonment tracking ──
  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => {
        // Signal is implicit via ProactivePrompt rendering condition below
      }, 10 * 60 * 1000); // 10 min
      return () => clearTimeout(timer);
    }
  }, [items.length]);

  const getDerivedCount = (cartItems) => ({
    total_items: cartItems.length,
    total_quantity: cartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0),
  });

  const fetchCartData = async () => {
    try {
      const cartItems = await cartService.getCart();
      const normalizedItems = Array.isArray(cartItems) ? cartItems : [];

      setItems(normalizedItems);
      setCountInfo(getDerivedCount(normalizedItems));

      try {
        const count = await cartService.countCartItems();
        setCountInfo(count || getDerivedCount(normalizedItems));
        // Refresh global cart context so Navbar badge stays in sync
        refreshCartCount();
      } catch {
        setCountInfo(getDerivedCount(normalizedItems));
      }

      try {
        const validation = await cartService.validateCart();
        setValidateInfo(validation || { valid: true, invalid_items: [] });
      } catch {
        setValidateInfo({ valid: true, invalid_items: [] });
      }
    } catch (err) {
      throw err;
    }
  };

  const loadCart = async () => {
    setLoading(true);
    setError("");

    try {
      await fetchCartData();
    } catch (err) {
      setError(err.message || "Gagal memuat cart");
      setItems([]);
      setCountInfo({ total_items: 0, total_quantity: 0 });
      setValidateInfo({ valid: true, invalid_items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Silakan login terlebih dahulu untuk melihat cart.");
      return;
    }

    loadCart();
  }, [isLoggedIn]);

  const refreshAfterMutation = async (message) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await fetchCartData();
      if (message) setSuccess(message);
    } catch (err) {
      setError(err.message || "Gagal memperbarui cart");
    } finally {
      setSaving(false);
    }
  };

  const updateQty = async (id, diff) => {
    const currentItem = items.find((item) => getCartItemId(item) === id);
    if (!currentItem) return;

    const nextQty = Math.max(1, Number(currentItem.qty) + diff);
    if (nextQty === Number(currentItem.qty)) return;

    setSavingItemId(id);
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await cartService.updateItem(id, nextQty);
      await fetchCartData();
      showToast({ type: "success", message: "Jumlah item berhasil diperbarui!" });
    } catch (err) {
      setError(err.message || "Gagal update qty");
    } finally {
      setSavingItemId(null);
      setSaving(false);
    }
  };

  const removeItem = async (id) => {
    setSavingItemId(id);
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await cartService.deleteItem(id);
      await fetchCartData();
      showToast({ type: "success", message: "Item berhasil dihapus dari keranjang." });
    } catch (err) {
      setError(err.message || "Gagal menghapus item");
    } finally {
      setSavingItemId(null);
      setSaving(false);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getItemSubtotal(item), 0),
    [items]
  );
  const shipping = items.length > 0 ? 15000 : 0;
  const total = subtotal + shipping;
  const totalQty = Number(countInfo.total_quantity ?? getDerivedCount(items).total_quantity);
  const invalidItems = validateInfo?.invalid_items || [];

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">Keranjang Belanja</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="rounded-2xl border border-[#1A3C34]/20 bg-[#F0FBF8] px-4 py-3 text-sm font-semibold text-[#1A3C34] hover:bg-[#D8F5F0] transition-colors flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4m0 0L8 8m4-4l4 4M12 20v-4"/>
                <path d="M12 20a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
              Cek promo
            </Link>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] shadow-sm">
              {loading ? "Memuat cart..." : `${countInfo.total_items || items.length} item • ${totalQty} qty`}
            </div>
          </div>
        </div>

        {/* ── Proactive prompt (cart abandonment) ── */}
        {!loading && items.length > 0 && (
          <div className="mb-4">
            <ProactivePrompt
              type="CART_ABANDON"
              onDismiss={() => {}}
              onAction={(action) => {
                if (action === "ask") router.push("/chat");
                if (action === "checkout") router.push("/checkout");
              }}
              delay={500}
            />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && !validateInfo?.valid && invalidItems.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Ada item cart yang tidak valid. Silakan cek stok berikut sebelum checkout.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="flex items-center justify-center min-h-75">
                <p className="text-gray-500">Memuat isi keranjang...</p>
              </Card>
            ) : items.length === 0 ? (
              <Card className="flex items-center justify-center min-h-75">
                <div className="text-center">
                  <p className="text-gray-500">Keranjang kamu masih kosong</p>
                  <Link href="/products" className="mt-3 inline-flex text-sm font-semibold text-[#1A3C34] hover:underline">
                    Lihat produk
                  </Link>
                </div>
              </Card>
            ) : (
              items.map((item) => {
                const itemId = getCartItemId(item);
                return (
                <Card key={itemId} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={getProductImage(item)}
                        alt={item.product?.name || "Product"}
                        className="w-22 h-22 rounded-xl border border-[#E5E7EB] object-cover bg-white"
                      />
                      <div>
                        <h2 className="text-lg font-bold text-[#111827]">{item.product?.name || `Produk #${item.product_id || item.id}`}</h2>
                        <p className="text-sm text-gray-500 mt-1">Product ID: {item.product?.id || item.product_id || "-"}</p>
                        <p className="font-semibold text-[#1A3C34] mt-2">
                          {formatRupiah(Number(item.product?.price || 0))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative">
                      <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          disabled={savingItemId === item.id}
                          className="w-9 h-9 text-lg text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        >
                          -
                        </button>
                        <span className={`w-10 text-center text-sm font-semibold text-[#111827] ${savingItemId === item.id ? 'opacity-40' : ''}`}>
                          {savingItemId === item.id ? (
                            <svg className="inline w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                            </svg>
                          ) : item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          disabled={savingItemId === item.id}
                          className="w-9 h-9 text-lg text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        >
                          +
                        </button>
                      </div>

                      <Button size="sm" variant="danger" type="button" loading={savingItemId === item.id} onClick={() => removeItem(item.id)}>
                        Hapus
                      </Button>
                    </div>
                  </div>
                </Card>
                );
              })
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
                <div className="flex justify-between">
                  <span className="text-[#0A0A0A]">Validasi</span>
                  <span className={`font-semibold ${validateInfo?.valid ? "text-emerald-600" : "text-amber-600"}`}>
                    {validateInfo?.valid ? "Valid" : `${invalidItems.length} item bermasalah`}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#ECEFF3] my-4" />

              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-[#111827]">Total Harga</span>
                <span className="text-lg font-bold text-[#0A0A0A]">{formatRupiah(total)}</span>
              </div>

              <Button className="w-full" disabled={items.length === 0 || !validateInfo?.valid} onClick={() => router.push("/checkout")}>
                Beli ({totalQty})
              </Button>
            </Card>
          </div>
        </div>

        {invalidItems.length > 0 && (
          <Card className="mt-8">
            <h2 className="font-bold text-[#0A0A0A] text-lg mb-4">Item Tidak Valid</h2>
            <div className="space-y-3">
              {invalidItems.map((item) => (
                <div key={`${item.cart_item_id}-${item.product_id}`} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <div className="font-semibold">{item.product_name || `Product #${item.product_id}`}</div>
                  <div className="mt-1">{item.reason}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
