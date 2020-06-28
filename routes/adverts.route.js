const express = require('express');
const {
  getAdverts,
  createAdvert,
  getAdvert,
  updateAdvert,
  deleteAdvert,
  getAdvertsInRadius,
  photoUpload
} = require('../controllers/adverts.controller');

const Advert = require('../models/Advert.model');

const { protect, authorize } = require('../middleware/auth.middleware');

const advancedResults = require('../middleware/advancedResults.middleware');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(advancedResults(Advert, 'city'), getAdverts)
  .post(protect, createAdvert);

router.route('/:id').get(getAdvert).put(protect, updateAdvert).delete(protect, deleteAdvert);

router.route('/radius/:city/:distance').get(getAdvertsInRadius);

router.route('/:id/photo').put(protect, authorize('user', 'admin'), photoUpload);

module.exports = router;
