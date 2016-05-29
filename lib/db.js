var MongoDb = require('mongodb').MongoClient
var custom = require(ROOT + '/config/db.js')

var url = 'mongodb://'
if(custom.user && custom.password) url += custom.user + ':' + custom.password + '@'
url += custom.host + ':' + custom.port + '/' + custom.database

module.exports = {

	connect : function(cb){
		var self = this

		MongoDb.connect(url, function(err, db) {
			if(err) return cb(err)
			return cb(null, self.init(db))
		})
	},

	init : function(db){

		var models = require('fs').readdirSync(ROOT + '/api/models')
		var names = []
		var result = {}

		models.forEach(function(model){
			if(model !== '.DS_Store') names.push(model.replace('.js', ''))
		})

		names.forEach(function(name){
			result[name.toLowerCase()] = db.collection(name.toLowerCase());
			result[name.toLowerCase()].attributes = require(ROOT + '/api/models/' + name + '.js').attributes
		})

		var association = this.map(result)

		return { 
			collections : result, 
			map : association
		}
	},

	map : function(result){

		var map = { 'one-to-one' : {}, 'many-to-many' : {}, 'one-to-many' : {} }

		var isManyToOne = function(obj, index, via){
			if(!obj.collection || obj.model) return false
			
			if(!via) throw 'No via specified for collection'
			if(!result[obj.collection]) throw 'No Model'

			if(Object.prototype.toString.call(result[obj.collection].attributes[via]) !== '[object Object]') throw 'Not Associated correctly'
			if(!result[obj.collection].attributes[via].model) return false

			return true
		}

		var isManyToMany = function(obj, index, via){
			if(!obj.collection || obj.model) return false

			if(!via) throw 'No via specified for collection'
			if(!result[obj.collection]) throw 'No Model'

			if(Object.prototype.toString.call(result[obj.collection].attributes[via]) !== '[object Object]') throw 'Not Associated correctly'
			if(!result[obj.collection].attributes[via].collection) return false

			if(!result[obj.collection].attributes[via].via) throw 'No via in this association'

			return true
			
		}

		for(model in result){
			
			for(index in result[model].attributes){
				
				if(Object.prototype.toString.call(result[model].attributes[index]) === '[object Object]') {

					var associationType = null, response = null;
					var item = result[model].attributes[index]

					if(!item.model || item.collection){

						var _isManyToOne = isManyToOne(item, index, item.via || null)
						var _isManyToMany = isManyToMany(item, index, item.via || null)
						
						if(_isManyToOne) associationType = 'one-to-many'
						if(_isManyToMany) associationType = 'many-to-many'

					} else if(item.model) associationType = 'one-to-one'

					if(associationType){

						if(!map[associationType][model]) map[associationType][model] = {}

						var obj = { model : item.model || item.collection }
						if(item.via) obj.field = item.via

						map[associationType][model][index] = obj
					}
				}
			}
		}

		return map
	}
}

/*
var mongoose = require('mongoose');
var dbInfo = require('../db.js')

module.exports = {
	init:function(cb){
		//start mongoose conncetion with params
		mongoose.connect('mongodb://'+dbInfo.mongo.user+':'+dbInfo.mongo.password+'@'+dbInfo.mongo.host+':'+dbInfo.mongo.port+'/'+dbInfo.mongo.database);
		var db = mongoose.connection;
		//check if it errors
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function () { //OPEN!!
			return cb(db)
		})
	}
}
*/