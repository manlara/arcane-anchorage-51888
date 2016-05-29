'use strict'
var fs = require('fs');

module.exports = (function(){

	var path = ROOT+'/api/view_helpers'
	var helpers = fs.readdirSync(path)
	var returnObj = {}

	helpers.forEach(function(helper){
		if(~helper.indexOf('.js')){

			let file = path+'/'+helper
			let src = require('fs').readFileSync(file);
			let err = require('syntax-error')(src, file);
			if (err) return log.error(err)

			var helperObj = require(path+'/'+helper)

			var nameArray = helper.toLowerCase().split('helper')
			if(!nameArray.length || nameArray.length === 1) throw 'Helper file name is not right format'
			
			nameArray.pop()
			var name = nameArray.join('')

			if(!returnObj[name]) returnObj[name] = {}
			returnObj[name] = helperObj
		}
	})

	return returnObj
	
})()