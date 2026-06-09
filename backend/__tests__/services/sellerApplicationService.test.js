const service = require("../../src/services/sellerApplicationService");
const repository = require("../../src/repository/sellerApplicationRepository");

jest.mock("../../src/repository/sellerApplicationRepository");

describe("Seller Application Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("apply", () => {
    it("should successfully apply when user has no pending application", async () => {
      repository.getApplicationByUserId.mockResolvedValue(null);
      repository.createApplication.mockResolvedValue({
        id: 1,
        userId: 123,
        storeName: "Toko Rahmi",
        phone: "08123456789",
        status: "pending",
        createdAt: new Date("2026-04-09T10:00:00Z")
      });

      const data = { store_name: "Toko Rahmi", phone: "08123456789" };
      const result = await service.apply(123, data);

      expect(repository.getApplicationByUserId).toHaveBeenCalledWith(123);
      expect(repository.createApplication).toHaveBeenCalledWith({
        userId: 123,
        storeName: "Toko Rahmi",
        phone: "08123456789",
        status: "pending"
      });
      expect(result.id).toBe(1);
      expect(result.store_name).toBe("Toko Rahmi");
    });

    it("should throw error if user already has pending application", async () => {
      repository.getApplicationByUserId.mockResolvedValue({ status: "pending" });

      const data = { store_name: "Toko Baru", phone: "12345" };
      await expect(service.apply(123, data)).rejects.toThrow("Anda sudah memiliki pengajuan yang sedang diproses");
      
      expect(repository.createApplication).not.toHaveBeenCalled();
    });
  });

  describe("getApplications", () => {
    it("should return a list of applications", async () => {
      repository.getApplications.mockResolvedValue([{
        id: 1,
        storeName: "Toko Rahmi",
        phone: "08123456789",
        status: "pending",
        createdAt: "2026-04-09T10:00:00Z"
      }]);

      const result = await service.getApplications();
      expect(result.length).toBe(1);
      expect(result[0].store_name).toBe("Toko Rahmi");
    });
  });

  describe("approve", () => {
    it("should approve application, create store, and update role", async () => {
      repository.getApplicationById.mockResolvedValue({
        id: 1,
        userId: 123,
        storeName: "Toko Rahmi",
        phone: "08123456789",
        status: "pending"
      });
      repository.getRoleByName.mockResolvedValue({ id: 2, nameRole: "seller" });
      
      repository.$transaction.mockImplementation(async (cb) => {
        return await cb({}); // pass mock prisma
      });

      const result = await service.approve(1);
      expect(result.status).toBe("approved");

      expect(repository.updateApplicationStatus).toHaveBeenCalledWith(1, "approved", expect.anything());
      expect(repository.createStore).toHaveBeenCalledWith({
        userId: 123,
        storeName: "Toko Rahmi",
        phone: "08123456789",
        isActive: true
      }, expect.anything());
      expect(repository.updateUserRole).toHaveBeenCalledWith(123, "seller", expect.anything());
      expect(repository.addUserRoleMap).toHaveBeenCalledWith(123, 2, expect.anything());
    });

    it("should throw if application not found", async () => {
      repository.getApplicationById.mockResolvedValue(null);
      await expect(service.approve(99)).rejects.toThrow("Pengajuan tidak ditemukan");
    });

    it("should throw if application is not pending", async () => {
      repository.getApplicationById.mockResolvedValue({ status: "approved" });
      await expect(service.approve(1)).rejects.toThrow("Pengajuan sudah berstatus approved");
    });
  });

  describe("reject", () => {
    it("should reject application and update status", async () => {
      repository.getApplicationById.mockResolvedValue({
        id: 1,
        status: "pending"
      });
      repository.updateApplicationStatus.mockResolvedValue();

      const result = await service.reject(1, "Data tidak lengkap");
      expect(result.status).toBe("rejected");
      expect(repository.updateApplicationStatus).toHaveBeenCalledWith(1, "rejected");
    });
  });
});
