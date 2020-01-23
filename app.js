   var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
	methodOverride = require('method-override'),
	StudentInfo      = require("./models/studentInfo"),
	Classes      = require("./models/classesOfferred"),
	User =       require("./models/user"),
    Bcrypt = require("bcryptjs"),
	FacebookStrategy = require('passport-facebook'),
	FacebookSignUp = require('passport-facebook'),
	configAuth = require('./fb'),
	flash        = require('connect-flash');

const request = require('request');

global.globalString = "This can be change anywhere";
global.globalInt = 1;
global.globalbol = 0;


global.globalArray = {
  first_name: String,
  last_name: String,
}

global.globalUser = {
	username: String,
	password: String,
}
global.currentUserId = "This will holds user ids";




mongoose.connect("mongodb://localhost/SLGS");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   :  configAuth.facebookAuth.profileFields
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
			console.log(profile.id);
            User.findOne({'user_id': profile.id}, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
					console.log('user');
					globalbol = 1;
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser  = new User();

                    // set all of the facebook information in our user model
                    newUser.user_id = profile.id;
			        newUser.token = refreshToken;
		         	newUser.first_name = profile.name.givenName;
		        	newUser.last_name = profile.name.familyName;
			        newUser.email = profile.emails[0].value;
			        globalUser.username = newUser.email;
		           	globalUser.password = profile.id;
			        globalInt = 2;
			        globalArray.first_name = profile.name.givenName,
	    	        globalArray.last_name = profile.name.familName,
			        newUser.localOrFacebook = 2;

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

// variables that can be accessed on all templates
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.commentUser = req.flash('commentUser');
   res.locals.wrongCommentUser = req.flash('wrongCommentUser');
   next();
});

 global.classArr = [{
	 name: "CS 110",
	 instructor: "Mr Tengbeh",
	 days_taught: "M",
	 time: "10am"
  },
   {
	 name: "CS 220",
	 instructor: "Mr Tee",
	 days_taught: "MS",
	 time: "10am"
   },
	
  {
	 name: "EC EN 240",
	 instructor:  "Mr Sees",
	 days_taught: "M",
	 time: "10pm"
  } 
];
 



app.get('/', function(req,res){
	   res.render('home');
});


app.get('/signup', function(req,res){
	res.render('usersignup');
});

app.post('/signup', function(req,res){
       var newUser = new User({username: req.body.username, localOrFacebook: 1});
         User.register(newUser,req.body.password, function(err, user){
          if(err){
			 console.log(err);
            return res.render('usersignup');
          }
           passport.authenticate("local")(req, res, function(){
		   //req.flash('success','Welcome to YelpCamp ' + user.username);;
           res.redirect("/localOrFacebook"); 
        });
    });
});

 app.get('/register', function(req,res){
	 res.render('register', {newUser: req.user});
 });

app.post('/register', function(req,res){
	  var student = {first_name: req.body.first_name, middle_name: req.body.middle_name, last_name:                   req.body.last_name, street: req.body.street, town: req.body.town, city: req.body.city,
    region: req.body.region, country: req.body.country, studentId: req.body.studentId,
	day: req.body.day, month: req.body.month, year: req.body.year, username: req.user.email,
	   id: req.user._id
     };
	StudentInfo.create(student, function(err,created) {
	if(err) {
		console.log(err);
	}else {
		   if(req.user.localOrFacebook == 1) {
		   created.username = req.user.username;
		   created.username.id  = req.user._id;
	        }else {
	          created.username = req.user.email;
		      created.username.id  = req.user.id;
			}
           created.markModified('username');
		   created.save(function(err){
			if(err){
				console.log(err);
			}else {
				res.redirect('/');
				
			}
			   
		   });
		}	
	});
});


app.get('/localOrFacebook', function(req,res){
   if(globalbol == 1) {
	   res.redirect('/studentportal');
    }
	else {
	if(globalInt == 1) {
		console.log("local");
	   res.render('register', {newUser: req.user});
	}else {
	  console.log("facebook");
	  res.render('Facebook', {newUser: req.user});
	}
  }
});



app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: 'email' })
);
app.get('/auth/facebook/callback',
      passport.authenticate('facebook', { successRedirect: '/localOrFacebook',
                                                failureRedirect: '/' }));


