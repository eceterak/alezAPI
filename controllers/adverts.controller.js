const Advert = require('../models/Advert.model');
const City = require('../models/City.model');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const geocoder = require('../utils/geocoder');
const path = require('path');

// get all adverts
// GET /api/v1/adverts
// GET /api/v1/cities/:city/adverts
// public
exports.getAdverts = asyncHandler(async (request, res, next) => {
  if (request.params.city) {
    const adverts = await Advert.find({ city: request.params.city }).populate(
      'city'
    );

    return res.status(200).json({
      success: true,
      count: adverts.length,
      data: adverts
    });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

// create new advert
// POST /api/v1/cities/:city/adverts
// private
exports.createAdvert = asyncHandler(async (request, res, next) => {
  request.body.city = request.params.city;

  // add user to body
  request.body.user = request.user.id;

  const city = await City.findById(request.params.city);

  if (!city) {
    return next(
      new ErrorResponse(`No city with id of ${request.params.city}`),
      404
    );
  }

  const advert = await Advert.create(request.body);

  res
    .status(201)
    .json({ success: true, data: advert, msg: 'Ogłoszenie dodane' });
});

// get single advert
// GET /api/v1/adverts/:id
// public
exports.getAdvert = asyncHandler(async (request, res, next) => {
  const advert = await Advert.findById(request.params.id);

  if (!advert) {
    return next(
      new ErrorResponse(`Advert not found with id of ${request.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: advert });
});

// update advert
// PUT /api/v1/adverts/:id
// public
exports.updateAdvert = asyncHandler(async (request, res, next) => {
  let advert = await Advert.findById(request.params.id);

  if (!advert) {
    return next(
      new ErrorResponse(`Advert not found with id of ${request.params.id}`, 404)
    );
  }

  // make sure user is advert owner
  if (advert.user.toString() !== request.user.id) {
    return next(
      new ErrorResponse(`Nie masz uprawnień do edytowania tego ogłoszenia`, 404)
    );
  }

  advert = await Advert.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: advert });
});

// upload photo for advert
// PUT /api/v1/adverts/:id/photo
// private
exports.photoUpload = asyncHandler(async (request, res, next) => {
  const advert = await Advert.findById(request.params.id);

  if (!advert) {
    return next(
      new ErrorResponse(`Advert not found with id of ${request.params.id}`, 404)
    );
  }

  // make sure user is advert owner
  if (advert.user.toString() !== request.user.id) {
    return next(
      new ErrorResponse(`Nie masz uprawnień do edytowania tego ogłoszenia`, 404)
    );
  }

  if (!request.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  let file = request.files.file;

  // check if image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload image file`, 400));
  }

  // check for size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create custom filename
  file.name = `photo_${advert._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
  });

  await advert.update({
    photo: file.name
  });

  res.status(200).json({ success: true, data: advert });
});

// delete advert
// DELETE /api/v1/adverts/:id
// public
exports.deleteAdvert = asyncHandler(async (request, res, next) => {
  const advert = await Advert.findById(request.params.id);

  if (!advert) {
    return next(
      new ErrorResponse(`Advert not found with id of ${request.params.id}`, 404)
    );
  }

  // make sure user is advert owner
  if (advert.user.toString() !== request.user.id) {
    return next(
      new ErrorResponse(`Nie masz uprawnień do edytowania tego ogłoszenia`, 404)
    );
  }

  await advert.remove();

  res.status(200).json({ success: true, data: {} });
});

// get adverts within radius
// GET /api/v1/adverts/radius/:city/:distance
// public
exports.getAdvertsInRadius = asyncHandler(async (request, res, next) => {
  const { city, distance } = request.params;

  // get lat/lng from geocoder
  // const loc = await geocoder.geocode(city);
  // const lat = loc[0].latitude;
  // const lng = loc[0].longitude;

  const lat = 50.060349;
  const lng = 19.941747;

  // calc radius using radians
  // divide dist by radius of Earth
  // Earth radius = 6,378km
  const radius = distance / 6378;

  const adverts = await Advert.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: adverts.length,
    data: adverts
  });
});
