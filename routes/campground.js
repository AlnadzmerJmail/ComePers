const express = require('express');
const router = express.Router({ mergeParams: true });

// for upload image
const multer = require('multer');
const { cloudinary, storage } = require('../cloudinary');
const upload = multer({ storage });

// util
const asyncWrapper = require('../utils/asyncWrapper');

// middlewares
const { validateCampground, isLoggedIn, isAuthor } = require('../middlewares');

// controlleres
const {
	index,
	showCreateForm,
	showCampground,
	createCampground,
	showEditForm,
	updateCampground,
	deleteCampground,
} = require('../controllers/campground');

// routes
router
	.route('/')
	.get(asyncWrapper(index))
	.post(
		isLoggedIn,
		upload.array('images'),
		validateCampground,
		asyncWrapper(createCampground)
	);

router.get('/new', isLoggedIn, showCreateForm);

router
	.route('/:id')
	.get(asyncWrapper(showCampground))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array('images'),
		asyncWrapper(updateCampground)
	)
	.delete(isLoggedIn, isAuthor, asyncWrapper(deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, asyncWrapper(showEditForm));

module.exports = router;
