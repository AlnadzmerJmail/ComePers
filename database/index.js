const mongoose = require('mongoose');

const mongoDb_uri = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);
const database = mongoose.connect(
	mongoDb_uri || 'mongodb://localhost:27017/yelp-camp'
);

module.exports = database;
