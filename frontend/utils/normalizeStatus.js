export function normalizeStatus(s) {
  if (!s) return "menunggu kurir";
  const t = String(s).replace(/_/g, " ").toLowerCase().trim();
  // Known canonical tokens we want on the client
  const map = {
    "sedang dikirim": "sedang dikirim",
    "sampai di tujuan": "sampai di tujuan",
    "dikirim balik": "dikirim balik",
    "menunggu kurir": "menunggu kurir",
    "menunggu penjual": "menunggu penjual",
    // Keep a fallback for some english-like tokens mapping to existing backend keys
    "ready to ship": "ready_to_ship",
  };
  return map[t] ?? t;
}

export default normalizeStatus;
