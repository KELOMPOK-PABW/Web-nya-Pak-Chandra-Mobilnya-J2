const { chromium } = require("playwright");

const BASE_URL = "http://localhost:3001";
const EMAIL = "test@example.com";
const PASSWORD = "password123";
const SS_DIR = __dirname.replace("/scripts", "/screenshots");

/**
 * Helper: scroll the chat area to the bottom so the latest message is visible.
 */
async function scrollChatBottom(page) {
  await page.evaluate(() => {
    const chatArea = document.querySelector(".overflow-y-auto");
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
  });
  await page.waitForTimeout(400);
}

/**
 * Helper: wait for the assistant to finish responding.
 * Polls until the chat input is re-enabled (loading=false) or timeout.
 */
async function waitForAssistantResponse(page, timeoutMs = 25000) {
  await page.waitForTimeout(800);
  try {
    await page.waitForFunction(
      () => {
        const input = document.querySelector('input[placeholder="Ketik pesan..."]');
        return input && !input.disabled;
      },
      { timeout: timeoutMs }
    );
  } catch {
    console.log("  [wait] Timeout — proceeding anyway");
  }
  await page.waitForTimeout(1200);
}

/**
 * Helper: send a chat message, wait for the AI response, scroll, screenshot.
 */
async function sendAndScreenshot(page, message, screenshotName, label) {
  const inputSelector = 'input[placeholder="Ketik pesan..."]';
  await page.waitForSelector(inputSelector);
  await page.fill(inputSelector, message);
  await page.waitForTimeout(300);
  await page.press(inputSelector, "Enter");
  console.log(`  Sent: "${message}"`);
  await waitForAssistantResponse(page);
  await scrollChatBottom(page);
  await page.screenshot({ path: `${SS_DIR}/${screenshotName}`, fullPage: false });
  console.log(`  ${label} ✓`);
}

/**
 * Helper: delete ALL existing chat sessions for the logged-in user.
 * Reads the JWT token from localStorage and calls the DELETE API for each session.
 */
async function deleteAllChatSessions(page) {
  const result = await page.evaluate(async () => {
    const token = localStorage.getItem("token");
    if (!token) return { deleted: 0, error: "no token" };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Use relative URL — runs inside browser on localhost:3001,
    // Next.js rewrites /api/* → backend on port 3000
    const resp = await fetch("/api/chat/sessions", { headers });
    const body = await resp.json();
    const sessions = body.data || [];

    for (const s of sessions) {
      await fetch(`/api/chat/sessions/${s.id}`, {
        method: "DELETE",
        headers,
      });
    }

    return { deleted: sessions.length };
  });

  if (result.deleted > 0) {
    console.log(`  Deleted ${result.deleted} existing session(s)`);
  } else {
    console.log("  No existing sessions to delete");
  }
}

/**
 * Helper: start a fresh chat session by clicking "+ Baru".
 */
async function startNewSession(page) {
  const newBtn = page.locator("button:has-text('+ Baru')");
  if (await newBtn.isVisible()) {
    await newBtn.click();
    await page.waitForTimeout(1000);
    console.log("  Started new session (+ Baru)");
  }
}

