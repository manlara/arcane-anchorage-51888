'use strict'

var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }
var isArray = Array.isArray

/**
*	PopulationService is a addon that allows for variable population. It may be used to aggregrate information 	
*	about an association of a quried response
*   @attributes - { Object }
*/

// var PopulationService = function(attributes){
	
// 	if(!isObject(this) && !isArray(this)) return 

//   	var self = this

//   	/* set var to an array form of the self */
//     var objects = isArray(self) ? self : [self]

//     /* loop thru the array form of self to find any other internal associations */
//     objects.forEach(function(object){

//     	for(let key in object){
//     		let attribute = attributes[key]

//     		if(!isObject(attribute)) continue
//     		if(!attribute.collection && !attribute.model) continue

//     		/* found association recurivley call this function again */
//     		let model = attribute.collection || attribute.model
//     		if(isObject(object[key]) || isArray(object[key])) PopulationService.call(object[key], $[model].attributes)
//     	}
//     })

//     if(!self.hasOwnProperty('populate')){
    	
//     	/**
//     	*	setPopulate is a setter defined property that takes the response of the query and sets it to the object
//     	*/

// 	    Object.defineProperty(self, "setPopulate", { 
// 		    set : function (obj) {

// 		    	var self = this

// 		    	if(isObject(self)) self[obj.field] = obj.res
// 		    	else if(isArray(self)) {

// 		    		obj.indexes.forEach(function(index){
// 		    			self[parseInt(index)][obj.field] = obj.res
// 		    		})
// 		    	}
// 		    } 
// 		})

// 	    /**
// 	    *	populate is the getter function that keeps track of all the fields needing population, and the subfileds per population
// 	    */
// 		Object.defineProperty(self, "populate", { 

// 		    get : function(){		        

// 		        /**
// 		        *	Function that ruturns the customized array from of the stack object 
// 		        */
		        
// 		        if(!this.stack) this.stack = {} 
// 		        if(!this.stack.hasOwnProperty('returnArrayForm')) Object.defineProperty(this.stack, 'returnArrayForm', {

// 		        	get:function(){
// 		        		var context = this

// 		        		return function(){

// 		        			var stack = []

// 		        			/* loop thru the stack all the way to the id */
// 		        			for(let model in context){
// 				        		for(let field in context[model]){
// 				        			for(let id in context[model][field]){

// 				        				/* push object into aray */
// 			        					stack.push({
// 			        						indexes : context[model][field][id].indexes,
// 			        						stack_obj : context[model][field][id].stack_obj,
// 			        						model : model,
// 			        						field : field,
// 			        						id : id
// 			        					})

// 				        			}
// 				        		}
// 				        	}

// 				        	return stack
// 		        		}
// 		        	}
// 		        })
			    
// 		        /**
// 		        *	Return function of the get method of the .populate property
// 		        */

// 		        var self = this 
// 		        return function(){

// 		        	/* initialize localized global vars */
// 		        	var field = arguments['0']
// 		        	var select = null
// 		        	var sub_fields = null

// 		        	if(!field) throw 'No field in .populate'

// 		        	/* check if the input is an attribute and an association */
// 		        	var attribute = attributes[field]

// 		        	if(!attribute) throw 'No attribute found'
// 		        	if(!isObject(attribute)) throw 'atrribute not an association'
// 		        	if(!attribute.collection && !attribute.model) throw 'atrribute not an association'

// 		        	/* use arguments var to deduce any option paramters such as select or subfields */
// 		        	if(isObject(arguments['1'])){

// 		        		select = arguments['1']
// 		        		sub_fields = arguments['2'] || null

// 		        	} else sub_fields = arguments['1'] || null
		        	
// 		        	/* loop thru the array from of the self */
// 		        	objects.forEach(function(object, index){

// 		        		/* set important information about the object and deduce a query */
// 		        		let isCollection = attribute.via ? true : false
// 		        		let model = attribute.collection || attribute.model
// 		        		let query = { id : object[field] }

// 		        		if(select) query = _.extend({}, query, select)

// 		        		/* check if the association is a one-to-many or many-to-many*/
// 		        		if(isCollection){

// 		        			query = null
// 		        			let query_index = attribute.via
// 		        			let _attribute = $[model].attributes[query_index]

// 		        			/* check if the query_index is an attribute and an association */
// 		        			if(!_attribute) return
// 		        			if(!isObject(_attribute)) return 
// 		        			if(!_attribute.collection && !_attribute.model) return 

// 		        			query = {}
// 		        			query[query_index] = object.id

// 		        			/* make sure the association is a one-to-many */
// 		        			if(!_attribute.collection) query = _.extend({}, query, select) 
// 		        			else throw 'No query could be deduced, check your many-to-many associations'
// 		        		} 	

// 		        		/* verify that a quey could be deduced and set the stack_obj */
// 		        		if(!query) throw 'No query could be deduced, check associations'
// 		        		let stack_obj = $[model][isCollection ? 'find' : 'findOne'](query)

