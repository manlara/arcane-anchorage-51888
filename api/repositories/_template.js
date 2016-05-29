var PopulationService = function(parent_model){

	//check if the the passed in item is a object or an array
	if(!Object.prototype.toString.call(this) === '[object Object]' && !Array.isArray(this)) return self

	//set vars for use later
    var attributes = parent_model.attributes, $ = models, _self = this, Items = Array.isArray(_self) ? _self : [_self]
    var type = Array.isArray(_self) ? Array() : Object() //set the type of the original self, so that it can return with the same type

    //check if this object already has a defined property called populate
    if(!_self.hasOwnProperty('populate')){

    	/**
    		setPopulate is a setter defined property that takes the response of the query and sets it to the object
    	*/

	    Object.defineProperty(_self, "setPopulate", { 
		    set : function (_obj) {
		    	var _this = this

		    	if(Object.prototype.toString.call(_this) === '[object Object]')_this[_obj.field] = _obj.res
		    	else if(Array.isArray(_this)) {
		    		_obj.indexes.forEach(function(index){
		    			_this[parseInt(index)][_obj.field] = _obj.res
		    		})
		    	}

		    } 
		});

	    /**
	    	populate is the getter function that keeps track of all the fields needing population, and the subfileds per population
	    */
		Object.defineProperty(_self, "populate", { 
		    get : function(){
		    	var self = this, items = Array.isArray(self) ? self : [self]
		        if(!self.Queries) self.Queries = {} //make initialize array that holds all the Queries

		        if(!self.Queries.hasOwnProperty('returnArrayForm')){
			        Object.defineProperty(self.Queries, 'returnArrayForm', {
			        	get:function(){
			        		var context = this

			        		return function(){
			        			var Queries = []
					        	Object.keys(context).forEach(function(model){
					        		
					        		Object.keys(context[model]).forEach(function(field){
				        				Object.keys(context[model][field]).forEach(function(id){
				        					Queries.push({
				        						indexes : context[model][field][id].indexes,
				        						Query : context[model][field][id].Query,
				        						model : $[model],
				        						field : field
				        					})
					        			})
					        		})
					        	})

					        	return Queries
			        		}
			        	}
			        })
			    }

		        return function(field, sub_fields){
		        	if(!sub_fields)sub_fields = [] //if no sub fields, just make sure its an empty array
	        
			        //check if the field is in an association attributes in the parent model
			        if(Object.prototype.toString.call(attributes[field]) === '[object Object]' && (attributes[field].collection || attributes[field].model)){
			            items.forEach(function(item, index){

			            	var query = !attributes[field].via ? {id:item[field]} : {}
			            	var Model = attributes[field].collection || attributes[field].model
			            	if(attributes[field].via){
			            		if(Object.prototype.toString.call($[Model].attributes[attributes[field].via]) === '[object Object]'){
			            			if($[Model].attributes[attributes[field].via].collection){
		            					//Model += '_'+attributes[field].via+'__'+$[Model].attributes[attributes[field].via].collection+'_'+field
			            				//query
			            			}else query[attributes[field].via] = item.id
			            		}else query[attributes[field].via] = item.id
			            	}
			         

			            	var Query = $[Model][attributes[field].via ? 'find' : 'findOne'](query)
			            	
			            	sub_fields.forEach(function(sub_field){
			            		Query = Query.populate(sub_field)
			            	})

			            	if(!self.Queries[Model]) self.Queries[Model] = {}
			            	if(!self.Queries[Model][field]) self.Queries[Model][field] = {}
			            	if(!self.Queries[Model][field][query.id || query[attributes[field].via]]) self.Queries[Model][field][query.id || query[attributes[field].via]] = {}

			            	if(!self.Queries[Model][field][query.id || query[attributes[field].via]].indexes) self.Queries[Model][field][query.id || query[attributes[field].via]].indexes = []

			            	self.Queries[Model][field][query.id || query[attributes[field].via]].indexes.push(index)
			            	self.Queries[Model][field][query.id || query[attributes[field].via]].Query = Query
				            
			            })
			        }

			        var exec = function(cb){

	                    //loop thru items that were sent in 
		                async.eachSeries(self.QueriesArrayForm || self.Queries.returnArrayForm(), function(Query, _cb){

		                	//execute the query to get the results
		                    Query.Query.exec(function(err, res){
		                        if(err) return _cb(err) //check for error
		                        else if(!res) _cb() //no results
		                        else{

		                        	//make sure the results also have a population method 
		                            PopulationService.call(res,Query.model)
		                            self.setPopulate = {field:Query.field, res:res, indexes:Query.indexes} //set the results to the item
		                            _cb()

		                        }
		                    })

		                }, function(err){
		                    if(err) return cb(err) //check for error

		                    delete self.Queries //delete unecessary data
		                	delete self.QueriesArrayForm //delete unecessary data

		                    if(!Array.isArray(type)) items = items.shift() //check if the input was an array or object, and respond accordingly
		                    return cb(null, items) //respond to call
		                })
					}

		            return {
		                populate:self.populate, //used to chain population
		                sort:function(sortQuery){
		                	self.QueriesArrayForm = self.Queries.returnArrayForm()
		                	self.QueriesArrayForm.forEach(function(Query){
		                		Query.Query = Query.Query.sort(sortQuery)
		                	})

		                	return {
		                		exec:exec
		                	}
		                },
		                exec:exec
		            }
		        }
		    }
		});
    }

    /**
    	_clean is a getter function that return the cleaned up version of the original items. This function is 
    	very important for sending all indexes in an object to the view
    */

    if(!_self.hasOwnProperty('_clean')){
    	Object.defineProperty(_self, '_clean', {
    		get:function(){
    			return function(){
	    			self = this, _items = [], items = Array.isArray(self) ? self : [self]
	    			
	    			items.forEach(function(item){
	    				var cleanObj = {}
		    			Object.keys(attributes).forEach(function(attribute){
		    				cleanObj[attribute] = item[attribute]
		    			})

	    				cleanObj.id = item.id
	    				_items.push(cleanObj)
	    			})

	    			if(!Array.isArray(type)) _items = _items.shift()
	    			return _items
	    		}
    		}
    	})
    }

    //loop thru items to check for more associations
    Items.forEach(function(item){

    	//loop thru item keys to check for more associations
	    Object.keys(item).forEach(function(key){
	    	//check if the key matches an attribute of the parent model
	        if(Object.prototype.toString.call(attributes[key]) === "[object Object]" && (attributes[key].collection || attributes[key].model)){
	        	
	        	//check that the match is a object
	        	if(Object.prototype.toString.call(item[key]) === "[object Object]"){

	             	PopulationService.call(item[key],$[attributes[key].collection || attributes[key].model])//add population
	        	
	        	}else if(Array.isArray(item[key])){ //match is an array

	        		PopulationService.call(item[key],$[attributes[key].collection || attributes[key].model]) //add population

	        		//loop thru the match items
	        	 	item[key].forEach(function(_item){
	        	 		if(Object.prototype.toString.call(_item) === "[object Object]") PopulationService.call(_item,$[attributes[key].collection || attributes[key].model]) //add population
	        	 	})

	        	}
	        }
	    })
	})
}

