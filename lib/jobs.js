'use strict'

module.exports = (function(){

	var getJobsFromDirectories = function(path){

		let items = require('fs').readdirSync(path)
		let jobFiles = []
		
		items.forEach(function(item){
			if(!~item.indexOf('.js') && !~item.indexOf('.')) jobFiles = jobFiles.concat(getJobsFromDirectories(path + '/' + item))
			else if(~item.indexOf('.js')) jobFiles.push({path : path + '/' + item, name : item.split('.js').shift() })
		})

		return jobFiles
	}

	var Jobs = {}
	var util = require('util');
	var event_emitter = require('events');

	var Job = function(action, cb){
		
		this.queue = require('bull')(action, { redis : { port : 6379,  host : '127.0.0.1', opts : _$.environment.production ? { auth_pass : '8473bgbhjFF445fffB!!D' } : {}, DB : 1 }})
		this.cb = cb

		var self = this

		this.queue.on('completed', function(job, result){

			var data = job.data

			job.remove().then(function(val) {

				//log.debug('removed job')
				self.emit('completed', data)

			}, function(err) {
				console.log('error', err);
			})
		})

		this.queue.process(function(job, done){
			self.emit('job', job)
			cb(job.data, function(err){
				if(err) return done(err)
				return done()
			})
		})
	}

	var Wrapper = function(name, actions){
		if(this instanceof Wrapper === false) return new Wrapper(name)

		this.name = name
		this.actions = actions
		this.custom_jobs = {}
		this.jobs = {}

		for(let action in actions){
			if(!this.jobs[action]) this.jobs[action] = new Job(this.name + '_' + action, actions[action])
		}		
	}

	util.inherits(Wrapper, event_emitter)
	util.inherits(Job, event_emitter)

	Wrapper.prototype.enqueue = function(action, data, cb){
		if(!this.jobs[action] && cb) this.jobs[action] = new Job(this.name + '_' + action, cb)
		if(!this.jobs[action] || !this.jobs[action].queue) throw 'No job found for ' + action
		
		this.jobs[action].queue.add(data)

		return this.jobs[action]
	} 

	getJobsFromDirectories(ROOT + '/api/jobs').forEach(function(obj){
		
		let file = obj.path
		let src = require('fs').readFileSync(file);
		let err = require('syntax-error')(src, file);
		if (err) return log.error(err)

		Jobs[obj.name] = new Wrapper(obj.name, require(obj.path))
	})
	
	return Jobs
	
})()