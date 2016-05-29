module.exports = function(app, express){

	var session = require('express-session')
	var sessions = require(ROOT + '/config/session_routes.js')

	for(var name in sessions){
		if(name !== '*') app.use(sessions[name].cookie.path, session(sessions[name]))
	}
	app.use(session(sessions['*']))

}