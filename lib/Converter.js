'use strict'

var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }
var isArray = Array.isArray

var Fill = function(cb){
	var objs = []
	var self = this

	var findAssociations = function(targetModel, index){
		var targetAttributes = $[targetModel].attributes
		
		for(var key in targetAttributes){

			if(!isObject(targetAttributes[key]) && !isArray(targetAttributes[key])) continue
			if(isArray(targetAttributes[key]) && !targetAttributes[key][0].ref) continue
			if(isObject(targetAttributes[key]) && !targetAttributes[key].ref) continue
			
			let Model = isArray(targetAttributes[key]) ? targetAttributes[key][0].ref : targetAttributes[key].ref
			let attributes = $[Model].attributes

			for(let key in attributes){

				if(!isObject(attributes[key]) && !isArray(attributes[key])) continue
				if(isArray(attributes[key]) && !attributes[key][0].ref) continue
				if(isObject(attributes[key]) && !attributes[key].ref) continue

				let _Model = isArray(attributes[key]) ? attributes[key][0].ref : attributes[key].ref
				if(_Model === targetModel){
					
					if(!self[Model]) continue
					
					if(self[Model][key]) self[targetModel]._id = self[Model][key]
					else if(!self[Model]._id) continue
					else objs.push({
						Model : Model,
						targetModel : targetModel,
						query : { _id: self[Model]._id },
						attribute : key,
						index : index
					})
				}
			}
		}
	}

	for(var model in self){
		if(!$[model]) continue

		if(isObject(self[model]) && !self[model]._id) findAssociations(model)
		else if(isArray(self[model])){

			self[model].forEach(function(item, index){
				if(item && !item._id) findAssociations(model, index)
			})
		}	
	}
	
	var loop = function(obj, callback){

		$[obj.Model].findOne(obj.query).select('_id '+ obj.attribute).exec(function(err, res){
			if(err) return callback(err)
			else if(!res) callback()
			else{
				if(obj.index || obj.index === 0) self[obj.targetModel][obj.index]._id = res[obj.attribute]
				else self[obj.targetModel]._id = res[obj.attribute]
				callback()
			}
		})

	}, done = function(err){
		if(err) return cb(err)
		return cb(null, self)
	}
	
	async.eachSeries(objs, loop, done)
}

/**
* @input Object
* format : { model : value }
* This function takes in a formated input and breaks down the input to components that reflect its given model
*/

var Converter = function(input){

	if(!input || !isObject(input)) return 

	var self = this
	var response = {}
	var exceptions = {}

	for(let model in global.models){
		if(model[model.length - 1] === 's') exceptions[model.substring(0, model.length - 1)] = model
	}
	
	var map = function(model, obj){
		var attributes = _.clone($[model].attributes)

		if(!response[model]) response[model] = {}
		else if(isObject(response[model])) response[model] = [response[model]]

		var _obj = isObject(response[model]) ? response[model] : {}

		for(let key in obj){
			if(key === '_id' || key === 'id') _obj[key] = obj[key]
			else{

				if(attributes[key] && (isObject(attributes[key]) || isArray(attributes[key]))){
					let model = isArray(attributes[key]) ? attributes[key][0].ref : attributes[key].ref

					if(model && isArray(obj[key])) loopThruItems(model, obj[key])
					else if(model && isObject(obj[key])) map(model, obj[key])
					else _obj[key] = self.validate(obj, key, attributes[key])

				} else if(attributes[key]) _obj[key] = self.validate(obj, key, attributes[key])

			}
		}

		isObject(response[model]) ? response[model] = _obj : response[model].push(_obj)
	}

	var loopThruItems = function(model, items){

		var attributes = _.clone($[model].attributes)
		if(!response[model]) response[model] = []
		
		var checkItem = function(item, obj, attributes){
			for(let key in item){
				if(key === '_id' || key === 'id') obj[key] = item[key]
				else {
					if(attributes[key] && (isObject(attributes[key]) || isArray(attributes[key]))){
						let model = isArray(attributes[key]) ? attributes[key][0].ref : attributes[key].ref

						if(model && isArray(item[key])) loopThruItems(model, item[key])
						else if(model && isObject(item[key])) map(model, item[key])
						else if(isObject(item[key])) obj[key] = checkItem(item[key], {}, attributes[key]);
						else obj[key] = self.validate(item, key, attributes[key])
						
					} else if(attributes[key]) obj[key] = self.validate(item, key, attributes[key])

				}
			}

			return obj
		}

		items.forEach(function(item){
			let obj = isObject(response[model]) ? response[model] : {}
			isObject(response[model]) ? response[model] = checkItem(item, obj, attributes) : response[model].push(checkItem(item, obj, attributes))
		})
	}

	for(let model in input){

		let returnType  = isArray(input[model]) ? Array() : null
		if(!returnType) returnType = isObject(input[model]) ? Object() : null
			
		if(!returnType) continue
		
		let items = isArray(returnType) ? input[model] : [ input[model] ]

		if(exceptions[model]) model = exceptions[model]
		if(!$[model]) continue

		if(!response[model]) response[model] = isArray(returnType) ? [] : {}
		
		loopThruItems(model, items)
	}
	
	Object.defineProperty(response, "fill", {
		get : function(){
			return Fill
		} 
	})

	return response
}

Converter.prototype.validate = function(item, key, type){
	if(!item[key]) return item[key]
	var moment = require('moment')

	if(isObject(type) && type.type){
		type = type.type
	}

	var _type = isObject(type) ? type.type : type;

	switch(_type){
		case 'string' :
			if(typeof item[key] !== 'string') item[key] = item[key].toString()
		break;
		case 'text' :
			if(typeof item[key] !== 'string') item[key] = item[key].toString()
		break;
		case 'integer' :
			if(typeof item[key] !== 'number') item[key] = parseInt(item[key])
		break;
		case 'float' :
			if(typeof item[key] !== 'number') item[key] = parseFloat(item[key])
		break;
		case 'datetime' :
			if(Object.prototype.toString.call(item[key]) !== '[object Date]') item[key] = moment.utc(item[key])
		break;
		case 'date' :
			if(Object.prototype.toString.call(item[key]) !== '[object Date]') item[key] = moment.utc(item[key])
		break;
		case 'boolean' :
			if(typeof item[key] !== 'boolean') item[key] = (item[key] === 'true')
		break;
	}

	return item[key]
}

module.exports = Converter