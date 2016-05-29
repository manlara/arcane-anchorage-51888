module.exports = function(app, express){

	app.use( require('body-parser').json() ); 
	app.use(require('body-parser').urlencoded({     
	  extended: true
	})); 
	
}