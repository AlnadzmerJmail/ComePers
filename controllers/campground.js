// util
const AppError = require('../utils/AppError');

// mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// cloudinary
const { cloudinary } = require('../cloudinary');

// models
const Campground = require('../models/campground');
const Review = require('../models/review');

// controller functions
const index = async (req, res) => {
	let { page = 1 } = req.query;
	page = Number(page);

	const perPage = 15;
	const offSet = (page - 1) * 5;

	const campgrounds = await Campground.find({}).limit(perPage).skip(offSet);
	const count = await Campground.countDocuments();

	const nextPage = count > page * perPage ? page + 1 : 0;

	// if more-btn is triggered
	if (req.query.page) {
		return res.json({
			campgrounds,
			nextPage,
		});
	}

	res.render('campgrounds/index', { campgrounds, nextPage });
};

const showCreateForm = (req, res) => {
	res.render('campgrounds/create');
};

const showCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');

	if (!campground) {
		req.flash('error', "Couldn't found Campground!");
		return res.redirect('/campgrounds');
	}

	res.render('campgrounds/show', {
		campground,
		author: campground.author?.username,
	});
};

const createCampground = async (req, res) => {
	if (!req.body.location.toLowerCase().includes('philippines')) {
		req.body.location = req.body.location + ' Philippines';
	}

	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.location,
			limit: 1,
		})
		.send();

	const campground = new Campground(req.body);

	campground.author = req.user._id; // req.user should always be truthy because we are logged in where this user was assigned
	campground.geometry = geoData.body.features[0].geometry;

	if (req.files && req.files[0]) {
		campground.images = req.files.map((f) => ({
			url: f.path,
			filename: f.filename,
		}));
	}

	const newCampground = await campground.save();

	req.flash('success', 'Successfully created Campground!');

	res.redirect('/campgrounds');
};

const showEditForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);

	res.render('campgrounds/edit', { campground });
};

const updateCampground = async (req, res) => {
	const { id } = req.params;

	const updatedCampground = await Campground.findByIdAndUpdate(
		id,
		{ ...req.body.campground },
		{ new: true }
	);

	// remove/delete image
	if (req.body.deleteImages && req.body.deleteImages[0]) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await updatedCampground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}

	// add new image
	if (req.files && req.files[0]) {
		const newImages = req.files.map((file) => ({
			url: file.path,
			filename: file.filename,
		}));
		updatedCampground.images.push(...newImages);
		await updatedCampground.save();
	}

	req.flash('success', 'Successfully updated Campground!');
	res.redirect(`/campgrounds/${updatedCampground._id}`);
};

const deleteCampground = async (req, res) => {
	const deletedCampground = await Campground.findByIdAndDelete(req.params.id);

	if (deletedCampground) {
		await Review.deleteMany({ _id: { $in: deletedCampground.reviews } });

		req.flash('success', 'Successfully deleted Campground!');
		res.redirect('/campgrounds');
	} else {
		throw new AppError("Campground couldn't be found", 401);
	}
};

module.exports = {
	index,
	showCreateForm,
	showCampground,
	createCampground,
	showEditForm,
	updateCampground,
	deleteCampground,
};
