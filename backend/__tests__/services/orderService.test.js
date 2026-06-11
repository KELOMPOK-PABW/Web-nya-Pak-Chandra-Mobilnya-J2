const orderService = require("../../src/services/orderService");
const orderRepository = require("../../src/repository/orderRepository");
const { mapStatusForResponse } = require("../../src/utils/orderStatus");

jest.mock("../../src/repository/orderRepository");

describe("orderStatus.mapStatusForResponse", () => {
  it("should map fulfillment statuses to API labels", () => {
    expect(mapStatusForResponse("menunggu_penjual")).toBe("pending");
    expect(mapStatusForResponse("sedang_dikirim")).toBe("shipped");
    expect(mapStatusForResponse("diterima_pembeli")).toBe("completed");
    expect(mapStatusForResponse("transaksi_gagal")).toBe("cancelled");
  });

  it("should map payment statuses", () => {
    expect(mapStatusForResponse("paid")).toBe("paid");
    expect(mapStatusForResponse("failed")).toBe("cancelled");
  });
});

describe("OrderService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStatusHistory", () => {
    it("should return mapped status history with paid event", async () => {
      const paidAt = new Date("2026-04-09T10:05:00Z");
      orderRepository.findOrderMetaByIdForBuyer.mockResolvedValue({
        id: 1,
        paymentStatus: "paid",
        createdAt: new Date("2026-04-09T10:00:00Z"),
        paidAt,
      });
      orderRepository.findStatusHistoryByOrderId.mockResolvedValue([
        { status: "menunggu_penjual", createdAt: new Date("2026-04-09T10:00:00Z") },
        { status: "sedang_dikirim", createdAt: new Date("2026-04-09T12:00:00Z") },
      ]);

      const result = await orderService.getStatusHistory(1, 10);

      expect(result).toEqual([
        { status: "pending", created_at: new Date("2026-04-09T10:00:00Z") },
        { status: "paid", created_at: paidAt },
        { status: "shipped", created_at: new Date("2026-04-09T12:00:00Z") },
      ]);
    });

    it("should throw 404 when order not found", async () => {
      orderRepository.findOrderMetaByIdForBuyer.mockResolvedValue(null);
      await expect(orderService.getStatusHistory(99, 10)).rejects.toMatchObject({
        message: "Order tidak ditemukan",
        statusCode: 404,
      });
    });
  });

  describe("cancelOrder", () => {
    it("should cancel a pending unprocessed order", async () => {
      orderRepository.findOrderWithItemsAndPayment.mockResolvedValue({
        id: 1,
        paymentStatus: "pending",
        payment: { status: "pending" },
        items: [{ status: "menunggu_penjual", qty: 1, product: { id: 1, stock: 5 } }],
      });
      orderRepository.cancelOrder.mockResolvedValue({ id: 1 });

      const result = await orderService.cancelOrder(1, 10);

      expect(result).toEqual({ status: "transaksi gagal" });
      expect(orderRepository.cancelOrder).toHaveBeenCalledWith(1, 10, 10);
    });

    it("should reject cancel when payment is paid", async () => {
      orderRepository.findOrderWithItemsAndPayment.mockResolvedValue({
        id: 1,
        paymentStatus: "paid",
        payment: { status: "paid" },
        items: [{ status: "menunggu_penjual" }],
      });

      await expect(orderService.cancelOrder(1, 10)).rejects.toThrow(
        "Pesanan tidak dapat dibatalkan karena pembayaran sudah lunas"
      );
    });

    it("should reject cancel when seller already processed", async () => {
      orderRepository.findOrderWithItemsAndPayment.mockResolvedValue({
        id: 1,
        paymentStatus: "pending",
        payment: { status: "pending" },
        items: [{ status: "diproses_penjual" }],
      });

      await expect(orderService.cancelOrder(1, 10)).rejects.toThrow(
        "Pesanan tidak dapat dibatalkan karena sudah diproses penjual"
      );
    });
  });

  describe("confirmOrder", () => {
    it("should confirm when all items arrived", async () => {
      orderRepository.findOrderWithItemsAndPayment.mockResolvedValue({
        id: 1,
        items: [
          { status: "sampai_di_tujuan", sellerId: 2, priceSnap: 10000, qty: 1 },
          { status: "sampai_di_tujuan", sellerId: 3, priceSnap: 20000, qty: 2 },
        ],
      });
      orderRepository.confirmOrderReceived.mockResolvedValue({ id: 1 });

      const result = await orderService.confirmOrder(1, 10);

      expect(result).toEqual({ status: "diterima pembeli" });
      expect(orderRepository.confirmOrderReceived).toHaveBeenCalledWith(1, 10, 10);
    });

    it("should reject confirm when items are not all delivered", async () => {
      orderRepository.findOrderWithItemsAndPayment.mockResolvedValue({
        id: 1,
        items: [
          { status: "sampai_di_tujuan" },
          { status: "sedang_dikirim" },
        ],
      });

      await expect(orderService.confirmOrder(1, 10)).rejects.toThrow(
        "Semua item harus sudah sampai di tujuan"
      );
    });
  });

  describe("completeOrderItem", () => {
    it("should complete an arrived order item", async () => {
      const completedAt = new Date("2026-04-09T15:00:00Z");
      orderRepository.findOrderItemByIdForBuyer.mockResolvedValue({
        id: 200,
        status: "sampai_di_tujuan",
        order: { id: 1, buyerId: 10 },
      });
      orderRepository.completeOrderItem.mockResolvedValue({
        item: { id: 200 },
        completedAt,
      });

      const result = await orderService.completeOrderItem(200, 10);

      expect(result).toEqual({
        order_item_id: 200,
        status: "completed",
        completed_at: completedAt,
      });
    });

    it("should reject complete when item is not delivered yet", async () => {
      orderRepository.findOrderItemByIdForBuyer.mockResolvedValue({
        id: 200,
        status: "sedang_dikirim",
        order: { id: 1, buyerId: 10 },
      });

      await expect(orderService.completeOrderItem(200, 10)).rejects.toThrow(
        "Item harus sudah sampai di tujuan"
      );
    });
  });
});
