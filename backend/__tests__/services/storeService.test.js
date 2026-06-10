const storeService = require("../../src/services/storeService");
const storeRepository = require("../../src/repository/storeRepository");

jest.mock("../../src/repository/storeRepository");

describe("StoreService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyStore", () => {
    it("should return store data for the seller", async () => {
      const createdAt = new Date("2026-04-09T10:00:00Z");
      storeRepository.findByUserId.mockResolvedValue({
        id: 10,
        storeName: "Toko Rahmi",
        phone: "08123456789",
        isActive: true,
        createdAt,
      });

      const result = await storeService.getMyStore(1);

      expect(result).toEqual({
        id: 10,
        store_name: "Toko Rahmi",
        phone: "08123456789",
        is_active: true,
        created_at: createdAt,
      });
    });

    it("should throw 404 when store not found", async () => {
      storeRepository.findByUserId.mockResolvedValue(null);

      await expect(storeService.getMyStore(1)).rejects.toMatchObject({
        message: "Toko tidak ditemukan",
        statusCode: 404,
      });
    });
  });

  describe("updateMyStore", () => {
    it("should update store and return updated fields", async () => {
      const updatedAt = new Date("2026-04-09T11:00:00Z");
      storeRepository.findByUserId.mockResolvedValue({
        id: 10,
        storeName: "Toko Rahmi",
        phone: "08123456789",
      });
      storeRepository.updateByUserId.mockResolvedValue({
        id: 10,
        storeName: "Toko Rahmi Update",
        phone: "081298765432",
        updatedAt,
      });

      const result = await storeService.updateMyStore(1, {
        store_name: "Toko Rahmi Update",
        phone: "081298765432",
      });

      expect(storeRepository.updateByUserId).toHaveBeenCalledWith(1, {
        storeName: "Toko Rahmi Update",
        phone: "081298765432",
      });
      expect(result).toEqual({
        id: 10,
        store_name: "Toko Rahmi Update",
        phone: "081298765432",
        updated_at: updatedAt,
      });
    });

    it("should throw 404 when store not found", async () => {
      storeRepository.findByUserId.mockResolvedValue(null);

      await expect(
        storeService.updateMyStore(1, { store_name: "Toko Baru" })
      ).rejects.toMatchObject({
        message: "Toko tidak ditemukan",
        statusCode: 404,
      });
    });
  });
});
