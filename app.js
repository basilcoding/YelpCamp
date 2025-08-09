// if we are running not running in production mode, then use the .env file (NOTE: the environmental variable NODE_ENV is either production or developement)
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize'); // not working, so using the below thing
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL;

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews')
// dbUrl
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    // useNewUrlParser: true, // this is depricated
    // useCreateIndex: true, // not supported
    // useUnifiedTopology: true // this is depricated
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // when a form is submitted, is send to the backend in the URLENCODED form which has to be parsed by express
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));

// here, for sessions also, we are using the same database where we store the collections too (i.e dbUrl)
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // update the session if unused, every 24 hours (specified in seconds)
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
const sessionConfig = {
    // name: 'something', // change the defualt "connect.sid" as the name of the session cookie
    store,
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, // the cookies can only be configured over https (i.e over secure connections)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}
app.use(session(sessionConfig));
app.use(flash()); // Allows you to use req.flash() in your routes and templates
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dscymmlov/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize()); // initialize the session
app.use(passport.session()); // use for persistent login sessions
passport.use(new LocalStrategy(User.authenticate())) // Here's why: The LocalStrategy constructor expects: A verify callback function: This is the most common and standard way, where you manually define the logic to find a user by username and compare passwords. This function typically has the signature function(username, password, done) { ... } (or function(req, username, password, done) if passReqToCallback option is true).

// serialize --> When it's called: This function is invoked by Passport immediately after a user successfully logs in (authenticates) using any strategy (local, Google, Facebook, etc.). Its purpose: To decide what minimal piece of information about the authenticated user should be stored in the session.
// deserialize --> When it's called: This function is invoked by Passport on every subsequent request from the user, after the initial login, as long as a valid session exists and contains the user's identifier (from serializeUser). Its purpose: To take the minimal information stored in the session (the user.id) and use it to retrieve the full user object from your database. 
passport.serializeUser(User.serializeUser()); //method to store it (user info in session)
passport.deserializeUser(User.deserializeUser());// method to unstore it


// this whole thing will run once again when a post method has been called, so it will pass the req.flash() to res.locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // used in the views/partials/navbar.ejs for deciding whether to show the login or logout option in the navbar
    res.locals.success = req.flash('success'); // populate res.locals.success with req.flash('success') value...
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'will@gmail.com', username: 'will', password: 'password' })
    const newUser = await User.register(user, 'willSmith');
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404)); // An error object is created and is passed as an argument to next.
})

// Normal Flow: When you call next() without any arguments from a regular middleware or route handler, Express looks for the next middleware in the stack that has the (req, res, next) signature.
// Error Flow: When you call next(err) (i.e., next() with an argument, and that argument is typically an Error object), Express knows that an error has occurred. It then skips all subsequent regular middleware and routes and immediately starts searching for the next middleware in the stack that has the (err, req, res, next) signature.
app.use((err, req, res, next) => {
    console.log(err);
    const { statusCode = 500, } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving in port 3000');
})
