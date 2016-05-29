var year = 1000 * 60 * 60 * 24 * 365
var day = 1000 * 60 * 60 * 24

var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var settings = require(ROOT + '/config/db.js').mongo.sessions

module.exports = {

	'*' : { 
		secret: 'keyboard cat', 
		resave: false, 
		saveUninitialized: true, 
		store : new MongoStore(settings['*']), 
		cookie: { maxAge: year, /*secure: true*/ }
	}
}