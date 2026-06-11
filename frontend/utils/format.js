/**
 * Format a number as Indonesian Rupiah currency string.
 * @param {number} value
 * @returns {string} e.g. "Rp 50.000"
 */
export function formatPrice(value) {
  return "Rp " + Number(value).toLocaleString("id-ID");
}
