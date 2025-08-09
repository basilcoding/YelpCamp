const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String,
});
//Adding a virtual property to this schema
// .get() defines the "getter" function for your virtual i.e,
// whenever you try to access document.propertyName (e.g., image.thumbnail), this function will be executed.
ImageSchema.virtual('thumbnail').get(function () {
    // 'this' refers to the individual image document (the object {url: ..., filename: ...})
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        // "With ref: When you later perform .populate('author') on a Campground query, Mongoose will use the User Model to query the database, find the user document (an instance of the User Model) with the matching _id, and then replace the author ObjectId in your Campground document with that retrieved full User document."
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

// section 491
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);