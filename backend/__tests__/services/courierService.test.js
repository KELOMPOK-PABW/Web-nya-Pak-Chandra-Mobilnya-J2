const courierService = require("../../src/services/courierService");
const courierRepository = require("../../src/repository/courierRepository");
const sellerOrderRepository = require("../../src/repository/sellerOrderRepository");
const authRepository = require("../../src/repository/authRepository");

jest.mock("../../src/repository/courierRepository");
jest.mock("../../src/repository/sellerOrderRepository");
jest.mock("../../src/repository/authRepository");

describe("CourierService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("assignCourier", () => {
    const assignedAt = new Date("2024-04-09T12:30:00Z");

    it("should assign courier to order item per API contract", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        orderId: 100,
        status: "menunggu_kurir",
      });
      courierRepository.findAssignmentByOrderItemId.mockResolvedValue(null);
      authRepository.findUserById.mockResolvedValue({
        id: 45,
        isActive: true,
        roles: [{ role: { nameRole: "kurir" } }],
      });
      courierRepository.createAssignment.mockResolvedValue({
        id: 1,
        orderItemId: 200,
        kurirId: 45,
        assignedAt,
      });

      const result = await courierService.assignCourier({
        orderItemId: 200,
        kurirId: 45,
        requesterRole: "admin",
      });

      expect(courierRepository.createAssignment).toHaveBeenCalledWith({
        orderItemId: 200,
        kurirId: 45,
      });
      expect(result).toEqual({
        id: 1,
        order_item_id: 200,
        kurir_id: 45,
        assigned_at: assignedAt,
      });
    });

    it("should reject non-admin users", async () => {
      await expect(
        courierService.assignCourier({
          orderItemId: 200,
          kurirId: 45,
          requesterRole: "kurir",
        })
      ).rejects.toMatchObject({
        message: "Akses ditolak",
        statusCode: 403,
      });
    });

    it("should throw 404 when order item is missing", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue(null);

      await expect(
        courierService.assignCourier({
          orderItemId: 200,
          kurirId: 45,
          requesterRole: "admin",
        })
      ).rejects.toMatchObject({
        message: "Order item tidak ditemukan",
        statusCode: 404,
      });
    });

    it("should throw 400 when order item is not ready for courier", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        status: "diproses_penjual",
      });

      await expect(
        courierService.assignCourier({
          orderItemId: 200,
          kurirId: 45,
          requesterRole: "admin",
        })
      ).rejects.toMatchObject({
        message: "Order item belum siap ditugaskan ke kurir",
        statusCode: 400,
      });
    });

    it("should throw 409 when courier is already assigned", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        status: "menunggu_kurir",
      });
      courierRepository.findAssignmentByOrderItemId.mockResolvedValue({ id: 99 });

      await expect(
        courierService.assignCourier({
          orderItemId: 200,
          kurirId: 45,
          requesterRole: "admin",
        })
      ).rejects.toMatchObject({
        message: "Kurir sudah ditugaskan untuk order item ini",
        statusCode: 409,
      });
    });

    it("should throw 400 when target user is not kurir", async () => {
      sellerOrderRepository.findOrderItemById.mockResolvedValue({
        id: 200,
        status: "menunggu_kurir",
      });
      courierRepository.findAssignmentByOrderItemId.mockResolvedValue(null);
      authRepository.findUserById.mockResolvedValue({
        id: 45,
        isActive: true,
        roles: [{ role: { nameRole: "buyer" } }],
      });

      await expect(
        courierService.assignCourier({
          orderItemId: 200,
          kurirId: 45,
          requesterRole: "admin",
        })
      ).rejects.toMatchObject({
        message: "User bukan kurir",
        statusCode: 400,
      });
    });
  });

  describe("getAssignmentDetail", () => {
    it("should return assignment detail per API contract", async () => {
      const assignedAt = new Date("2024-04-09T12:30:00Z");
      courierRepository.findAssignmentById.mockResolvedValue({
        id: 1,
        kurirId: 3,
        orderItemId: 1,
        assignedAt,
        pickupAt: new Date("2024-04-09T13:00:00Z"),
        deliveredAt: null,
        orderItem: { status: "sedang_dikirim" },
      });

      const result = await courierService.getAssignmentDetail(1, "admin");

      expect(result).toEqual({
        assignment_id: 1,
        courier_id: 3,
        order_item_id: 1,
        status: "sedang dikirim",
        assigned_at: assignedAt,
      });
    });

    it("should reject non-admin users", async () => {
      await expect(courierService.getAssignmentDetail(1, "kurir")).rejects.toMatchObject({
        message: "Akses ditolak",
        statusCode: 403,
      });
    });

    it("should throw 404 when assignment is missing", async () => {
      courierRepository.findAssignmentById.mockResolvedValue(null);

      await expect(courierService.getAssignmentDetail(99, "admin")).rejects.toMatchObject({
        message: "Assignment tidak ditemukan",
        statusCode: 404,
      });
    });
  });

  describe("getCourierTasks", () => {
    it("should return courier task list per API contract", async () => {
      courierRepository.findAssignmentsByKurirId.mockResolvedValue([
        {
          id: 1,
          orderItemId: 1,
          pickupAt: null,
          deliveredAt: null,
          orderItem: {
            productNameSnap: "Sepatu",
            product: { name: "Sepatu" },
            status: "menunggu_kurir",
            seller: {
              fullName: "Toko Owner",
              stores: [{ storeName: "Toko A" }],
            },
            order: {
              address: { address: "Jl. Merdeka", city: "Balikpapan" },
            },
          },
        },
      ]);

      const result = await courierService.getCourierTasks(45);

      expect(courierRepository.findAssignmentsByKurirId).toHaveBeenCalledWith(45);
      expect(result).toEqual([
        {
          assignment_id: 1,
          order_item_id: 1,
          product_name: "Sepatu",
          pickup_address: "Toko A",
          delivery_address: "Balikpapan",
          status: "menunggu kurir",
        },
      ]);
    });
  });

  describe("pickup", () => {
    it("should update pickup status for assigned courier", async () => {
      courierRepository.findAssignmentByOrderItemId.mockResolvedValue({
        id: 10,
        kurirId: 5,
        orderItemId: 200,
        pickupAt: null,
      });
      sellerOrderRepository.findOrderItemById.mockResolvedValue({ id: 200, orderId: 100 });
      courierRepository.updatePickup.mockResolvedValue({});
      sellerOrderRepository.updateOrderItemStatus.mockResolvedValue({});
      sellerOrderRepository.createStatusHistory.mockResolvedValue({});

      const result = await courierService.pickup(200, 5);

      expect(sellerOrderRepository.updateOrderItemStatus).toHaveBeenCalledWith(200, "sedang_dikirim");
      expect(result.status).toBe("sedang_dikirim");
      expect(result.pickup_at).toBeInstanceOf(Date);
    });

    it("should reject courier that does not own the assignment", async () => {
      courierRepository.findAssignmentByOrderItemId.mockResolvedValue({
        id: 10,
        kurirId: 5,
        orderItemId: 200,
        pickupAt: null,
      });

      await expect(courierService.pickup(200, 99)).rejects.toMatchObject({
        message: "Akses ditolak",
        statusCode: 403,
      });
    });
  });
});
