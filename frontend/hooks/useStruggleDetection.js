"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook that monitors user behavior for struggle signals
 * and emits events the assistant can respond to.
 *
 * Signals:
 * - DWELL: User stays on PDP >30s without scroll/add-to-cart
 * - SEARCH_LOOP: User changes search filters >3 times in <2min
 * - CART_ABANDON: Cart has items >10min without checkout
 *
 * Usage:
 *   const { signals, dismiss } = useStruggleDetection({ pageType: 'pdp' });
 *   // signals = [{ type: 'DWELL', timestamp, data }]
 */

const SIGNAL_COOLDOWN_MS = 5 * 60 * 1000; // 5 min before same signal re-fires
const DWELL_THRESHOLD_MS = 30000;          // 30s dwell
const SEARCH_LOOP_WINDOW_MS = 2 * 60 * 1000;  // 2min window
const SEARCH_LOOP_THRESHOLD = 3;              // 3+ filter changes
const CART_ABANDON_THRESHOLD_MS = 10 * 60 * 1000; // 10min

export default function useStruggleDetection({ pageType, productId, onSignal } = {}) {
  const [signals, setSignals] = useState([]);
  const [dismissedSignals, setDismissedSignals] = useState(new Set());
  const dwellTimerRef = useRef(null);
  const searchChangesRef = useRef([]);
  const cartEntryTimeRef = useRef(null);
  const signalHistoryRef = useRef([]);

  // ── Dwell detection (PDP only) ──
  useEffect(() => {
    if (pageType !== "pdp" || !productId) return;

    dwellTimerRef.current = setTimeout(() => {
      emitSignal("DWELL", { productId, thresholdMs: DWELL_THRESHOLD_MS });
    }, DWELL_THRESHOLD_MS);

    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
    };
  }, [pageType, productId]);

  // Clear dwell timer on user interaction (scroll, click add-to-cart)
  const clearDwell = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  // ── Search loop detection (search/category pages only) ──
  const recordSearchChange = useCallback(() => {
    if (pageType !== "search") return;
    const now = Date.now();
    searchChangesRef.current = searchChangesRef.current.filter(
      (t) => now - t < SEARCH_LOOP_WINDOW_MS
    );
    searchChangesRef.current.push(now);

    if (searchChangesRef.current.length >= SEARCH_LOOP_THRESHOLD) {
      emitSignal("SEARCH_LOOP", { changes: searchChangesRef.current.length });
      searchChangesRef.current = []; // Reset after emitting
    }
  }, [pageType]);

  // ── Cart abandonment detection (cart page only) ──
  const recordCartEntry = useCallback(() => {
    if (pageType !== "cart") return;
    cartEntryTimeRef.current = Date.now();

    // Check after threshold
    setTimeout(() => {
      if (cartEntryTimeRef.current && (Date.now() - cartEntryTimeRef.current) >= CART_ABANDON_THRESHOLD_MS) {
        emitSignal("CART_ABANDON", { dwellMs: Date.now() - cartEntryTimeRef.current });
      }
    }, CART_ABANDON_THRESHOLD_MS);
  }, [pageType]);

  // ── Emit signal with cooldown ──
  const emitSignal = useCallback((type, data) => {
    // Check cooldown
    const now = Date.now();
    const lastEmit = signalHistoryRef.current
      .filter((s) => s.type === type)
      .pop()?.timestamp;

    if (lastEmit && (now - lastEmit) < SIGNAL_COOLDOWN_MS) return;
    if (dismissedSignals.has(type)) return;

    const signal = { type, timestamp: now, data };
    signalHistoryRef.current.push(signal);
    setSignals((prev) => [...prev, signal]);
    onSignal?.(signal);
  }, [dismissedSignals, onSignal]);

  // ── Dismiss a signal type ──
  const dismiss = useCallback((type) => {
    setDismissedSignals((prev) => new Set([...prev, type]));
    setSignals((prev) => prev.filter((s) => s.type !== type));
  }, []);

  // ── Dismiss all ──
  const dismissAll = useCallback(() => {
    setSignals([]);
    setDismissedSignals(new Set(["DWELL", "SEARCH_LOOP", "CART_ABANDON"]));
  }, []);

  return {
    signals,
    dismiss,
    dismissAll,
    clearDwell,
    recordSearchChange,
    recordCartEntry,
  };
}
