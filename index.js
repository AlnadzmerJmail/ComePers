if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const PORT = process.env.PORT || 8080;

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// to prevent mongoose injection
const mongoSanitize = require('express-mongo-sanitize');

// has 11 middlewares concern about security
// const helmet = require('helmet');

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

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

// app.use(
// 	helmet({
// 		contentSecurityPolicy: false,
// 	})
// );

// flash messages
app.use(flash());

const sessionConfig = {
	name: 'mySession', // by default it is "connect.sid"
	secret: 'IloveLalone',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true, // the default
		//secure:true, // needed when deploying the app so that cookie will be only accessed through https
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig)); // it is a must to be first than passport.session() - according to passport docs

// configure passport
app.use(passport.initialize());
app.use(passport.session());

// telling passport to use LocalStrategy and the authentication method is located in User model called authenticate -
// which created by passport local mongoose
passport.use(new LocalStrategy(User.authenticate())); // automatically added. we didn't wrote this

// to use with session
passport.serializeUser(User.serializeUser()); // store user
passport.deserializeUser(User.deserializeUser()); // fetch user

// use ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// request passes here before it reaches the final route
app.use((req, res, next) => {
	// thsese variables would be accessible in any views
	res.locals.loggedInUser = req.user; // req.user ia automatically added to req by passport when login is successful
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// use routes
app.get('/', (req, res) => {
	res.render('campgrounds/home');
});
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// all routes passed here if not caught within the routes declared before this line
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

	res.status(statusCode).render('error', { err });
});

async function server() {
	try {
		await database.connect();

		app.listen(PORT, () =>
			console.log(
				`App is listening on port ${PORT} and it is running on ${
					process.env.NODE_ENV || 'Development'
				}`
			)
		);
	} catch (err) {
		console.log('Server went error...', err);
	}
}

server();

// STOP AT 45>466
// to do: update model, include image
