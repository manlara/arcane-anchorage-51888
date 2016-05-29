'use strict'

module.exports = (function(){

	var CronJob = require('cron').CronJob
	var getCronsFromDirectories = function(path){
		
		let items = require('fs').readdirSync(path)
		let crons = []
		
		items.forEach(function(item){
			if(!~item.indexOf('.js') && !~item.indexOf('.')) crons = crons.concat(getModelsFromDirectories(path + '/' + item))
			else if(~item.indexOf('.js')) crons.push({path : path + '/' + item, name : item.split('.js').shift() })
		})

		return crons
	}
	
	getCronsFromDirectories(ROOT + '/api/crons').forEach(function(obj){

		let file =obj.path
		let src = require('fs').readFileSync(file);
		let err = require('syntax-error')(src, file);
		if (err) return log.error(err)

		let jobs = require(obj.path)
		
		for(let name in jobs){

			let job = new CronJob(jobs[name])
			job.start();
		}
	})

})()