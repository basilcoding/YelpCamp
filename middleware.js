const { reviewSchema, campgroundSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js')
const Campground = require('./models/campground');
const Review = require('./models/review')

// This middleware will immediately run when you try to visit some campground page( like eg: campgrounds/new or campground/:id/edit)
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // when you try to visit something like campground/new without logginIn, this line will store the originalUrl(where you were trying to go to) in the session
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// This will only run when you login through the login page. It will store the returnTo value from the session inside res.locals.returnTo (because passport.authenticate will erase the session information when you login)
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
