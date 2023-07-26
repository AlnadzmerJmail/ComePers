const database = require('../database');
const cities = require('./cities');
const { descriptor, places } = require('./seedHelpers');

// model
const Campground = require('../models/campground');

async function seeds() {
	try {
		await database;

		await Campground.deleteMany();
		console.log('collection clean');

		for (let i = 0; i <= 20; i++) {
			const getTitle = (arr) => Math.floor(Math.random() * arr.length);
			const random = Math.floor(Math.random() * 20);

			const campground = new Campground({
				author: '64030e6c4c29c02a3f192004',
				title: `${descriptor[getTitle(descriptor)]} ${
					places[getTitle(places)]
				}`,
				price: random * 10,
				description:
					'Such a beautiful place and experience here... Come and enjoy the whole night!',
				location: `${cities[random].city}, ${cities[random].state}`,
				geometry: {
					type: 'Point',
					coordinates: [cities[random].longitude, cities[random].latitude],
				},
				images: [
					{
						url: 'https://res.cloudinary.com/dpkqktzls/image/upload/v1678801973/YelpCamp/xbnhuz3ypruyjp6y4pfb.webp',
						filename: 'YelpCamp/xbnhuz3ypruyjp6y4pfb',
					},
					{
						url: 'https://res.cloudinary.com/dpkqktzls/image/upload/v1678726628/YelpCamp/wgicrrryjtuzo3sldvui.jpg',
						filename: 'YelpCamp/wgicrrryjtuzo3sldvui',
					},
				],
			});

			const newCampground = await campground.save();
		}
		// console.log('new-campground-here:', newCampground);
	} catch (err) {
		console.log('Error on seeding...', err);
	}
}

seeds();
