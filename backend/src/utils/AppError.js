/**
 * Application-level error with an HTTP status code.
 *
 * Throw this from services instead of plain `new Error("message")` so
 * controllers and the error-handler middleware can set the correct HTTP
 * status without fragile string-matching on `error.message`.
 *
 * @example
 *   throw new AppError("Produk tidak ditemukan", 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
