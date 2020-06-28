const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users.controller');

const User = require('../models/User.model');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth.middleware');
const advancedResults = require('../middleware/advancedResults.middleware');

// it will apply to all routers
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
