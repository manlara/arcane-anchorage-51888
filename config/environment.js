var arg = process.argv[process.argv.length - 1]
if(arg && !~arg.indexOf('--')) arg = null


var isStaging = function(){
	return ( arg === '--staging' || process.ENV === 'staging')
}

var isDevelopment = function(){
	return ( arg === '--development' || process.ENV === 'development') 
}

var isProduction = function(){
	return ( arg === '--production' || process.ENV === 'production')
}

module.exports = {
	staging : false,
	development : true,
	production : false
}