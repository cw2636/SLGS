var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var ClassSchema = new mongoose.Schema({
	     name: String,
		 instructor: String,
		 days_taught: String,
		 time: String,
	     id: {
			 type: mongoose.Schema.Types.ObjectId,
             ref: "User"
		 }
	
});


module.exports = mongoose.model("Classes", ClassSchema);