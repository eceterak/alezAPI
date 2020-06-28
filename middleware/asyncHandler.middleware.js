// When used, it will return a inner function which is later run by express as middleware.
// Express will always pass req, res, next,
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
