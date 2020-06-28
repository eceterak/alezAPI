const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler.middleware');
const errorResponse = require('../utils/ErrorResponse');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/ErrorResponse');

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // make sure token exists
  if (!token) {
    return next(new ErrorResponse('Nie autoryzowany dostęp', 401));
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Nie autoryzowany dostęp', 401));
  }
});

// grant access for specific roles
exports.authorize = (...roles) => {
  return (request, res, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new ErrorResponse(
          `Użytkownik z rolą ${request.user.role} nie jest autoryzowany do wykonania tej akcji`,
          403
        )
      );
    }
    next();
  };
};
