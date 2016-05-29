define(function(){

	var RequestService = function(type,url,params,cb){

        $.ajax({
            url: url,
            type: type,
            data:params,
            success: function(result) {
                console.log('success')
                return cb(null,result)
            },
            error:function(err){
                console.log('fail')
                return cb(err)
            }
        });

    }

    Object.defineProperty(RequestService, 'checkParams', {
    	get : function(){

    		return function(params){

				var key;
				var search = function(item){

					var allow = true
					var keys = Object.keys(item)
					
					for(var i = 0; i < keys.length; i++){

						var _item = item[keys[i]] 
						if(!_item || _item === undefined){ allow = false; key = keys[i]; break; }

						if(Object.prototype.toString.call(_item) === '[object Object]'){

							if(!search(_item)) return false

						}else if(Array.isArray(_item)){
							for(var z = 0; z < _item.length; z++){
								if(Object.prototype.toString.call(_item[z]) === '[object Object]' || Array.isArray(_item[z])){
									if(!search(_item[z])) { allow = false; key = keys[i]; break; }
								}
							}

							if(!allow) return false
						}
					}

					return allow
				}
			
				return {

					success : search(params),
					index : key

				} 
			}
    	}
    })

	return RequestService
})