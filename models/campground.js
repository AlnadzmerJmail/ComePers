const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// to allow and include virtual properties when stringifying the data
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
	url: String,
	filename: String,
});

imageSchema.virtual('thumbnail').get(function () {
	// https://res.cloudinary.com/dpkqktzls/image/upload/v1678721418/YelpCamp/sigj2ste4eqms4xcuslf.jpg
	// we insert /w_100 so that image will have a width of 100px
	return this.url.replace('/upload', '/upload/w_100');
});

const campgroundSchema = new Schema(
	{
		author: { type: Schema.Types.ObjectId, ref: 'User' },
		title: String,
		price: Number,
		description: String,
		location: String,
		// the mapbox geometry has already followed this structure
		geometry: {
			type: {
				type: String,
				enum: ['Point'], // location.type must be "Point"
				required: true,
				default: 'Point',
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		images: [imageSchema],
		reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	},
	opts
);

// "properties" property needed in map cluster because
// it is a default behaviour of map cluster to find "geometry" property and "properties"
campgroundSchema.virtual('properties').get(function () {
	return { title: this.title, id: this._id };
});

module.exports = mongoose.model('Campground', campgroundSchema);
