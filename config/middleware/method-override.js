module.exports = function(app, express){
	return app.use(require('method-override')('X-HTTP-Method-Override'));
}