app.get('/studentportal', function(req,res){
  if(req.user.localOrFacebook == 1) {
	StudentInfo.findOne({username: req.user.username}).populate('student_class').exec(function(err, created){
    if(err){
      console.log(err);
	}else {
		console.log(created);
		res.render('studentinfos', {student: created});
	}
   });
  }else {
	  	StudentInfo.findOne({username: req.user.email}).populate('student_class').exec(function(err,       created){
    if(err){
      console.log(err);
	}else {
		console.log(created);
		res.render('studentinfos', {student: created});
	}
   });
  }
 });

app.post('/waiting', function(req,res){
   console.log(req.user);
});

app.get('/users/:id', function(req,res){
	res.redirect('/'+ req.user._id + '/studentportal');
});

app.get('/:id/classRegistration', function(req,res){
	        StudentInfo.findById(req.params.id, function(err, found){
				if(err){
					console.log(err);
				}
				else {
					res.render('RegisterForClass', {user: found});
				}
			});
			
  });

app.get('/:id/userAuth', function(req,res){
	  StudentInfo.findById(req.params.id, function(err, found){
		  if(err) {
	  console.log(err);
     }
	 else{
		res.render('changeUserAuth', {userAuth: found});
	 }
   });
 });


app.get('/login', function(req,res){
	res.render('login');
});



app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
		console.log(info);
		return res.redirect('/'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
	  globalBool = 1;
      return res.redirect('/studentportal');
    });
  })(req, res, next);
});
	

// logout route
app.get("/logout", function(req, res){
    req.logout();
	//req.flash('success','see you soon');
   res.redirect("/");
});

 app.get('/:id/password', function(req,res){
	 StudentInfo.findById(req.params.id, function(err, found){
		 if(err) {
			 console.log(err);
		 }
		 else {
			 res.render('password', {password: found});
		 }
	 });
	 
  });

app.post('/:id/password', function(req,res){
	 StudentInfo.findById(req.params.id, function(err, found){
		found.changePassword(req.body.old_password, req.body.new_password, function(err){
		if(err) {
			res.redirect('back');
		}
		else {
			console.log(found._id);
			res.redirect('/' + found._id + '/studentportal');
		}
    });
	});
	
 });

app.get('/:id/addingClass', function(req,res){
	  StudentInfo.findById(req.params.id, function(err, found){
		  if(err) {
			  console.log(err);
		  }else {
		 classArr.forEach(function(student_class){ 
		 if( student_class.name == globalString) {
		  Classes.create(student_class, function(err, created) {
			 if(err) {
			   console.log(err);
			   res.redirect('back');
			 }else {
			      created.id = req.user._id;
				  created.markModified("id");
				  created.save();
				  found.student_classes.push(created);
				  found.markModified("student_classes");
				  found.save();
				  res.redirect('/studentportal');
			  }
			});
		 }
		});
            }
        });
});

app.get('/:id/username', function(req,res){
	StudentInfo.findById(req.params.id, function(err, found){
	 if(err) {
		 console.log(err);
	 }
	 else {
	 	 res.render('username', {username: found});
     }
   });
 });

app.post('/:id/username', function(req,res){
	StudentInfo.findByUsername(req.body.username, function(err, found){
		if(err) {
			console.log(err);
			res.redirect('back');
        }
		else {
			   StudentInfo.update({username: req.body.new_username}, function(err){
				if(err) {
					res.redirect('back');
				}
				res.redirect('/' + found._id + '/studentportal');
            });
			
		}
    });
  });

app.get('/:id', function(req,res){
	StudentInfo.findById(req.params.id, function(err,found){
		if(err){
			console.log(err);
        }
		else {
			res.render('show', {currentUser: found});
		}
  });
});



app.get('/:id/edit', function(req,res){
	StudentInfo.findById(req.params.id, function(err, found){
		if(err) {
			res.redirect('back');
       }
		else {
	      res.render('edit', {currentUser: found});
		}
	});
});

app.put('/:id', function(req,res){
	StudentInfo.findByIdAndUpdate(req.params.id, {$set: req.body.studentInfo}, function(err, updated){
		console.log(req.params.id);
		console.log(req.body.studentInfo);
		if(err) {
			console.log(err);
		}
		else {
			res.redirect('/' + req.params.id);
		}
	});
		 
});

app.get('/s', function(req, res){
	res.render('/'+ req.user._id + '/studentportal');
});

//middleware
app.listen(3000, function() {
  console.log('Server listening on port 3000'); 
});


