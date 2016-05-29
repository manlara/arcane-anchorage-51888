module.exports = function(app, express){
	return app.use(require('lusca').xframe('SAMEORIGIN'))
}