const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// used for views
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const path = require('path');

// util
const AppError = require('./utils/AppError');

// database
const database = require('./database');

// model
const User = require('./models/user');

// routes
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');

// the app
const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
	secret: 'IloveLalone',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true, // the default
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig)); // it is a must to be first than passport.session() - according to passport docs
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); // automatically added. we don't wrote this

// to use with session
passport.serializeUser(User.serializeUser()); // store user
passport.deserializeUser(User.deserializeUser()); // clear user

// use ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// before the requests pass here before reach the final route
app.use((req, res, next) => {
	console.log('START- SESSION AT MIDDLEWARE:', req.session);

	console.log('END- REQ USER:', req.user, 'AND THE PATH IS:', req.originalUrl);

	// thsese variables would be accessible in any views
	res.locals.user = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// use routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// all routes passed here
app.all('*', (req, res, next) => {
	next(new AppError('Page Not Found!!!', 404));
});

// error handler. will catch every error in the app. ensure that it has 4 params so that express considers it error handler
// for development puposes
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;

	if (!err.message) {
		err.message = 'Something went wrong!';
	}
	// we can do it here but the challenge is where to redirect
	// req.flash('error', err.message);
	// res.redirect('/register');

	res.status(statusCode).render('error', { err });
});

async function server() {
	try {
		await database;
		console.log('Connection to database is successful!');
		app.listen(8080, () => console.log('App is listening on port 8080'));
	} catch (err) {
		console.log('Server went error...', err);
	}
}
server();

// STOP AT 45>466
// to do: update model, include image
