'use strict'

module.exports = function(mongoose, db){

	var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }
	var isArray = Array.isArray
	var isFunction = function(obj){ return Object.prototype.toString.call(obj) !== '[object Function]'  ? false : true; }

	
	var getModelsFromDirectories = function(path){
		
		let items = require('fs').readdirSync(path)
		let modelFiles = []
		
		items.forEach(function(item){
			if(!~item.indexOf('.js') && !~item.indexOf('.')) modelFiles = modelFiles.concat(getModelsFromDirectories(path + '/' + item))
			else if(~item.indexOf('.js')) modelFiles.push({path : path + '/' + item, name : item.split('.js').shift() })
		})

		return modelFiles
	}
	
	var models = {}
	var Schema = mongoose.Schema
	var dbs = {}

	mongoose.connections.forEach(function(connection){
		if(connection.name) dbs[connection.name] = connection
	})

	if(!Object.keys(dbs).length) throw 'No DB setup for ./lib/models.js'

	getModelsFromDirectories(ROOT + '/api/models').forEach(function(obj){

		let file =obj.path
		let src = require('fs').readFileSync(file);
		let err = require('syntax-error')(src, file);
		if (err) return log.error(err)

		let attributes = require(obj.path).attributes
		let _db = (require(obj.path).config && require(obj.path).config.database) ? mongoose[require(obj.path).config.database]  : mongoose[require(ROOT + '/config/db.js').mongo.app.database]
		let methods = []
		let virtuals = []
		let indexes = {}

		var search = function(attribute, index){

			var type_map = {
				'float' : 'number',
				'integer' : 'number',
				'text' : 'string',
				'datetime' : 'date'
			}

			var check = function(attribute){

				if(attribute.index) indexes[index] = 1
				if(Object.keys(attribute).contains('defaultsTo')) attribute.default = attribute.defaultsTo
				if(attribute.type === 'mixed') attribute.type = Schema.Types.Mixed

				if(attribute.type) attribute.type = type_map[attribute.type] || attribute.type
				else if(attribute.model) attribute = attribute.index ? { type : Schema.Types.ObjectId, ref : attribute.model, index : true }  : { type : Schema.Types.ObjectId, ref : attribute.model }
				else if(attribute.collection) attribute = [attribute.index ? { type : Schema.Types.ObjectId, ref : attribute.collection, index : true } : { type : Schema.Types.ObjectId, ref : attribute.collection }]
				else {

					for(let key in attribute){

						if(key === 'type') {

							if(attribute[key] === 'mixed') attribute[key] = Schema.Types.Mixed
							attribute[key] = type_map[attribute[key]] || attribute[key]

						} else if(isObject(attribute[key]) || isArray(attribute[key])) attribute[key] = search(attribute[key], key)
						else if(isFunction(attribute[key])) {

							virtuals.push({ name : key, value : attribute[key] })
							delete attributes[key]

						} else attribute[key] = type_map[attribute[key]] || attribute[key]
					}
				}

				return attribute
			}

			if(isObject(attribute)) attribute = check(attribute)
			else if(isArray(attribute) && isObject(attribute[0])) attribute[0] = check(attribute[0])
			else attribute = type_map[attribute] || attribute

			return attribute
		}

		for(let key in attributes){
			if(isFunction(attributes[key])) {

				methods.push({ name : key, value : attributes[key]})
				delete attributes[key]

			} else attributes[key] = search(attributes[key], key)
		}

		var timestamps = { 
			createdAt: 'created_at', 
			updatedAt: 'updated_at' 
		}

		if(attributes['created_at']) timestamps = {
			updatedAt: 'updated_at' 
		}

		//if(obj.name.toLowerCase() === 'providers') console.log(attributes)
		let schema = new Schema(attributes, { 
			collection: obj.name.toLowerCase(),
			autoIndex: true,
			timestamps: timestamps
		})

		virtuals.forEach(function(item){
			schema.virtual(item.name).get(item.value)
		})
		

		if(require(obj.path)['beforeUpdate'] || require(obj.path)['beforeCreate']) schema.pre('save', function(next){ 
			var self = this	

			if(require(obj.path)['beforeCreate'] && require(obj.path)['beforeUpdate']){

				if(!self.isNew){

					require(obj.path)['beforeUpdate'](self, function(err, values){
						self = values
						next()
					})

				}else {
					
					require(obj.path)['beforeCreate'](self, function(err, values){
						self = values
						next()
					})

				}

			} else if(require(obj.path)['beforeUpdate'] && !self.isNew){

				require(obj.path)['beforeUpdate'](self, function(err, values){
					self = values
					next()
				}) 

			} else if(require(obj.path)['beforeCreate'] && self.isNew){

				require(obj.path)['beforeCreate'](self, function(err, values){
					self = values
					next()
				}) 
			} else next()
		})

		methods.forEach(function(method){
			schema.methods[method.name] = method.value
		})
		
		models[obj.name.toLowerCase()] = _db.model(obj.name.toLowerCase(), schema);
		models[obj.name.toLowerCase()].attributes = require(obj.path).attributes
		
		//if(obj.name.toLowerCase() === 'cities') console.log(_db)
	})

	return models
}