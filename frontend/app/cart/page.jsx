"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";
import { useCartContext } from "@/components/CartContext";

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

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [countInfo, setCountInfo] = useState({ total_items: 0, total_quantity: 0 });
  const [validateInfo, setValidateInfo] = useState({ valid: true, invalid_items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLoggedIn = Boolean(authService.getToken());
  const { refreshCartCount } = useCartContext();

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
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem) return;

    const nextQty = Math.max(1, Number(currentItem.qty) + diff);
    if (nextQty === Number(currentItem.qty)) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await cartService.updateItem(id, nextQty);
      await fetchCartData();
      setSuccess("Qty cart berhasil diperbarui.");
    } catch (err) {
      setError(err.message || "Gagal update qty");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await cartService.deleteItem(id);
      await fetchCartData();
      setSuccess("Item berhasil dihapus dari cart.");
    } catch (err) {
      setError(err.message || "Gagal menghapus item");
    } finally {
      setSaving(false);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.subtotal || item.product?.price || 0), 0),
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
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] shadow-sm">
            {loading ? "Memuat cart..." : `${countInfo.total_items || items.length} item • ${totalQty} qty`}
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error || success}
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
              items.map((item) => (
                <Card key={item.id} className="p-5">
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

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          disabled={saving}
                          className="w-9 h-9 text-lg text-[#374151] hover:bg-[#F9FAFB]"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-[#111827]">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          disabled={saving}
                          className="w-9 h-9 text-lg text-[#374151] hover:bg-[#F9FAFB]"
                        >
                          +
                        </button>
                      </div>

                      <Button size="sm" variant="danger" type="button" loading={saving} onClick={() => removeItem(item.id)}>
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

              <Button className="w-full" disabled={items.length === 0 || !validateInfo?.valid}>
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