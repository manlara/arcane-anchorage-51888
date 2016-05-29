'use strict'
var fs = require('fs');

module.exports = (function(){
	var main = {}

	//read all models in folder
	var services = fs.readdirSync(ROOT+'/api/communication')

	services.forEach(function(service){
		var _service = _.clone(service)

		//check if it is a js file
		if(_service.indexOf('.js') !== -1){

			let file = ROOT+'/api/communication/'+service
			let src = require('fs').readFileSync(file);
			let err = require('syntax-error')(src, file);
			if (err) return log.error(err)

			//get the attributes and domain specific functions
			var serviceObj = require(ROOT+'/api/communication/'+service)
			var name = _service.split('.js').shift() //Service name
			main[name] = serviceObj
		}
	})

	return main
	
})()