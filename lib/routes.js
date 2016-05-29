'use strict'

module.exports = function(_$, policies){

	var routes = require(ROOT + '/config/routes.js')
	var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }

	var HasPolicy = function(controller_name, action){

		for(let i = 0; i < policies.length; i++){

			let matches = (policies[i].controller === controller_name && policies[i].index === action)

			if(matches){

				if(!policies[i].run){

    				var notRunFunc = function(req, res, next){
    					return res.status(404).end()
    				}

    				return notRunFunc
    		
    			}else{

    				if(policies[i].func) return policies[i].func
    				else return false
    			}

    			break
			}
		}

		return false
	}

	for(let request in routes){

		let path = routes[request]

		request = request.trim()
		let method = request.split(' ').shift()
		let url = request.split(' ').pop()

		let controller_name = null
		let action = null

		if(!isObject(path)){

			path = path.trim()

			controller_name = path.split('.').shift()
			action = path.split('.').pop()

		} 

		try { 

			let file = null
			let src = null
			let err = null

			if(controller_name){
				file = ROOT + '/api/controllers/' + controller_name + '.js'
				src = require('fs').readFileSync(file);
				err = require('syntax-error')(src, file);
			} 
			
			if(err) throw(err)

			let controller = null
			if(controller_name) controller = require(ROOT + '/api/controllers/' + controller_name + '.js')
						
			if(controller && controller[action]) {

				var policy = HasPolicy(controller_name, action)
				
				if(policy) {
					
					_$.app[method](url, policy, controller[action])

					continue
				}

				_$.app[method](url, controller[action])

			} else if(path.view){
				
				let func = function(req, res){
					return res.view(path.view, req.params)
				}

				if(path.policy) {
					
					if(path.middleware) _$.app[method](url, path.policy, path.middleware, func)
					else _$.app[method](url, path.policy, func)

					continue
				}

				if(path.middleware) _$.app[method](url, path.middleware, func)
				else  _$.app[method](url, func)

			} else if(path.__view) {

				if(!path.__view.controller) throw('__view must have a "controller" index')
				if(!path.__view.view) throw('__view must have a "view" index')

				if(path.__view.controller){
					file = ROOT + '/api/controllers/' + path.__view.controller + '.js'
					src = require('fs').readFileSync(file);
					err = require('syntax-error')(src, file);
				} 
				
				if(err) throw(err)

				let obj = require(ROOT + '/api/controllers/' + path.__view.controller + '.js')
				if(!obj.__views) throw('__view must be an index in ' + path.__view.controller)

				let func = obj.__views[path.__view.view].index
				let additional = obj.__views[path.__view.view].helpers

				let urls = [{ url : url, func : func }]
				for(let action in additional){
					urls.push({ url : '/' + path.__view.controller.split('Controller').shift().toLowerCase() + '/'+action, func : additional[action]})
				}
				
				urls.forEach(function(obj){
					if(path.policy) {
						
						if(path.middleware) _$.app[method](obj.url, path.policy, path.middleware, obj.func)
						else _$.app[method](obj.url, path.policy, obj.func)

						return
					}

					if(path.middleware) _$.app[method](obj.url, path.middleware, obj.func)
					else  _$.app[method](obj.url, obj.func)
				})
			}
			
		} catch(err){
			return log.error(err)
		}
	}
}


