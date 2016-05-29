'use strict'

var fs = require('fs');

module.exports = function(_$){

	var path = ROOT + '/config/middleware'
	var middlewares = fs.readdirSync(path)

	let file = ROOT + '/config/middleware.js'
	let src = require('fs').readFileSync(file);
	let err = require('syntax-error')(src, file);
	if (err) return log.error(err)

	var stackOrder = require(ROOT + '/config/middleware.js')
	var stack = []

	stackOrder.forEach(function(item){

		var found = false
		for(var i = 0; i < middlewares.length; i++){
			var name = middlewares[i].replace('.js', '')
			if(name === item){
				found = true
				stack.push(middlewares[i])
				break;
			}
		}

		if(!found) throw 'No matching middleware for '+item
	})

	stack.forEach(function(middleware){
		require(path+'/'+middleware)(_$.app, _$.express)
	})
	
}