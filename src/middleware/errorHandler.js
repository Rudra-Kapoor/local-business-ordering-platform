// Generic 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

// Central error handler to avoid leaking stack traces in production
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error", err);
  const status = err.statusCode || 500;
  const message = err.message || "Server error";
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };

