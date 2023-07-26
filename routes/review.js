const express = require('express');
const router = express.Router({ mergeParams: true });

// util
const asyncWrapper = require('../utils/asyncWrapper');

// middleware
const { isLoggedIn, validateReview } = require('../middlewares');

// controllers
const { createReview, deleteReview } = require('../controllers/review');

// routes
router.post('/', isLoggedIn, validateReview, asyncWrapper(createReview));

router.delete('/:reviewId', isLoggedIn, asyncWrapper(deleteReview));

module.exports = router;
