module.exports = function(app, express){
	return app.use(require('csurf')({ cookie: true }));
}