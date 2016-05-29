'use strict'

module.exports = {
	
	TRANSFORMOBJECT : function (doc, ret, options) {
      
        var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }
        var isArray = Array.isArray

        var convert = function(ret){

        	var obj = {}          
         	for(let key in ret){
            
           		if(isObject(ret[key]) && ret[key]._bsontype === 'ObjectID')obj[key] =  ret[key].toString()
           		else if(isArray(ret[key])){

	           		obj[key] = []
	           		ret[key].forEach(function(item, index){
	           			if(isObject(item) && item._bsontype === 'ObjectID') obj[key].push(ret[key][index].toString())
	           		})

           		}else {
           			obj[key] = ret[key]
           		}
         	}

         	return obj
        }
        
        if(isArray(ret)){

         ret.forEach(function(item, index){
           ret[index] = convert(item)
         })

        } else if(isObject(ret)) ret = convert(ret)

        return ret
    }
}

var local = require(ROOT + '/config/local.js') || {}

