var ObjectID = require('mongodb').ObjectID

var fixIds = function(model){
	var self = this

	if(this && this.id) {
		this._id = new ObjectID(this.id)
		delete this.id
	}

	for(key in this){
		if(global.db.map['one-to-one'][model]){
			if(global.db.map['one-to-one'][model][key]) self[key] = new ObjectID(self[key])
		}
	}

	return this
}

// var validate = function(model){
// 	var self = this
// 	var attributes = global.models[model].attributes

// 	var checkType = function(type){
// 		switch(type){
// 			case 'string' :
// 			break;
// 			case 'text' :
// 			break;
// 			case 'integer' :
// 			break;
// 			case 'float' :
// 			break;
// 			case 'date' :
// 			break;
// 			case 'time' :
// 			break;
// 			case 'datetime' :
// 			break;
// 			case 'boolean' :
// 			break;
// 			case 'binary' :
// 			break;
// 			case 'array' :
// 			break;
// 			case 'json' :
// 			break;
// 		}
// 	}

// 	var checkOptions = function(key){
// 		var obj = attributes[key]
// 		var options = Object.keys(obj)
// 		var self = this

// 		options.forEach(function(option){
// 			switch(option){
// 				case 'type' :
// 					checkType.call(this, attributes[key][option].toLowerCase())
// 				break; 
// 			}
// 		})
// 	}

// 	for(key in this){
// 		if(!attributes[key]) delete this[key]
// 		else {
// 			if(Object.protocol.toString.call(attributes[key]) === '[object Object]') checkOptions.call(self, key)
// 			else checkType.call(self, attributes[key])
// 		}
// 	}
// }




var template = function(model){

	if(!model) throw 'No Model!!!'

	this.model = model.toLowerCase()
	if(!global.db.models[this.model]) throw 'No Model!!!'

	this.attributes = global.db.models[this.model].attributes

}

template.prototype.find = function(query, fields){
	
	fixIds.call(query, this.model)

	var collection = global.db.models[this.model]
	var Query = collection.find(query, {fields : fields})
	var optimize = false

	var _return = {

		limit : function(num){

			num = parseInt(num)
			if(isNaN(num)) throw 'limit must be a number'

			Query = Query.limit(num)
			return _return
		},

		optimize : function(_boolean){
			if(typeof _boolean !== 'boolean') throw 'optimize must be a boolean'

			optimize = _boolean
			return _return
		},

		sort : function(str){
			Query = Query.sort(str)
			return _return
		},

		exec : function(cb){

			Query.toArray(function(err, results) {
				if(err) return cb(err)

				if(!optimize){

					results.forEach(function(result){

						for(key in result){
							if(Object.prototype.toString.call(result[key]) === '[object Object]') {
								if(result[key]._bsontype) result[key] = result[key].toHexString()
							}
						}

						result.id = result._id
						delete result._id
					})
				}

				return cb(null, results)
			})
		}

	}

	return _return 
}

template.prototype.findOne = function(query, fields){

	fixIds.call(query, this.model)

	var collection = global.db.models[this.model]
	var optimize = false

	var _return = {

		optimize : function(_boolean){
			if(typeof _boolean !== 'boolean') throw 'optimize must be a boolean'

			optimize = _boolean
			return _return
		},

		exec : function(cb){
			collection.findOne(query, {fields : fields}, function(err, result){
				if(err) return cb(err)
				if(!result) return cb()

				if(!optimize){
					for(key in result){
						if(Object.prototype.toString.call(result[key]) === '[object Object]') {
							if(result[key]._bsontype) result[key] = result[key].toHexString()
						}
					}

					result.id = result._id
					delete result._id
				}

				return cb(null, result)
			})
		}
	}

	return _return
}

template.prototype.create = function(query){

	fixIds.call(query, this.model)


	var collection = global.db.models[this.model]
	var optimize = false

	var _return = {

		optimize : function(_boolean){
			if(typeof _boolean !== 'boolean') throw 'optimize must be a boolean'

			optimize = _boolean
			return _return
		},

		exec : function(cb){
			collection.insertOne(query, function(err, result){
				if(err) return cb(err)

				result = result.ops.shift()

				if(!optimize){
					for(key in result){
						if(Object.prototype.toString.call(result[key]) === '[object Object]') {
							if(result[key]._bsontype) result[key] = result[key].toHexString()
						}
					}

					result.id = result._id
					delete result._id
				}

				return cb(null, result)
			})
		}
	}

	return _return
}

template.prototype.createEach = function(query, fields){

}

template.prototype.count = function(query, fields){
	
}

template.prototype.update = function(query, fields){
	
}

template.prototype.destroy = function(query, fields){
	
}

template.prototype.destroyEach = function(query, fields){
	
}


module.exports = template