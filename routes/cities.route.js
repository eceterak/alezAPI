const express = require('express');
const {
  getCities,
  createCity,
  getCity,
  updateCity,
  deleteCity
} = require('../controllers/cities.controller');

const router = express.Router();

const City = require('../models/City.model');

const advancedResults = require('../middleware/advancedResults.middleware');

// include other resource router
const advertsRouter = require('./adverts.route');

router.route('/').get(advancedResults(City, 'adverts'), getCities).post(createCity);

router.route('/:id').get(getCity).put(updateCity).delete(deleteCity);

// re-route into other resource routers
// cities/:city/adverts
router.use('/:city/adverts', advertsRouter);

module.exports = router;
