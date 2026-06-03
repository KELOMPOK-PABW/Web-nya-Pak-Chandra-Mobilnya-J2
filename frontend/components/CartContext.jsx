"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { cartService } from "@/services/cartService";
import { authService } from "@/services/authService";

const CartContext = createContext({
  cartCount: 0,
  refreshCartCount: () => {},
});

export function useCartContext() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshCartCount = useCallback(async () => {
    const user = authService.getUser();
    if (!user || !mountedRef.current) return;

    try {
      const count = await cartService.countCartItems();
      if (!mountedRef.current) return;
      setCartCount(Number(count?.total_quantity || 0));
    } catch {
      if (mountedRef.current) setCartCount(0);
    }
  }, []);

  // Fetch initial cart count on mount when user is available
  useEffect(() => {
    if (!mounted) return;

    let active = true;

    async function loadInitial() {
      const user = authService.getUser();
      if (!user) return;

      try {
        const count = await cartService.countCartItems();
        if (!active) return;
        setCartCount(Number(count?.total_quantity || 0));
      } catch {
        if (active) setCartCount(0);
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, [mounted]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}
