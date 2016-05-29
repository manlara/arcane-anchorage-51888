
var routes = {

	/**
	* IndexController routes
	*/
	'get /' : { __view : { controller : 'IndexController', view : 'index' }},
	'get /inspire':'IndexController.inspire',
	
}

module.exports = routes