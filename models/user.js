const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
// The passport-local-mongoose plugin injects all the "passport 
// stuff" (specifically the authenticate, register, 
// serializeUser, deserializeUser static methods, 
// and the username, hash, salt fields) directly into 
// your User model's capabilities.

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
// So, even though you don't explicitly write username: { type: String, unique: true } in your UserSchema, the plugin adds this for you.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);