// 		        		/* attach any sub fields to populate */
// 		        		if(sub_fields) sub_fields.forEach(function(sub_field){
// 		        			if(!isObject(sub_field)) stack_obj = stack_obj.populate(sub_field)
// 		        			else stack_obj = stack_obj.populate(sub_field.name, {select : sub_field.select })
// 		        		})

// 		        		/* start/continue building the main stack obejct */
// 		        		if(!self.stack[model]) self.stack[model] = {}
// 		        		if(!self.stack[model][field]) self.stack[model][field] = {}

// 		        		let id = query.id || query[attribute.via]
// 		        		if(!self.stack[model][field][id]) self.stack[model][field][id] = {}
// 		        		if(!self.stack[model][field][id].indexes) self.stack[model][field][id].indexes = []

// 		        		/* input the stack_obj and indexes into the main stack obejct */
// 		        		self.stack[model][field][id].indexes.push(index)
// 		        		self.stack[model][field][id].stack_obj = stack_obj
// 		        	})
		        	
// 					/**
// 					*	The execution function that is used when everythng is ready to go	
// 					*/
// 			        var exec = function(cb){

// 			        	/* initialize the loop and the done callback for the execution cycles */
// 			        	var loop = function(stack_item, callback){

// 			        		/* execute the orm to find the content needed */
// 			        		stack_item.stack_obj.exec(function(err, response){
// 			        			if(err) return callback(err)
// 			        			else if(!response) callback()
// 			        			else {
// 			        				log.debug(stack_item.model)
// 			        				log.debug(response)
		        					
// 			        				/* pass on the response to the PopulationService to add on .populate feature */
// 			        				PopulationService.call(response, $[stack_item.model].attributes)
// 			        				if(isArray(response)) response.forEach(function(item){
// 			        					PopulationService.call(item, $[stack_item.model].attributes)
// 			        				})

// 			        				/* set the response to the current self */
// 			        				self.setPopulate = { 
// 			        					field : stack_item.field, 
// 			        					res : response, 
// 			        					indexes : stack_item.indexes 
// 			        				}

// 			        				callback()
// 			        			}
// 			        		})

// 			        	}, done = function(err){
// 			        		if(err) return cb(err) 

// 			        		/* memory manage the stack variable */
// 			        		self.stack = null
// 			        		delete self.stack

// 			        		/* get back tot he original self type */
// 			        		if(!isArray(self)) objects = objects.shift() 
// 		                    return cb(null, objects) 
// 			        	}

// 			        	/* start asyn loop to find the items needed */
// 			        	async.eachSeries(self.stack.returnArrayForm(), loop, done)
// 					}

// 		            return {

// 		            	/* set populate for recursive strategy */
// 		                populate : self.populate, 
// 		                sort : function(sortQuery){
		                	
// 		                	/* loop thru array form of the main stack object to add sort parameter */
// 		                	self.stack.returnArrayForm().forEach(function(object){
// 		                		self.stack[object.model][object.field][object.id].stack_obj = object.stack_obj.sort(sortQuery)
// 		                	})

// 		                	return {
// 		                		exec : exec
// 		                	}
// 		                },

// 		                exec : exec
// 		            }
// 		        }
// 		    }
// 		});
//     }

//     /**
//     *	_clean is a getter function that return the cleaned up version of the original items. This function is 
//     *	very important for sending all indexes in an object to the view
//     */

//     if(!self.hasOwnProperty('_clean')) Object.defineProperty(self, '_clean', {

// 		get:function(){

// 			return function(){

//     			var self = this 
//     			var _items = []
    			
//     			objects.forEach(function(object){	    				
//     				_items.push(_.extend({}, {}, object))
//     			})

//     			if(!isArray(self)) _items = _items.shift()
//     			return _items
//     		}
// 		}
// 	})
// }

var PopulationService = function(attributes){

	var self = this
	var objects = isArray(self) ? self : [self]

	objects.forEach(function(object){

    	for(let key in object){
    		let attribute = attributes[key]

    		if(!isArray(attribute) && !isObject(attribute)) continue

    		let model = isArray(attribute) ? attribute[0].ref : attribute.ref
    		if(!model) continue

    		if(isObject(object[key]) || isArray(object[key])) PopulationService.call(object[key], $[model].attributes)
    	}
    })

	if(!this.hasOwnProperty('populate') && isArray(this)){
		
		Object.defineProperty(this, "populate", { 

		    get : function(){
		    	var self = this

		    	return function(context, cb){

		    		if(!self.contexts) self.contexts = {}
		    		self.contexts['!value'] = []

		    		var groupContexts = function(){
		    			if(isObject(context)){

		    				let con = context.path.split('*')

					    	let key = con.shift()
					    	let value = con.length ? con.pop() : null

					    	context.path = value || context.path

					    	if(!value) self.contexts['!value'].push({key : context})
					    	else {
					    		if(!self.contexts[key]) self.contexts[key] = []
					    		self.contexts[key].push({value : context})
					    	} 

		    			} else { 

		    				let con = context.split('*')

					    	let key = con.shift()
					    	let value = con.length ? con.pop() : null

					    	if(!value) self.contexts['!value'].push({key : key})
					    	else {
					    		if(!self.contexts[key]) self.contexts[key] = []
					    		self.contexts[key].push({value : value})
					    	} 
		    			}
		    		}

		    		groupContexts()

			    	if(cb){

						let index = 0
						let loop = function(item, callback){
							index ++

							let _loop = function(key, _callback){

								let _item = item
								if(key !== '!value') _item = _item[key]
								if(!_item) _callback()
								else{

									let objs = self.contexts[key] || []
									
									objs.forEach(function(obj){
										if(key !== objs.length - 1) _item = _item.populate(obj.key || obj.value)
									})

									let obj = objs[objs.length - 1]
									
									if(!obj) _callback()
									else { 
										_item.populate(obj.key || obj.value, function(err, item){
											if(err) return _callback(err)
											else {
												
												//PopulationService.call(item, )
												if(obj.value) self[index - 1][key] = item
												else self[index - 1] = item

												_callback()
											}
										})
									}
								}
							}, _done = function(err){
								if(err) return callback(err)
								else callback()
							}

							async.eachSeries(Object.keys(self.contexts), _loop, _done)

						}, done = function(err){
							if(err) return cb(err)

							self.contexts = null
							return cb(null, self)
						}

						async.eachSeries(self, loop, done)

					} else {

						return {
							populate : self.populate
						}
					}
				}
			}
		})
	}
}

