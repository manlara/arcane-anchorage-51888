module.exports = function(app, express){

	return app.use(function(req, res, next){
        
		var local = require(ROOT + '/config/local.js') || {}		
		if(req.header('host').match('www')) {
            
			if(local && typeof local.redirects === 'boolean' && !local.redirects) return next()
				
            var host = req.header('host').replace('www.', '')
            return res.redirect(301, 'https://'+ host + req.originalUrl)

        }else if(!req.headers['x-forwarded-proto'] || req.headers['x-forwarded-proto'] !== "https"){
            
        	if(local && typeof local.redirects === 'boolean' && !local.redirects) return next()
            
            var host = req.headers.host.split(':').shift()
            return res.redirect(301, 'https://'+ host + req.originalUrl)
            
        }else return next()
	})

}