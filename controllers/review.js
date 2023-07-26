// util
const AppError = require('../utils/AppError');

// models
const Campground = require('../models/campground');
const Review = require('../models/review');

const createReview = async (req, res) => {
	const campground = await Campground.findById(req.params.id);

	if (!campground) {
		throw new AppError("Campground couldn't be found", 401);
	} else {
		const newReview = new Review(req.body.review);
		newReview.author = req.user._id;

		const review = await newReview.save();

		campground.reviews.push(review);
		await campground.save();

		req.flash('success', 'Successfully createa a review!');

		res.redirect(`/campgrounds/${campground._id}`);
	}
};

const deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;

	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);

	req.flash('success', 'Successfully deleted a review!');
	res.redirect(`/campgrounds/${id}`);
};

module.exports = { createReview, deleteReview };