var _template = function(model){

	if(!model) throw 'No Model!!!'

	this.model = model.toLowerCase()
	if(!global.models[this.model]) throw 'No Model!!!'

	this.attributes = global.models[this.model].attributes

}

_template.prototype.findOneAndRemove = function(query){

	var collection = global.models[this.model]

	var _return = {

		exec : function(cb){

			collection.findOneAndRemove(query, cb)
		}  
	}

	return _return 
}

_template.prototype.findOneAndUpdate = function(query, doc){

	var collection = global.models[this.model]

	var _return = {

		exec : function(cb){

			collection.findOneAndUpdate(query, doc, cb)
		}  
	}

	return _return 
}

_template.prototype.find = function(query){

	var collection = global.models[this.model]
	var Query = collection.find(query)
	var optimize = false

	if(query && query.id){ 
		query._id = query.id
		query.id = null
	}

	var _return = {

		optimize : function(_boolean){
			optimize = _boolean
			return _return
		},

		limit : function(num){
			Query = Query.limit(num)
			return _return
		},

		sort : function(str){
			Query = Query.sort(str)
			return _return
		},

		skip : function(num){
			Query = Query.skip(num)
			return _return
		},

		stream : function(){
			return Query.stream()
		},

		select : function(index){
			Query = Query.select(index)
			return _return
		},

		populate : function(index){

			Query = Query.populate(index)

			return _return
		},

		exec : function(cb){

			Query.exec(function(err, response){
				if(err) return cb(err)
				if(!response) return cb()

				PopulationService.call(response, collection.attributes)
				
				return cb(null, response)
			})
		}  
	}

	return _return 
}

_template.prototype.findOne = function(query){

	var collection = global.models[this.model]
	var Query = collection.findOne(query)
	var optimize = false
	var self = this
	if(query && query.id){ 
		query._id = query.id
		query.id = null
	}
	
	var _return = {

		optimize : function(_boolean){
			optimize = _boolean
			return _return
		},


		select : function(index){
			Query = Query.select(index)
			return _return
		},

		populate : function(index){

			Query = Query.populate(index)

			return _return
		},

		exec : function(cb){
			
			Query.exec(function(err, response){
				if(err) return cb(err)
				if(!response) return cb()
				
				PopulationService.call(response, collection.attributes)

				// if(!optimize){
				// 	if((self.model.toLowerCase() === 'providers' || self.model.toLowerCase() === 'clients') && response.image){ 
				// 		response.image = {
				// 			value : response.image.value,
				// 			s3 : response.image.s3,
				// 			cdn : response.image.cdn
				// 		}
				// 	}
				// }
				return cb(null, response)
			})
		}  
	}

	return _return
}

_template.prototype.count = function(query, fields){

	var collection = global.models[this.model]

	return {
		exec : function(cb){
			collection.count(query).exec(cb)
		}  
	}

}

_template.prototype.update = function(query, fields){
	var collection = global.models[this.model]

	return {
		exec : function(cb){
			collection.update(query).exec(cb)
		}  
	}
}

_template.prototype.create = function(query, fields){
	var collection = global.models[this.model]

	return {
		exec : function(cb){
			collection.create(query, cb)
		}  
	}
}

_template.prototype.createEach = function(query, fields){
	var collection = global.models[this.model]

	return {
		exec : function(cb){
			collection.createEach(query).exec(cb)
		}  
	}
}

_template.prototype.destroy = function(query, fields){
	var collection = global.models[this.model]

	return {
		exec : function(cb){
			collection.remove(query, cb)
		}  
	}
}

_template.prototype.destroyEach = function(query, fields){
	var collection = global.models[this.model]

	return {
		exec : function(cb){

			async.eachSeries(queries, function(query, call){

				collection.destroy(query).exec(call)

			}, cb)
		}  
	}
}

module.exports = _template