const User = require('../models/User.model');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const ErrorResponse = require('../utils/ErrorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// register user
// POST /api/v1/auth/register
// public
exports.register = asyncHandler(async (request, res, next) => {
  const { name, email, password, role } = request.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// login user
// POST /api/v1/auth/login
// public
exports.login = asyncHandler(async (request, res, next) => {
  const { email, password } = request.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Proszę podaj login i hasło', 400));
  }

  // check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Błędny login lub hasło', 401));
  }

  // check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Błędny login lub hasło', 401));
  }

  // create token
  const token = user.getSignedJwtToken();

  sendTokenResponse(user, 200, res);
});

// logout user
// GET /api/v1/auth/logout
// private
exports.logout = asyncHandler(async (request, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// get logged user
// POST /api/v1/auth/me
// private
exports.me = asyncHandler(async (request, res, next) => {
  const user = await User.findById(request.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// update user details
// PUT /api/v1/auth/updateDetails
// private
exports.updateDetails = asyncHandler(async (request, res, next) => {
  const fieldsToUpdate = {
    name: request.body.name,
    email: request.body.email
  };

  const user = await User.findByIdAndUpdate(request.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// update user details
// PUT /api/v1/auth/updatePassword
// private
exports.updatePassword = asyncHandler(async (request, res, next) => {
  const user = await User.findById(request.user.id).select('+password');

  // check current password
  if (!(await user.matchPassword(request.body.currentPassword))) {
    return next(new ErrorResponse('Hasło jest nie prawidłowe', 401));
  }

  user.password = request.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// forgot password
// POST /api/v1/auth/forgotpassword
// public
exports.forgotPassword = asyncHandler(async (request, res, next) => {
  const user = await User.findOne({ email: request.body.email });

  if (!user) {
    return next(
      new ErrorResponse('Użytkownik z takim adresem email nie znaleziony', 404)
    );
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // create reset url
  const resetUrl = `${request.protocol}://${request.get(
    'host'
  )}//api/v1/auth/resetpassword/${resetToken}`;

  const message = `PUT request to ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password email token`,
      message
    });

    return res.status(200).json({
      success: true,
      data: 'Email wysłany'
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email nie mógł zostać wyłany', 500));
  }
});

// reset password
// PUT /api/v1/auth/resetpassword/:token
// public
exports.resetPassword = asyncHandler(async (request, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  console.log(resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse(`Nie znaleziono użytkownika`, 400));
  }

  user.password = request.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });

  if (process.env.NODE_ENV == 'production') {
    options.secure = true;
  }
};
