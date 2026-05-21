const reviewService = require("../services/reviewService");
const { createReviewSchema, updateReviewSchema } = require("../validations/reviewValidation");

const createReview = async (req, res) => {
  try {
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const userId = req.user.id;
    const result = await reviewService.createReview(value, userId);

    return res.status(201).json({
      message: "Review berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Akses ditolak" ? 403 :
                        error.message === "Order item tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getAllReviews({ page, limit });
    return res.status(200).json({ success: true, data: result.reviews, meta: result.meta });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewService.getReviewById(Number(id));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.message === "Review tidak ditemukan" ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const userId = req.user.id;
    const result = await reviewService.updateReview(Number(id), value, userId);
    return res.status(200).json({
      message: "Review berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    const statusCode = error.message === "Review tidak ditemukan" ? 404 :
                        error.message === "Akses ditolak" ? 403 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await reviewService.deleteReview(Number(id), userId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.message === "Review tidak ditemukan" ? 404 :
                        error.message === "Akses ditolak" ? 403 : 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getMyReviews(userId, { page, limit });
    return res.status(200).json({ data: result.reviews });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getProductReviews(Number(id), { page, limit });
    return res.status(200).json({
      message: "List review produk",
      data: result.reviews,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewService.getProductRating(Number(id));
    return res.status(200).json({
      message: "Rating produk",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getMyReviews,
  getProductReviews,
  getProductRating,
};
