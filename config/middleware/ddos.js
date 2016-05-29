module.exports = function(app, express){
	var _ddos = require('ddos')
	var ddos = new _ddos

	return app.use(ddos.express)
}