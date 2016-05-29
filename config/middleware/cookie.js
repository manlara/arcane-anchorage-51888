module.exports = function(app, express){
	return app.use(require('cookie-parser')());
}