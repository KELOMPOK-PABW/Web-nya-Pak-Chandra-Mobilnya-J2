const FULFILLMENT_STATUS_MAP = {
  menunggu_penjual: "pending",
  diproses_penjual: "processing",
  menunggu_kurir: "ready_to_ship",
  sedang_dikirim: "shipped",
  sampai_di_tujuan: "delivered",
  diterima_pembeli: "completed",
  transaksi_gagal: "cancelled",
};

const PAYMENT_STATUS_MAP = {
  pending: "pending",
  paid: "paid",
  failed: "cancelled",
};

const mapStatusForResponse = (status) => {
  if (FULFILLMENT_STATUS_MAP[status]) {
    return FULFILLMENT_STATUS_MAP[status];
  }
  if (PAYMENT_STATUS_MAP[status]) {
    return PAYMENT_STATUS_MAP[status];
  }
  return status;
};

module.exports = {
  mapStatusForResponse,
};
