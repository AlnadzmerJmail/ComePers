const express = require('express');
const router = express.Router();

const passport = require('passport');
// var GoogleStrategy = require('passport-google-oidc');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// util
const asyncWrapper = require('../utils/asyncWrapper');

// model
const User = require('../models/user');

// controllers
const {
	showRegistrationForm,
	register,
	showLoginForm,
	login,
	loginWithGoogle,
	logout,
} = require('../controllers/user');

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/oauth2/redirect/google',
			scope: ['profile', 'email'],
		},
		async (accessToken, refreshToken, profile, done) => {
			// return console.log('user profile is: ', profile);

			const source = 'Google';
			const password = profile.id;

			const user = new User({
				username: profile.name?.givenName || '',
				email: profile.emails[0].value || '',
				profile: profile.photos[0]?.value || '',
				source,
			});

			const foundUser = await User.findOne({
				username: user.username,
				email: user.email,
				source,
			});

			console.log('REGISTERED-USER-->>', foundUser);

			if (foundUser) return done(null, foundUser);

			User.register(user, password)
				.then((newUser) => {
					if (newUser) {
						console.log('NEWLY REGISTERED USER!!!', user);
						done(null, newUser);
					} else {
						console.log('NO USER FOUND!!!');
					}
				})
				.catch((err) => {
					console.log('errror................', err);
					done(err);
				});
		}
	)
);

router
	.route('/register')
	.get(showRegistrationForm)
	.post(asyncWrapper(register));

router
	.route('/login')
	.get(showLoginForm)
	.post(
		passport.authenticate('local', {
			// all magic are happended behind the scene, the comparing of credentials.
			failureRedirect: '/login',
			failureFlash: true,
			keepSessionInfo: true,
		}),
		login
	);

router.get('/login/federated/google', passport.authenticate('google'));

router.get(
	'/oauth2/redirect/google',
	passport.authenticate('google', {
		successReturnToOrRedirect: '/campgrounds',
		failureRedirect: '/login',
	})
);

router.get('/logout', logout);

module.exports = router;
