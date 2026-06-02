/**
 * Seller Service
 * 
 * Product management is handled by `productService` (real API).
 * Seller application and store profile use localStorage until
 * backend endpoints are available.
 */

const APPLICATION_KEY = "pabw_seller_application";

function canUseStorage() {
  return typeof window !== "undefined";
}

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const sellerService = {
  /**
   * Submit seller application (localStorage — no backend endpoint yet).
   */
  submitApplication(payload) {
    const submission = {
      id: `APP-${Date.now()}`,
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerNote: "",
      ...payload,
    };

    if (canUseStorage()) {
      localStorage.setItem(APPLICATION_KEY, JSON.stringify(submission));
    }

    return submission;
  },

  /**
   * Get application status (localStorage).
   */
  getApplicationStatus() {
    if (!canUseStorage()) return null;
    const raw = localStorage.getItem(APPLICATION_KEY);
    return raw ? safeParse(raw) : null;
  },
};