// ─────────────────────────────────────────────────────────────────────
//  MAIN — 1 product, ALL intents
// ─────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "id-ID",
  });
  const page = await context.newPage();

  // ── 0. LOGIN ──
  console.log("=== 0. Login ===");
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/home", { timeout: 10000 });
  console.log("Login success, at /home");

  // ── CLEAR ALL EXISTING SESSION ──
  console.log("\n=== Clear existing sessions ===");
  await deleteAllChatSessions(page);

  // ── 1. CHAT LANDING ──
  console.log("\n=== 1. Chat Landing ===");
  await page.goto(`${BASE_URL}/chat`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SS_DIR}/01-chat-landing.png`, fullPage: false });
  console.log("Screenshot 1: Chat landing ✓");

  // ═══════════════════════════════════════════════════════════════════
  //  PRODUCT: Apple MacBook (multiple variants — triggers AMBIGUITY)
  //  SESSION 1 — shopping intents (continuous conversation)
  // ═══════════════════════════════════════════════════════════════════

  // ── 2. SEARCH_PRODUCT ──
  console.log("\n=== 2. search_product ===");
  await sendAndScreenshot(page,
    "cari MacBook",
    "02-search-product.png",
    "search_product — MacBook results"
  );

  // ── 3. ADD_TO_CART (ambiguous — should ask "which one?") ──
  console.log("\n=== 3. add_to_cart (ambiguous) ===");
  await sendAndScreenshot(page,
    "tambah MacBook ke keranjang",
    "03-add-to-cart.png",
    "add_to_cart — LLM should ask 'which MacBook?' with product cards"
  );

  // Click the "Tambah ke Keranjang" button
  const addBtn = page.locator("button:has-text('Tambah ke Keranjang')").first();
  if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addBtn.click();
    await page.waitForTimeout(1500);
    console.log("  Clicked Tambah → confirmation card");
  }
  await scrollChatBottom(page);
  await page.screenshot({ path: `${SS_DIR}/03b-confirm-card.png`, fullPage: false });
  console.log("  Confirmation card ✓");

  // Confirm the add
  const confirmBtn = page.locator("button:has-text('Tambah ke Keranjang')").last();
  if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmBtn.click();
    await page.waitForTimeout(3000);
    console.log("  Confirmed add to cart");
  }
  await scrollChatBottom(page);
  await page.screenshot({ path: `${SS_DIR}/03c-cart-success.png`, fullPage: false });
  console.log("  Cart success notification ✓");

  // ── 4. COMPARE — with follow-up chips "Checkout [Nama Produk]" ──
  console.log("\n=== 4. compare ===");
  await sendAndScreenshot(page,
    "bandingkan MacBook yang tersedia",
    "04-compare.png",
    "compare — ComparisonCard + follow-up chips"
  );

  // ── 5. CHECKOUT_ORDER — user taps follow-up chip ──
  console.log("\n=== 5. checkout_order (via follow-up chip) ===");
  // Try clicking a follow-up chip like "Checkout MacBook Pro..."
  const checkoutChip = page.locator("button:has-text('Checkout')").first();
  if (await checkoutChip.isVisible({ timeout: 3000 }).catch(() => false)) {
    const chipText = await checkoutChip.textContent();
    await checkoutChip.click();
    console.log(`  Tapped follow-up chip: "${chipText}"`);
    await waitForAssistantResponse(page);
  } else {
    // Fallback: send manually
    console.log("  No checkout chip found, sending manual message");
    await page.fill('input[placeholder="Ketik pesan..."]', "saya mau checkout MacBook Pro 14");
    await page.press('input[placeholder="Ketik pesan..."]', "Enter");
    await waitForAssistantResponse(page);
  }
  await scrollChatBottom(page);
  await page.screenshot({ path: `${SS_DIR}/05-checkout.png`, fullPage: false });
  console.log("  checkout_order — yellow button ✓");

  // ── 6. TRACK_ORDER ──
  console.log("\n=== 6. track_order ===");
  await sendAndScreenshot(page,
    "cek status pengiriman MacBook saya nomor pesanan 7",
    "06-track-order.png",
    "track_order — blue button"
  );

  // ── 7. MAKE_PAYMENT ──
  console.log("\n=== 7. make_payment ===");
  await sendAndScreenshot(page,
    "saya mau bayar MacBook ini pakai ewallet",
    "07-make-payment.png",
    "make_payment — payment info"
  );

  // ── 8. CLEAR_CART ──
  console.log("\n=== 8. clear_cart ===");
  await sendAndScreenshot(page,
    "tolong kosongkan keranjang belanja saya",
    "08-clear-cart.png",
    "clear_cart — red button"
  );

  // ═══════════════════════════════════════════════════════════════════
  //  SESSION 2 — seller/admin intents (fresh session)
  // ═══════════════════════════════════════════════════════════════════

  // ── 9. MANAGE_PRODUCT ──
  console.log("\n=== 9. manage_product ===");
  await startNewSession(page);
  await sendAndScreenshot(page,
    "saya admin mau update stok MacBook jadi 25",
    "09-manage-product.png",
    "manage_product — admin stock update"
  );

  // ── 10. PROCESS_ORDER ──
  console.log("\n=== 10. process_order ===");
  await startNewSession(page);
  await sendAndScreenshot(page,
    "saya seller, proses pesanan #5 untuk MacBook",
    "10-process-order.png",
    "process_order — seller processes order"
  );

  // ── 11. UPDATE_SHIPPING ──
  console.log("\n=== 11. update_shipping ===");
  await startNewSession(page);
  await sendAndScreenshot(page,
    "saya kurir, pesanan MacBook #4 sudah sampai tujuan",
    "11-update-shipping.png",
    "update_shipping — courier delivery"
  );

  // ── 12. MANAGE_USER_ADMIN ──
  console.log("\n=== 12. manage_user_admin ===");
  await startNewSession(page);
  await sendAndScreenshot(page,
    "saya admin, tolong ban user #42 yang pernah beli MacBook",
    "12-manage-user-admin.png",
    "manage_user_admin — ban user"
  );

  // ═══════════════════════════════════════════════════════════════════
  //  DONE
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n========================================");
  console.log("  All screenshots captured!");
  console.log(`  Location: ${SS_DIR}/`);
  console.log("========================================");

  console.log("\n1 product (MacBook) — all 10 intents + compare + ambiguity resolution:");
  console.log("  ✅ search_product     — Screenshot 2: daftar MacBook");
  console.log("  ✅ add_to_cart (ambig) — Screenshot 3: AI nanya 'yang mana?' + kartu produk");
  console.log("  ✅ add_to_cart (pilih) — Screenshot 3b: klik salah satu → confirmation card");
  console.log("  ✅ compare           — Screenshot 4");
  console.log("  ✅ checkout_order    — Screenshot 5");
  console.log("  ✅ track_order       — Screenshot 6");
  console.log("  ✅ make_payment      — Screenshot 7");
  console.log("  ✅ clear_cart        — Screenshot 8");
  console.log("  ✅ manage_product    — Screenshot 9");
  console.log("  ✅ process_order     — Screenshot 10");
  console.log("  ✅ update_shipping   — Screenshot 11");
  console.log("  ✅ manage_user_admin — Screenshot 12");

  await browser.close();
})();
