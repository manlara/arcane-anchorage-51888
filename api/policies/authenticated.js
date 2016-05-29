module.exports = function(req, res, next){
	log.debug(req.isAuthenticated())
	if(req.isAuthenticated()) return next()

	return res.redirect('/get/out')
}