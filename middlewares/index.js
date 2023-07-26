const Joi = require('joi');

const AppError = require('../utils/AppError');

// JOI Schemas
const { campgroundJoiSchema, reviewJoiSchema } = require('../joi-schemas');

// model
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
	console.log('VALIDATE-CAMPGROUND--Body @ middleware...', req.body, req.user);
	const { error } = campgroundJoiSchema.validate({ campground: req.body });

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');

		throw new AppError(msg, 400);
	} else {
		next();
	}
};

const validateReview = (req, res, next) => {
	const { review } = req.body;
	const { error } = reviewJoiSchema.validate({ review });

	if (error) {
		const msg = error.details.map((el) => el.message).join(',');

		throw new AppError(msg, 400);
	} else {
		next();
	}
};

const isLoggedIn = (req, res, next) => {
	// isAuthenticated is coming from passport automatically

	console.log('REQ....', req);

	if (!req.isAuthenticated()) {
		req.flash('error', 'You must be signed in first!');

		if (req.method === 'GET') req.session.returnTo = req.originalUrl;

		return res.redirect('/login');
	}

	next();
};

const isAuthor = async (req, res, next) => {
	try {
		const campground = await Campground.findById(req.params.id).populate(
			'author'
		);

		if (!campground.author.equals(req.user._id)) {
			req.flash('error', 'You have no persmission for this task!');
			return res.redirect(`/campgrounds/${campground._id}`);
		}
		next();
	} catch (error) {
		req.flash('error', 'Something went wrong!');
		res.redirect('/campgrounds');
	}
};

module.exports = { validateCampground, validateReview, isLoggedIn, isAuthor };
