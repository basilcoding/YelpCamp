const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')
const { storeReturnTo } = require('../middleware');

// In this route, we are only registering and not doing any authentication
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// In this route, authentication is done
// It also does the Session Establishment: Importantly, passport.authenticate() automatically invokes req.login() (or req.logIn()).
// storeReturnTo is used to store the session object (defined in the middleware.js), because passport.authenticate will clear the session information after passport.authenticate (after a successfull login)
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;