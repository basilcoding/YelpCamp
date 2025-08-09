const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // req.body.review: This indicates that the form data submitted by the user is expected to have a top-level property named review. Within this review object, you would then find the actual fields for your review, like rating and body.
    review.author = req.user._id;
    campground.reviews.push(review); // This is where Mongoose's intelligent handling of references comes into play. When you push a full Mongoose document (like your review instance) into an array field that is defined with type: Schema.Types.ObjectId and a ref, Mongoose automatically extracts just the _id of that document and stores that _id in the array.
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added a new review!');
    // Redirect to the campground's show page after adding the review
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // section 490
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    // Redirect to the campground's show page after deleting the review
    res.redirect(`/campgrounds/${id}`);
}