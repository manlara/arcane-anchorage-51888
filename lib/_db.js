'use strict'

let file = ROOT + '/config/db.js'
let src = require('fs').readFileSync(file);
let err = require('syntax-error')(src, file);
if (err) return log.error(err)

var custom = require(ROOT + '/config/db.js')
var mongoose = require('mongoose');

module.exports = function(cb){
	
	var loop = function(uri, callback){

		mongoose[uri.name] = mongoose.createConnection(uri.value)
		mongoose[uri.name].on('error', console.error.bind(console, 'connection error:'))
		mongoose[uri.name].once('open', function () {
			callback()
		})

	}, done = function(err){
		if(err) return cb(err)

	    var cacheManager = require('cache-manager');
	    var redisStore = require('cache-manager-redis');
	    
	    _$.cache = cacheManager.caching(_.extend({}, custom.redis.app, { store: redisStore }))
	    _$.tokens = {
	    	email : cacheManager.caching(_.extend({}, custom.redis.tokens.email, { store: redisStore })),
	    	socket : cacheManager.caching(_.extend({}, custom.redis.tokens.socket, { store: redisStore })),
	    }
	    
	    var error = function(err){
	    	console.log(error);
	    }

	    _$.tokens.email.store.events.on('redisError', error)
	    _$.tokens.socket.store.events.on('redisError', error)
	    _$.cache.store.events.on('redisError', error)

	    return cb(mongoose)
	}

	var uris = [
		{ value : custom.mongo.app.toString(), name : 'disambiguation' }
	]

	async.eachSeries(uris, loop, done)
}
