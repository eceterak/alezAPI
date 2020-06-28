const City = require('../models/City.model');
const Advert = require('../models/Advert.model');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const ErrorResponse = require('../utils/ErrorResponse');

// get all cities
// GET /api/v1/cities
// public
exports.getCities = asyncHandler(async (request, res, next) => {
  res.status(200).json(res.advancedResults);

  // const result = await City.find().populate('adverts');

  // res.status(200).json({
  //   success: true,
  //   count: result.length,
  //   data: result
  // });
});

// create new city
// POST /api/v1/cities
// public
exports.createCity = asyncHandler(async (request, res, next) => {
  const city = await City.create(request.body);

  res.status(200).json({
    success: true,
    data: city
  });
});

// get single city
// GET /api/v1/cities/:id
// public
exports.getCity = asyncHandler(async (request, res, next) => {
  const city = await City.findById(request.params.id).populate({
    path: 'advert',
    select: 'title cost'
  });

  if (!city) {
    return next(
      new ErrorResponse(`No city with id of ${request.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: city
  });
});

// update city
// PUT /api/v1/cities/:id
// public
exports.updateCity = asyncHandler(async (request, res, next) => {
  const city = await City.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!city) {
    return next(
      new ErrorResponse(`City not found with id of ${request.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: city });
});

// delete city
// DELETE /api/v1/cities/:id
// public
exports.deleteCity = asyncHandler(async (request, res, next) => {
  const city = await City.findById(request.params.id);

  if (!city) {
    return next(
      new ErrorResponse(`City not found with id of ${request.params.id}`, 404)
    );
  }

  city.remove();

  res.status(200).json({ success: true, data: {} });
});
