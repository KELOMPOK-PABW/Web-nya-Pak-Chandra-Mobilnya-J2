const STORE_KEY = "pabw_my_store";
const APPLICATION_KEY = "pabw_seller_application";

const defaultStore = {
  storeName: "Toko Rahma Jaya",
  slogan: "Belanja aman, harga nyaman",
  city: "Bandung",
  address: "Jl. Cempaka No. 12, Bandung",
  phone: "081234567890",
  description:
    "Kami menjual kebutuhan rumah tangga dan produk harian pilihan dengan kualitas terjaga.",
  status: "active",
};

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
  getMyStore() {
    if (!canUseStorage()) return defaultStore;
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? safeParse(raw, defaultStore) : defaultStore;
  },

  updateMyStore(payload) {
    const updatedStore = {
      ...this.getMyStore(),
      ...payload,
      status: "active",
      updatedAt: new Date().toISOString(),
    };

    if (canUseStorage()) {
      localStorage.setItem(STORE_KEY, JSON.stringify(updatedStore));
    }

    return updatedStore;
  },

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

  getApplicationStatus() {
    if (!canUseStorage()) return null;
    const raw = localStorage.getItem(APPLICATION_KEY);
    return raw ? safeParse(raw) : null;
  },
};
