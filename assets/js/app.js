// requirejs.config({
//     "baseUrl": "/js",
//     "paths": {
//      	"/": "../",
//      	"google maps" : "https://maps.googleapis.com/maps/api/js?key=AIzaSyBqZxSLkD__kFo3cz1pZL7jhpBESgmYefE",
//      	"socket" : "https://cdn.socket.io/socket.io-1.3.7",
//      	"braintree" : "https://js.braintreegateway.com/v2/braintree"
//     }
// });



(function( $ ) {

	$.fn._on = function(){
		if(!$.custom) $.custom = {binds : []}

		var eventType = arguments['0']
		var selector = arguments['1'] 
		var keys = Object.keys(arguments)

		var cb = arguments[keys[keys.length - 1].toString()]

		if(this.selector){
			
			$(document).off(eventType, this.selector)
			$(document).on(eventType, this.selector, cb)

			$.custom.binds.push({element : this.selector, eventType : eventType})
		}else{

			if(selector){
				
				$(this).off(eventType, selector)
				$(this).on(eventType, selector, cb)

				$.custom.binds.push({element : selector, eventType : eventType})
			}

		}
	}

}( jQuery ));
