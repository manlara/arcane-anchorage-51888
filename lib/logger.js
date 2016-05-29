
module.exports = {

    init : function(){

        var chalk = require('chalk')
        var colors = require(ROOT+'/config/log.js').colors
		  
		return {

			'info' : function(message){ 
                var body_color = colors['info'].body
                var head_color = colors['info'].head

                return console.log(chalk[head_color]('info => ') + '%s', chalk[body_color](message))
            },

			'debug' : function(message){
                var body_color = colors['debug'].body
                var head_color = colors['debug'].head

                return console.log(chalk[head_color]('debug => ') + '%s', chalk[body_color](message))
            },

			'warn' : function(message){
                var body_color = colors['warn'].body
                var head_color = colors['warn'].head

                return console.log(chalk[head_color]('warn => ') + '%s', chalk[body_color](message))
            },

			'error' : function(message){

                var body_color = colors['error'].body
                var head_color = colors['error'].head

                console.trace(chalk[body_color](message))
                throw chalk[body_color](message.message)
            } 
 		}
	}
}