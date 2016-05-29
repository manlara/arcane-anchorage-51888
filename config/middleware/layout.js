'use strict'

module.exports = function(app, express){

	var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }
	app.use(function(req, res, next){

		let render = res.render, layout = app.locals.settings['view options'].layout
		res.view = function(view, options, helpers, fn){

			function findController(){
				var method = 'get'
				var routes = require(ROOT + '/config/routes.js')

				for(let i = 0; i < Object.keys(req.route.methods).length; i++){

					let _method = Object.keys(req.route.methods)[i]
					if(req.route.methods[method]){
						method = _method
						break
					}
				}

				var value = routes[method+' '+req.route.path]
				if(!value || isObject(value)) return 

				var controller = value.split('.').shift().toLowerCase()
				controller = controller.split('/')

				if(controller.length > 1) controller = controller.pop()
				else controller = controller.shift()

				controller = controller.split('controller').shift()
				return controller
			}

			var helpersObj = {}
			var _helpers = _$.helpers
			helpers = helpers || []

			if(_helpers.global) Object.keys(_helpers.global).forEach(function(funcName){
				helpersObj[funcName] = _helpers.global[funcName]
			})

			let controller = findController()
			if(_helpers[controller]) Object.keys(_helpers[controller]).forEach(function(funcName){

				if(!helpers.length) helpersObj[funcName] = _helpers[controller][funcName]
				else if(helpers.contains(funcName)) helpersObj[funcName] = _helpers[controller][funcName]
			
			})

			helpersObj['isAuthenticated'] = req.isAuthenticated()
			helpersObj['req'] = req
			helpersObj['_CSRF'] = req.csrfToken()

			options = options || {}
			options = _.extend(options, helpersObj);

			try {
				render.call(res, view, options, function (err, str) {
					if(err) throw err

					let _helpers = _$.helpers
					let locals = {
						body : str
					}

					locals = _.extend(locals, helpersObj);
				
					return render.call(res, layout, locals, fn)
				})
			}catch(err){

				if(_$.environment.production) {
					console.log(err.toString())
					return res.status(500).end('An error occured on page')
				}
				
				return res.status(500).end(err.toString())
			}

		}

		if(req.isAuthenticated) return next()
		else {
			req.isAuthenticated = function(){
				return false
			}
		}

		return next()
	})

}