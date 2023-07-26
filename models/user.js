const mongoose = require('mongoose');
const passportLocalMonogoose = require('passport-local-mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true, // not a validation, just reminder
	},
	firsName: String,
	middleName: String,
	lastName: String,
	profile: String,
	source: {
		type: String,
		enum: ['Regular', 'Google', 'Facebook'],
		default: 'Regular',
	},
});

// will add a password and username properties to userSchema
userSchema.plugin(passportLocalMonogoose);

module.exports = mongoose.model('User', userSchema);
