var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
	,
	
	localOrFacebook: Number,
	user_id: String,
    token: String,
    email: String,
	first_name: String,
    last_name: String,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);