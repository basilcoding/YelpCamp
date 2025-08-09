const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// setting up an instance of CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary, // pass in the cloudinary object that we configured above
    params: {
        folder: 'YelpCamp', // folder in cloudinary that we should store things in
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})
// Basically, this CloudinaryStorage instance is set up so that it has the credentials for our particular cloudinary Account and we want to upload things under the folder name YelpCamp


// This is also allowed
// module.exports.cloudinary = cloudinary;
// module.exports.storage = storage;
module.exports = {
    cloudinary, // cloudinary instance we configured
    storage // cloudinaryStorage instance
}



