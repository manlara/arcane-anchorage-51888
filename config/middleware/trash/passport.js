module.exports = function(app, express){
	
	var passport = require('passport')
	var LocalStrategy = require('passport-local').Strategy

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.Router());

	passport.use(new LocalStrategy({ usernameField: 'email'}, function(email, password, done) {
		
    	$.Users.findOne({ email: email,  select : ['type', 'email', 'id', 'password']}).exec(function (err, user) {
      		if (err) return done(err);
      		
	      	if (!user) {
	        	return done(null, false, { message: 'Incorrect email.' });
	      	}

	      	if (!user.validPassword(password)) {
	        	return done(null, false, { message: 'Incorrect password.' });
	      	}

	      	return done(null, user);
	    })
	}))

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		
	  $.Users.findOne({id : user.id}).exec(function(err, user) {
	    if(user) done(err, user);
	   	else done(err, false)
	  });
	});
}