var _template = function(model){
	if(model) model = model.toLowerCase()
	this.attributes = models[model].attributes

 	this.save = function(modelObj){
        return {
            exec:function(cb){
                if(typeof modelObj === 'array'){
                    async.eachSeries(modelObj,function(obj,call){
                        obj.save(function(err){
                            if(err) return call(err)
                            else return call()
                        })
                    },function(err){
                        if(err) return cb(err)
                        return cb()
                    })
                }else{
                    modelObj.save(function(err){
                        if(err) return cb(err)
                        return cb(null,modelObj)
                    })
                }
            }
        }
    }

	this.find = function(query, options){
		var _self = this
		
		_self.base = models[model]
		_self.Parent = _self.base.find(query, options)
		_self.populates = [{field:null, model:model}]

		_self.returnObj = {
			populate:function(field){
				_self.Parent = _self.Parent.populate(field)
				var attributes = _self.base.attributes
				var attribute = attributes[field]
				var _model = attributes[field].model || attributes[field].collection
				_self.populates.push({
					field:field,
					model:_model
				})
				return _self.returnObj
			},
			sort:function(str){
				_self.Parent = _self.Parent.sort(str)
				return _self.returnObj
			},
			limit:function(num){
				_self.Parent = _self.Parent.limit(num)
				return _self.returnObj
			},
			exec:function(cb, simple){
				_self.Parent.exec(function(err,res){
					if(err) return cb(err)
					if(res){
						if(!simple) PopulationService.call(res, _self.base)
					}
					return cb(null,res)
				})
			}
		}

		return _self.returnObj
	}

	this.findOne = function(query, options){
		var _self = this
		
		_self.base = models[model]
		_self.Parent = _self.base.findOne(query, options)
		_self.populates = [{field:null, model:model}]

		_self.returnObj = {
			populate:function(field){
				_self.Parent = _self.Parent.populate(field)
				var attributes = _self.base.attributes
				var attribute = attributes[field]
				var _model = attributes[field].model || attributes[field].collection
				_self.populates.push({
					field:field,
					model:_model
				})
				return _self.returnObj
			},
			sort:function(str){
				_self.Parent = _self.Parent.sort(str)
				return _self.returnObj
			},
			exec:function(cb){
				_self.Parent.exec(function(err,res){
					if(err) return cb(err)
					
					PopulationService.call(res, _self.base)
					return cb(null,res)
				})
			}
		}

		return _self.returnObj
	}

	this.count = function(query){
		return{
			exec:function(cb){
				models[model].count(query).exec(function(err,num){
					if(err) return cb(err)
					return cb(null,num)
				})
			}
		}
	}

	this.update = function(query1,query2){
		return {
			exec:function(cb){
				models[model].update(query1,query2).exec(function(err,res){
					if(err) return cb(err)
					return cb(null,res)
				})
			}
		}
	}

	this.create = function(query){
		return {
			exec:function(cb){
				models[model].create(query).exec(function(err,res){
					if(err) return cb(err)
					return cb(null,res)
				})
			}
		}
	}

	this.createEach = function(query){
		return {
			exec:function(cb){
				if(!Array.isArray(query) || query.length === 0) return cb()
				models[model].createEach(query).exec(function(err,res){
					if(err) return cb(err)
					return cb(null,res)
				})
			}
		}
	}

	this.destroy = function(queries){
		return {
			exec:function(cb){
				models[model].destroy(queries).exec(function(err,res){
					if(err) return cb(err)
					return cb(null,res)
				})
			}
		}
	}

	this.destroyEach = function(queries){
		return {
			exec:function(cb){
				if(!queries.length) return cb()

				async.eachSeries(queries, function(query, call){
					models[model].destroy(query).exec(function(err){
						if(err) return call(err)
						else call()
					})
				}, function(err){
					if(err) return cb(err)
					return cb()
				})
			}
		}
	}
}

module.exports = _template