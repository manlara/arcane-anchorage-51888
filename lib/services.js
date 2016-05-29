'use strict'

module.exports = (function(){

	var getServicesFromDirectories = function(path){

		let items = require('fs').readdirSync(path)
		let serviceFiles = []
		
		items.forEach(function(item){
			if(!~item.indexOf('.js') && !~item.indexOf('.')) getServicesFromDirectories(path + '/' + item)
			else if(~item.indexOf('.js')) serviceFiles.push({path : path + '/' + item, name : item.split('.js').shift() })
		})

		return serviceFiles
	}

	var response = {}

	getServicesFromDirectories(ROOT + '/api/services').forEach(function(obj){
		response[obj.name] = require(obj.path)
	})

	return response
	
})()