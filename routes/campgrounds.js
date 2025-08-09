const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index'); // Node automatically checks for it in the index.js file
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    // all the information that is send in both req.body and req.files are multipart/formdata encoded (since we set enctype=multipart/formdata inside the <form></form>), so we need to use multer to parse them. After parsing only we can validate the campgorund
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
// upload.array('under_what_name_its_send') --> this will add a new field called req.file(having the file info), so now req will have both req.body and req.file
// .post(upload.array('image'), async (req, res) => {
//     console.log(req.body, req.files);
//     res.send('it worked')
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    // all the information that is send in both req.body and req.files are multipart/formdata encoded (since we set enctype=multipart/formdata inside the <form></form>), so we need to use multer to parse them. After parsing only we can validate the campgorund
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm))

module.exports = router;