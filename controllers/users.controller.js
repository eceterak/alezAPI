const User = require('../models/User.model');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const ErrorResponse = require('../utils/ErrorResponse');

// get all users
// GET /api/v1/users
// private/admin
exports.getUsers = asyncHandler(async (request, res, next) => {
  res.status(200).json(res.advancedResults);
});

// get single users
// GET /api/v1/users/:id
// private/admin
exports.getUser = asyncHandler(async (request, res, next) => {
  const user = await User.findById(request.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// create users
// POST /api/v1/users
// private/admin
exports.createUser = asyncHandler(async (request, res, next) => {
  const user = await User.create(request.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// update user
// PUT /api/v1/users/:id
// private/admin
exports.updateUser = asyncHandler(async (request, res, next) => {
  const user = await User.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// delete user
// PUT /api/v1/users/:id
// private/admin
exports.deleteUser = asyncHandler(async (request, res, next) => {
  await User.findByIdAndDelete(request.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
