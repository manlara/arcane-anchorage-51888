module.exports = function(app, express){

	return app.use(function(req, res, next){

		req.upload = function(cb){

			var multiparty = require('multiparty')
			var form = new multiparty.Form({uploadDir : ROOT + '/assets/images/tmp'})

			form.on('progress', function(){
				log.debug('in progress')
			})

			form.parse(this, function(err, fields, files) {
				var fileNames = []
				if(!files) return cb('No files found')
				
				var loop = function(name, callback){

					var _loop = function(index, _callback){
						
						'use strict'

						let file = files[name][index]
						let path = ROOT + '/assets/images/tmp/'+file.fieldName

						fileNames.push(file.fieldName)
						require('fs').rename(file.path, path, _callback)

					}, _done = function(err){
						if(err) return callback(err)
						else callback()
					}

					if(!files[name]) return callback('No file')
					else async.eachSeries(Object.keys(files[name]), _loop, _done)

				}, done = function(err){
					if(err) return cb(err)
					
					return cb(null, fileNames)
				}

				async.eachSeries(Object.keys(files), loop, done)
			});

		}

		return next()
	})
}