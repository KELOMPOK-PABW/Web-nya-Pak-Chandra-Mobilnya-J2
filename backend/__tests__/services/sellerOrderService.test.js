const sellerOrderService = require("../../src/services/sellerOrderService");
const sellerOrderRepository = require("../../src/repository/sellerOrderRepository");

jest.mock("../../src/repository/sellerOrderRepository");

describe("SellerOrderService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSellerOrders", () => {
    it("should return paginated seller orders per API contract", async () => {
      const createdAt = new Date("2026-04-09T10:00:00Z");
      sellerOrderRepository.findOrderItemsBySellerId.mockResolvedValue([
        {
          id: 200,
          order: { id: 100, buyer: { fullName: "Rahmi" } },
          product: { name: "Laptop Gaming" },
          productNameSnap: "Laptop Gaming",
          qty: 1,
          priceSnap: 8000000,
          status: "menunggu_penjual",
          createdAt,
        },
      ]);

      const result = await sellerOrderService.getSellerOrders(5, { page: 1, limit: 10 });

      expect(sellerOrderRepository.findOrderItemsBySellerId).toHaveBeenCalledWith(5, {
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: [
          {
            order_id: 100,
            order_item_id: 200,
            product_name: "Laptop Gaming",
            qty: 1,
            price: 8000000,
            buyer_name: "Rahmi",
            status: "pending",
            created_at: createdAt,
          },
        ],
        meta: { page: 1, limit: 10 },
      });
    });
  });

  describe("getSellerOrderById", () => {
    it("should return seller order detail per API contract", async () => {
      sellerOrderRepository.findOrderByIdForSeller.mockResolvedValue({
        id: 100,
        buyer: { fullName: "Rahmi", phone: "08123456789" },
        address: { address: "Jl. Merdeka", city: "Balikpapan" },
        items: [
          {
            id: 200,
            productNameSnap: "Laptop Gaming",
            qty: 1,
            priceSnap: 8000000,
            status: "menunggu_penjual",
          },
        ],
      });

      const result = await sellerOrderService.getSellerOrderById(100, 5);

      expect(result).toEqual({
        order_id: 100,
        buyer: {
          name: "Rahmi",
          phone: "08123456789",
        },
        items: [
          {
            order_item_id: 200,
            product_name: "Laptop Gaming",
            qty: 1,
            price: 8000000,
            status: "pending",
          },
        ],
        shipping_address: "Balikpapan",
        status: "pending",
      });
    });

    it("should throw 404 when order has no seller items", async () => {
      sellerOrderRepository.findOrderByIdForSeller.mockResolvedValue({
        id: 100,
        buyer: { fullName: "Rahmi", phone: "08123456789" },
        address: { city: "Balikpapan" },
        items: [],
      });

      await expect(sellerOrderService.getSellerOrderById(100, 5)).rejects.toMatchObject({
        message: "Order tidak ditemukan",
        statusCode: 404,
      });
    });
  });

  describe("processOrderItem", () => {
    it("should process order item and return mapped status", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        orderId: 10,
        sellerId: 5,
        status: "menunggu_penjual",
      });
      sellerOrderRepository.updateOrderItemStatus.mockResolvedValue({
        id: 200,
        status: "diproses_penjual",
      });
      sellerOrderRepository.createStatusHistory.mockResolvedValue({});

      const result = await sellerOrderService.processOrderItem(200, 5);

      expect(sellerOrderRepository.updateOrderItemStatus).toHaveBeenCalledWith(200, "diproses_penjual");
      expect(sellerOrderRepository.createStatusHistory).toHaveBeenCalledWith({
        orderId: 10,
        status: "diproses_penjual",
        updatedBy: 5,
      });
      expect(result).toEqual({
        order_item_id: 200,
        status: "processing",
      });
    });

    it("should reject when status is not menunggu_penjual", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        orderId: 10,
        sellerId: 5,
        status: "diproses_penjual",
      });

      await expect(sellerOrderService.processOrderItem(200, 5)).rejects.toMatchObject({
        message: "Status order item tidak valid untuk diproses",
        statusCode: 400,
      });
    });

    it("should reject when seller does not own the item", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        orderId: 10,
        sellerId: 99,
        status: "menunggu_penjual",
      });

      await expect(sellerOrderService.processOrderItem(200, 5)).rejects.toMatchObject({
        message: "Akses ditolak",
        statusCode: 403,
      });
    });
  });

  describe("readyToShipOrderItem", () => {
    it("should mark order item ready to ship per API contract", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        orderId: 10,
        sellerId: 5,
        status: "diproses_penjual",
      });
      sellerOrderRepository.updateOrderItemStatus.mockResolvedValue({
        id: 200,
        status: "menunggu_kurir",
      });
      sellerOrderRepository.createStatusHistory.mockResolvedValue({});

      const result = await sellerOrderService.readyToShipOrderItem(200, 5);

      expect(sellerOrderRepository.updateOrderItemStatus).toHaveBeenCalledWith(200, "menunggu_kurir");
      expect(sellerOrderRepository.createStatusHistory).toHaveBeenCalledWith({
        orderId: 10,
        status: "menunggu_kurir",
        updatedBy: 5,
      });
      expect(result).toEqual({
        order_item_id: 200,
        status: "ready_to_ship",
      });
    });

    it("should reject when status is not diproses_penjual", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        orderId: 10,
        sellerId: 5,
        status: "menunggu_penjual",
      });

      await expect(sellerOrderService.readyToShipOrderItem(200, 5)).rejects.toMatchObject({
        message: "Status order item tidak valid untuk siap kirim",
        statusCode: 400,
      });
    });
  });
});
