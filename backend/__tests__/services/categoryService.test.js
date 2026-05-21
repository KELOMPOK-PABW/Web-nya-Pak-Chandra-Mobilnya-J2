const categoryService = require("../../src/services/categoryService");
const categoryRepository = require("../../src/repository/categoryRepository");

jest.mock("../../src/repository/categoryRepository");

describe("CategoryService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCategories", () => {
    it("should return all categories with category_name field", async () => {
      const mockCategories = [
        { id: 1, name: "Elektronik", description: "Barang elektronik", createdAt: new Date() },
        { id: 2, name: "Fashion", description: "Pakaian dan aksesoris", createdAt: new Date() },
      ];

      categoryRepository.findAll.mockResolvedValue(mockCategories);

      const result = await categoryService.getAllCategories();

      expect(result).toHaveLength(2);
      expect(result[0].category_name).toBe("Elektronik");
      expect(result[1].category_name).toBe("Fashion");
      expect(result[0]).not.toHaveProperty("name");
      expect(result[0]).not.toHaveProperty("description");
      expect(categoryRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no categories exist", async () => {
      categoryRepository.findAll.mockResolvedValue([]);
      const result = await categoryService.getAllCategories();
      expect(result).toHaveLength(0);
    });
  });

  describe("getCategoryById", () => {
    it("should return category with category_name field", async () => {
      categoryRepository.findById.mockResolvedValue({
        id: 1, name: "Elektronik", description: "", createdAt: new Date(),
      });

      const result = await categoryService.getCategoryById(1);
      expect(result.id).toBe(1);
      expect(result.category_name).toBe("Elektronik");
      expect(result).not.toHaveProperty("name");
    });

    it("should throw error for invalid ID", async () => {
      await expect(categoryService.getCategoryById(null)).rejects.toThrow("Category ID tidak valid");
      await expect(categoryService.getCategoryById("abc")).rejects.toThrow("Category ID tidak valid");
    });

    it("should throw error when category not found", async () => {
      categoryRepository.findById.mockResolvedValue(null);
      await expect(categoryService.getCategoryById(999)).rejects.toThrow("Kategori tidak ditemukan");
    });
  });

  describe("createCategory", () => {
    it("should create category from category_name field", async () => {
      categoryRepository.findByName.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue({
        id: 1, name: "Elektronik", description: "", createdAt: new Date(),
      });

      const result = await categoryService.createCategory({ category_name: "Elektronik" });

      expect(result.category_name).toBe("Elektronik");
      expect(categoryRepository.create).toHaveBeenCalledWith({ name: "Elektronik" });
    });

    it("should throw error when category name already exists", async () => {
      categoryRepository.findByName.mockResolvedValue({ id: 1, name: "Elektronik" });
      await expect(
        categoryService.createCategory({ category_name: "Elektronik" })
      ).rejects.toThrow("Kategori dengan nama tersebut sudah ada");
    });
  });

  describe("updateCategory", () => {
    it("should update category from category_name field", async () => {
      categoryRepository.findById.mockResolvedValue({ id: 1, name: "Elektronik" });
      categoryRepository.findByName.mockResolvedValue(null);
      categoryRepository.update.mockResolvedValue({
        id: 1, name: "Gadget", description: "", createdAt: new Date(),
      });

      const result = await categoryService.updateCategory(1, { category_name: "Gadget" });
      expect(result.category_name).toBe("Gadget");
      expect(categoryRepository.update).toHaveBeenCalledWith(1, { name: "Gadget" });
    });

    it("should throw error when category not found", async () => {
      categoryRepository.findById.mockResolvedValue(null);
      await expect(
        categoryService.updateCategory(999, { category_name: "Test" })
      ).rejects.toThrow("Kategori tidak ditemukan");
    });

    it("should throw error when duplicate name on update", async () => {
      categoryRepository.findById.mockResolvedValue({ id: 1, name: "Elektronik" });
      categoryRepository.findByName.mockResolvedValue({ id: 2, name: "Fashion" });
      await expect(
        categoryService.updateCategory(1, { category_name: "Fashion" })
      ).rejects.toThrow("Kategori dengan nama tersebut sudah ada");
    });

    it("should skip duplicate check when name unchanged", async () => {
      categoryRepository.findById.mockResolvedValue({ id: 1, name: "Elektronik" });
      categoryRepository.update.mockResolvedValue({
        id: 1, name: "Elektronik", description: "", createdAt: new Date(),
      });

      const result = await categoryService.updateCategory(1, { category_name: "Elektronik" });
      expect(result.category_name).toBe("Elektronik");
      expect(categoryRepository.findByName).not.toHaveBeenCalled();
    });
  });
});
