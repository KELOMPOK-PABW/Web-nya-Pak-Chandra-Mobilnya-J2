const reviewService = require("../../src/services/reviewService");
const reviewRepository = require("../../src/repository/reviewRepository");

jest.mock("../../src/repository/reviewRepository");

describe("ReviewService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    it("should create review via order_item_id", async () => {
      reviewRepository.findOrderItemById.mockResolvedValue({
        id: 1,
        productId: 10,
        status: "diterima_pembeli",
        product: { id: 10, name: "Produk A" },
        order: { id: 5, buyerId: 1 },
      });
      reviewRepository.findExistingReviewByOrderItem.mockResolvedValue(null);
      reviewRepository.create.mockResolvedValue({
        id: 1, rating: 5, comment: "Bagus banget",
        createdAt: new Date(), updatedAt: new Date(),
        product: { id: 10, name: "Produk A" },
        reviewer: { id: 1, full_name: "User A" },
      });

      const result = await reviewService.createReview(
        { order_item_id: 1, rating: 5, comment: "Bagus banget" }, 1
      );

      expect(result.review_id).toBe(1);
      expect(result.rating).toBe(5);
      expect(result.comment).toBe("Bagus banget");
    });

    it("should throw when order_item not found", async () => {
      reviewRepository.findOrderItemById.mockResolvedValue(null);
      await expect(
        reviewService.createReview({ order_item_id: 999, rating: 5 }, 1)
      ).rejects.toThrow("Order item tidak ditemukan");
    });

    it("should throw when order_item not owned by user", async () => {
      reviewRepository.findOrderItemById.mockResolvedValue({
        id: 1, productId: 10, status: "diterima_pembeli",
        product: { id: 10, name: "Produk A" },
        order: { id: 5, buyerId: 2 },
      });
      await expect(
        reviewService.createReview({ order_item_id: 1, rating: 5 }, 1)
      ).rejects.toThrow("Akses ditolak");
    });

    it("should throw when order status is not diterima_pembeli", async () => {
      reviewRepository.findOrderItemById.mockResolvedValue({
        id: 1, productId: 10, status: "sedang_dikirim",
        product: { id: 10, name: "Produk A" },
        order: { id: 5, buyerId: 1 },
      });
      await expect(
        reviewService.createReview({ order_item_id: 1, rating: 5 }, 1)
      ).rejects.toThrow("Belum bisa review");
    });

    it("should throw when already reviewed this order_item", async () => {
      reviewRepository.findOrderItemById.mockResolvedValue({
        id: 1, productId: 10, status: "diterima_pembeli",
        product: { id: 10, name: "Produk A" },
        order: { id: 5, buyerId: 1 },
      });
      reviewRepository.findExistingReviewByOrderItem.mockResolvedValue({ id: 1 });
      await expect(
        reviewService.createReview({ order_item_id: 1, rating: 5 }, 1)
      ).rejects.toThrow("Sudah pernah review");
    });
  });

  describe("getProductReviews", () => {
    it("should return reviews with user.name format", async () => {
      reviewRepository.findByProductId.mockResolvedValue([
        {
          id: 1, rating: 5, comment: "Bagus",
          createdAt: new Date(), updatedAt: new Date(),
          reviewer: { id: 1, full_name: "Rahmi" },
        },
      ]);
      reviewRepository.countByProductId.mockResolvedValue(1);

      const result = await reviewService.getProductReviews(1, { page: 1, limit: 10 });

      expect(result.reviews[0].user.name).toBe("Rahmi");
      expect(result.reviews[0]).not.toHaveProperty("reviewer");
    });
  });

  describe("getMyReviews", () => {
    it("should return reviews with product_name format", async () => {
      reviewRepository.findByReviewerId.mockResolvedValue([
        {
          id: 1, rating: 4, comment: "Lumayan",
          createdAt: new Date(), updatedAt: new Date(),
          product: { id: 10, name: "Sepatu" },
        },
      ]);
      reviewRepository.countByReviewerId.mockResolvedValue(1);

      const result = await reviewService.getMyReviews(1, { page: 1, limit: 10 });

      expect(result.reviews[0].product_name).toBe("Sepatu");
      expect(result.reviews[0].rating).toBe(4);
    });
  });

  describe("updateReview", () => {
    it("should return is_edited: true", async () => {
      reviewRepository.findById.mockResolvedValue({
        id: 1, reviewerId: 1, rating: 3, comment: "Biasa",
        createdAt: new Date(), updatedAt: new Date(),
        product: { id: 1, name: "Produk A" },
        reviewer: { id: 1, full_name: "User A" },
      });
      reviewRepository.update.mockResolvedValue({
        id: 1, rating: 5, comment: "Ternyata bagus!",
        createdAt: new Date(), updatedAt: new Date(),
        product: { id: 1, name: "Produk A" },
        reviewer: { id: 1, full_name: "User A" },
      });

      const result = await reviewService.updateReview(1, { rating: 5, comment: "Ternyata bagus!" }, 1);

      expect(result.review_id).toBe(1);
      expect(result.rating).toBe(5);
      expect(result.is_edited).toBe(true);
    });

    it("should throw when not the reviewer", async () => {
      reviewRepository.findById.mockResolvedValue({ id: 1, reviewerId: 2 });
      await expect(
        reviewService.updateReview(1, { rating: 5 }, 1)
      ).rejects.toThrow("Akses ditolak");
    });

    it("should throw when review not found", async () => {
      reviewRepository.findById.mockResolvedValue(null);
      await expect(
        reviewService.updateReview(999, { rating: 5 }, 1)
      ).rejects.toThrow("Review tidak ditemukan");
    });
  });

  describe("deleteReview", () => {
    it("should delete review successfully", async () => {
      reviewRepository.findById.mockResolvedValue({ id: 1, reviewerId: 1 });
      reviewRepository.deleteById.mockResolvedValue({});
      const result = await reviewService.deleteReview(1, 1);
      expect(result.message).toBe("Review berhasil dihapus");
    });

    it("should throw when not the owner", async () => {
      reviewRepository.findById.mockResolvedValue({ id: 1, reviewerId: 2 });
      await expect(reviewService.deleteReview(1, 1)).rejects.toThrow("Akses ditolak");
    });
  });

  describe("getProductRating", () => {
    it("should return average_rating and total_reviews", async () => {
      reviewRepository.getAverageRatingByProductId.mockResolvedValue({
        average_rating: 4.5,
        total_reviews: 20,
      });

      const result = await reviewService.getProductRating(1);
      expect(result.average_rating).toBe(4.5);
      expect(result.total_reviews).toBe(20);
    });

    it("should return 0 when no reviews", async () => {
      reviewRepository.getAverageRatingByProductId.mockResolvedValue({
        average_rating: 0,
        total_reviews: 0,
      });

      const result = await reviewService.getProductRating(999);
      expect(result.average_rating).toBe(0);
      expect(result.total_reviews).toBe(0);
    });
  });
});
