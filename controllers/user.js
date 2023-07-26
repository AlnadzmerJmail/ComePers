const passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');

// model
const User = require('../models/user');

const showRegistrationForm = (req, res) => {
	res.render('users/register');
};

const register = async (req, res) => {
	const { username, email = '', password } = req.body.user;

	const user = new User({ username, email });

	// return console.log(user);

	// user.register is from passport, it handles the hashing of password before saving to db
	// but instead of password property, it creates salt and hash
	const newUser = await User.register(user, password);

	// login method is from passport
	req.login(newUser, (err) => {
		if (err) return req.flash('error', "Can't log you in!");

		req.flash('success', 'Welcome to YelpCamp!');
		res.redirect('/campgrounds');
	});
};

const showLoginForm = (req, res) => {
	res.render('users/login');
};

const login = (req, res) => {
	const redirectUrl = req.session.returnTo || '/campgrounds';
	delete req.session.returnTo;

	res.redirect(redirectUrl);
};

// login with Google
const loginWithGoogle = () => {
	console.log('LOGIN WITH GOOGLE.........', process.env['GOOGLE_CLIENT_ID']);
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env['GOOGLE_CLIENT_ID'],
				clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
				callbackURL: '/oauth2/redirect/google',
				scope: ['profile'],
			},
			function verify(issuer, profile, cb) {
				console.log('THE ISSUER-->>', issuer, 'PROFILE-->>', profile);
				db.get(
					'SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?',
					[issuer, profile.id],
					function (err, row) {
						if (err) {
							return cb(err);
						}
						if (!row) {
							db.run(
								'INSERT INTO users (name) VALUES (?)',
								[profile.displayName],
								function (err) {
									if (err) {
										return cb(err);
									}

									var id = this.lastID;
									db.run(
										'INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)',
										[id, issuer, profile.id],
										function (err) {
											if (err) {
												return cb(err);
											}
											var user = {
												id: id,
												name: profile.displayName,
											};
											return cb(null, user);
										}
									);
								}
							);
						} else {
							db.get(
								'SELECT * FROM users WHERE id = ?',
								[row.user_id],
								function (err, row) {
									if (err) {
										return cb(err);
									}
									if (!row) {
										return cb(null, false);
									}
									return cb(null, row);
								}
							);
						}
					}
				);
			}
		)
	);
};

const logout = (req, res) => {
	// logout method is from passport
	req.logout((err) => {
		if (err) return req.flash('error', "Can't log you out!");

		req.flash('success', 'Bye!');
		res.redirect('/login');
	});
};
module.exports = {
	showRegistrationForm,
	register,
	showLoginForm,
	login,
	loginWithGoogle,
	logout,
};
