const productService = require("../../src/services/productService");
const productRepository = require("../../src/repository/productRepository");
const categoryRepository = require("../../src/repository/categoryRepository");

jest.mock("../../src/repository/productRepository");
jest.mock("../../src/repository/categoryRepository");

describe("ProductService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllProducts", () => {
    it("should return paginated products with category_name", async () => {
      const mockProducts = [
        {
          id: 1, name: "Produk A", description: "Deskripsi A", price: 10000,
          stock: 5, stockStatus: "tersedia", imageUrl: "https://example.com/a.jpg",
          category: { id: 1, name: "Elektronik" },
          seller: { id: 1, full_name: "Toko A" },
        },
      ];

      productRepository.getAllProducts.mockResolvedValue(mockProducts);
      productRepository.countProducts.mockResolvedValue(1);

      const result = await productService.getAllProducts({ page: 1, limit: 10 });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].category.category_name).toBe("Elektronik");
      expect(result.products[0].category).not.toHaveProperty("name");
      expect(result.meta.total_items).toBe(1);
    });

    it("should throw error when no products found", async () => {
      productRepository.getAllProducts.mockResolvedValue([]);
      productRepository.countProducts.mockResolvedValue(0);
      await expect(
        productService.getAllProducts({ page: 1, limit: 10 })
      ).rejects.toThrow("Tidak ada produk yang ditemukan");
    });

    it("should pass keyword and price filters", async () => {
      productRepository.getAllProducts.mockResolvedValue([
        {
          id: 1, name: "Laptop", description: "", price: 5000000,
          stock: 3, stockStatus: "tersedia", imageUrl: "",
          category: null, seller: { id: 1, full_name: "Toko A" },
        },
      ]);
      productRepository.countProducts.mockResolvedValue(1);

      await productService.getAllProducts({
        page: 1, limit: 10, keyword: "Laptop", minPrice: 1000000, maxPrice: 10000000,
      });

      expect(productRepository.getAllProducts).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: "Laptop", minPrice: 1000000, maxPrice: 10000000 })
      );
    });
  });

  describe("getProductById", () => {
    it("should return product detail with desc field", async () => {
      productRepository.findProductById.mockResolvedValue({
        id: 1, name: "Produk A", description: "Deskripsi A", price: 10000,
        stock: 5, imageUrl: "", category: { id: 1, name: "Elektronik" },
        seller: { id: 1, full_name: "Toko A" },
      });

      const result = await productService.getProductById(1);
      expect(result.desc).toBe("Deskripsi A");
      expect(result.category.category_name).toBe("Elektronik");
    });

    it("should throw error for invalid product ID", async () => {
      await expect(productService.getProductById(null)).rejects.toThrow("Product ID tidak valid");
    });

    it("should throw error when product not found", async () => {
      productRepository.findProductById.mockResolvedValue(null);
      await expect(productService.getProductById(999)).rejects.toThrow("Produk tidak ditemukan");
    });
  });

  describe("createProduct", () => {
    it("should create product with desc field and validate category", async () => {
      categoryRepository.findById.mockResolvedValue({ id: 1, name: "Elektronik" });
      productRepository.createProduct.mockResolvedValue({
        id: 1, name: "Laptop Gaming", description: "Spek tinggi", price: 8000000,
        stock: 5, stockStatus: "tersedia", imageUrl: "", sellerId: 1,
        category: { id: 1, name: "Elektronik" }, seller: { id: 1, full_name: "Toko A" },
      });

      const result = await productService.createProduct(
        { name: "Laptop Gaming", desc: "Spek tinggi", price: 8000000, stock: 5, category_id: 1 }, 1
      );

      expect(result.name).toBe("Laptop Gaming");
      expect(result.desc).toBe("Spek tinggi");
      expect(categoryRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should throw error when category not found", async () => {
      categoryRepository.findById.mockResolvedValue(null);
      await expect(
        productService.createProduct(
          { name: "Test", desc: "", price: 1000, stock: 1, category_id: 999 }, 1
        )
      ).rejects.toThrow("Kategori tidak ditemukan");
    });

    it("should pass data through when all fields provided", async () => {
      categoryRepository.findById.mockResolvedValue({ id: 1, name: "Test" });
      productRepository.createProduct.mockResolvedValue({
        id: 2, name: "Test", description: "", price: 1000, stock: 1,
        stockStatus: "tersedia", imageUrl: "", sellerId: 1,
        category: { id: 1, name: "Test" }, seller: { id: 1, full_name: "Toko A" },
      });

      const result = await productService.createProduct(
        { name: "Test", price: 1000, stock: 1, category_id: 1 }, 1
      );
      expect(result.name).toBe("Test");
    });

    it("should set stockStatus to habis when stock is 0", async () => {
      categoryRepository.findById.mockResolvedValue({ id: 1, name: "Test" });
      productRepository.createProduct.mockResolvedValue({
        id: 1, name: "Habis", description: "", price: 5000, stock: 0,
        stockStatus: "habis", imageUrl: "", sellerId: 1,
        category: { id: 1, name: "Test" }, seller: { id: 1, full_name: "Toko A" },
      });

      await productService.createProduct(
        { name: "Habis", price: 5000, stock: 0, category_id: 1 }, 1
      );

      expect(productRepository.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ stockStatus: "habis" })
      );
    });
  });

  describe("updateProduct", () => {
    it("should update product and validate category", async () => {
      productRepository.findProductById.mockResolvedValue({
        id: 1, name: "Old", sellerId: 1, category: null,
        seller: { id: 1, full_name: "Toko A" },
      });
      categoryRepository.findById.mockResolvedValue({ id: 2, name: "Fashion" });
      productRepository.updateProduct.mockResolvedValue({
        id: 1, name: "New", description: "", price: 20000, stock: 5,
        imageUrl: "", category: { id: 2, name: "Fashion" },
        seller: { id: 1, full_name: "Toko A" },
      });

      const result = await productService.updateProduct(1, { name: "New", category_id: 2 }, 1);
      expect(result.name).toBe("New");
      expect(categoryRepository.findById).toHaveBeenCalledWith(2);
    });

    it("should throw error when not the owner", async () => {
      productRepository.findProductById.mockResolvedValue({ id: 1, sellerId: 2 });
      await expect(
        productService.updateProduct(1, { name: "Test" }, 1)
      ).rejects.toThrow("Akses ditolak: bukan produk Anda");
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      productRepository.findProductById.mockResolvedValue({ id: 1, sellerId: 1 });
      productRepository.deleteProduct.mockResolvedValue({});
      await productService.deleteProduct(1, 1);
      expect(productRepository.deleteProduct).toHaveBeenCalledWith(1);
    });

    it("should throw error when not the owner", async () => {
      productRepository.findProductById.mockResolvedValue({ id: 1, sellerId: 2 });
      await expect(productService.deleteProduct(1, 1)).rejects.toThrow("Akses ditolak: bukan produk Anda");
    });
  });
});
