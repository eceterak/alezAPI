const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  console.log(err.stack.red);
  console.log(err.name);
  console.log(req.params);

  let error = { ...err };
  error.message = err.message;

  // mongoose bad id
  if (err.name == 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered.`;
    error = new ErrorResponse(message, 400);
  }

  // mongoose validation error
  if (err.name == 'ValidationError') {
    const message = Object.values(err.errors).map(error => error.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server error'
  });
};

module.exports = errorHandler;
