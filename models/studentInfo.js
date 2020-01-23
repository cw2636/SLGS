var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var passportLocalMongoose = require("passport-local-mongoose");


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



var StudentSchema = new mongoose.Schema({
    first_name: {
	type: String,
	required: true		 
	},
	middle_name: {
	 type: String,
	 required: true	 
	},
    last_name:  {
	 type: String,
	 required: true	 
	},
	street:  {
	 type: String,
	 required: true		 
	},
	town:  {
	 type: String,
	 required: true	 
	},
	city:  {
	 type: String,
	 required: true	 
	},
	region:  {
	 type: String,
	 required: true		 
	},
	country:  {
	 type: String,
	 required: true	 
	},
	studentId:  {
	 type: String,
	 required: true		 
	},
	day:  {
	 type: String,
	 required: true		 
	},
	month:  {
	 type: String,
	 required: true		 
	},
	year:  {
	 type: String,
	 required: true		 
	},
	
	username: String,
	
	id: {
	    type: mongoose.Schema.Types.ObjectId,
        ref: "User"
	},
	
	student_classes : [ClassSchema]
});

StudentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("StudentInfo", StudentSchema);