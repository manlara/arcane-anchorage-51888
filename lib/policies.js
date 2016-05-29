'use strict'

module.exports = (function(){

	var policies = require(ROOT+'/config/policies.js')
  	var controllers = Object.keys(policies)
  	var policyFiles = require('fs').readdirSync(ROOT+'/api/policies')
  	var policyResults = []

  	policyFiles.forEach(function(file, key){
    	file = file.replace('.js', '')
	    policyFiles[key] = file
  	})

	
  	
  	controllers.forEach(function(controller){
    	let functions = Object.keys(policies[controller])

    	functions.forEach(function(name){

    		let value = policies[controller][name]
      		let obj = {}

    		if(name !== '*'){

	      		if(typeof(value) === "boolean"){

	        		if(value) obj = {run:true, controller : controller, index : name}
	        		else obj = {run:false, controller:controller, index: name}

	      		}else{
	      			try {	
	      				
	      				let file = ROOT+'/api/policies/'+value+'.js'
						let src = require('fs').readFileSync(file);
						let err = require('syntax-error')(src, file);
						if (err) throw(err)

		        		let func = require(ROOT+'/api/policies/'+value+'.js')
		        		if(policyFiles.contains(value)) obj = {run:true, controller : controller, index : name, func : func}
	      			}catch(err){
	      				return log.error(err)
	      			}
	      		}

	      		policyResults.push(obj)

	      	}else {
	      		
	      		try {	
	      				
	      				let file = ROOT+'/api/controllers/'+controller+'.js'
						let src = require('fs').readFileSync(file);
						let err = require('syntax-error')(src, file);
						if (err) throw(err)
				

		      			let controllerObj = require(ROOT+'/api/controllers/'+controller+'.js')
		      		

			      		for(let name in controllerObj){

				      		if(typeof(value) === "boolean"){

				        		if(value) obj = {run:true, controller : controller, index : name}
				        		else obj = {run:false, controller : controller, index : name}

				      		}else{

				        		let func = require(ROOT+'/api/policies/'+value+'.js')

				        		if(policyFiles.contains(value)) obj = {run : true, controller : controller, index : name, func : func}
				      		}

				      		policyResults.push(obj)	
				      	}
				   
		      	}catch(err){
		      		return log.error(err)
	      		}
	      	}
		})	
	})
  	
	return policyResults
})()