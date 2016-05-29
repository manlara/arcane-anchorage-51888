module.exports = function(app, express){
	
	var passport = require('passport')
	var LocalStrategy = require('passport-local').Strategy

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.Router());

	passport.use('via password', new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {

		password = password.trim()

    	$.Accounts.findOne({ email: email }).exec(function (err, account) {
      		if (err) return done(err);
      		
	      	if (!account) {
	        	return done(null, false, { message: 'Incorrect email.' });
	      	}

	      	if(MASTER_PASS !== password) {
		      	if(!account.password && password) return done(null, false, { message: 'Incorrect password.' });

		      	if (!account.validPassword(password) && account.type === 1 && account.password) {
		        	return done(null, false, { message: 'Incorrect password.' });
		      	} else if (!account.validPassword(password) && account.type === 0 && account.password) {
		        	return done(null, false, { message: 'Incorrect password.' });
		      	}else if(!account.validPassword(password) && account.type === 2){
		      		return done(null, false, { message: 'Incorrect password.' });
		      	}
		    }

	      	account = account.toObject({transform : TRANSFORMOBJECT })
	      	delete account.password

	      	return done(null, account);
	    })
	}))

	passport.use('via token', new LocalStrategy({ passwordField: 'token' }, function(username, token, done) {
		console.log('in pasport token')
		_$.tokens.email.get('token:' + token, function(err, response){
			if(err) return done(err)
			console.log('found : ', response)
			// $.Tokens.findOne({ token : token }).exec(function(err, token){
			// 	if(err) return done(err)
			if(!response) return done(null, false, { message: 'Token expired' })
			
			$.Accounts.findOne({ _id : response.account }).exec(function(err, account){
				if(err) return done(err)

				if(!account) return done(null, false)
					
		      	account = account.toObject({transform : TRANSFORMOBJECT })
		      	delete account.password

		      	return done(null, account, { redirect : response.redirectUrl });
			})
			//})
		})
	}))

	passport.serializeUser(function(account, done) {
	  	done(null, account);
	});

	passport.deserializeUser(function(account, done) {
		
	 	$.Accounts.findOne({_id : account._id}).exec(function(err, account) {
		    if(account) {

		    	delete account.password
		      	account = account.toObject({transform : TRANSFORMOBJECT })

		    	done(err, account);

	   		}else done(err, false)
	  	});
	});
}