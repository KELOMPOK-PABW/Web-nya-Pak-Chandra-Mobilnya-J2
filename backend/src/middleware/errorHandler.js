const env = require("../config/env");
const logger = require("../utils/logger");

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Resource tidak ditemukan" });
};

const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  logger.error(
    { err, status, path: req.originalUrl, method: req.method },
    "request error"
  );

  const body = {
    success: false,
    message: err.expose || status < 500 ? err.message : "Terjadi kesalahan pada server",
  };

  if (!env.isProd && status >= 500) {
    body.error = err.message;
    body.stack = err.stack;
  }

  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
