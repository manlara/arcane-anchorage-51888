define(function(){

	var ImageUploadService = function($files){
		if(!$files) return 

		this.$files = $files[0]
		this.images = []
		
		if(!this.$files.files || !Object.keys(this.$files.files).length) return
		this.images = this.parseFiles(this.$files.files)

	}

	ImageUploadService.prototype.parseFiles = function(files){
		var _files = []

		for(key in files){
			if(!isNaN(parseInt(key))) _files.push(files[key])
		}

		return _files
	}


	ImageUploadService.prototype.maxSize = function(files){
		var maxSize = 10
		var isBigger = false

		files.forEach(function(file){
			if(file.size/1000000 > maxSize) isBigger = true
		})

		return isBigger
	}

	ImageUploadService.prototype.upload = function(form, cb){
		
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open('POST', '/providerimage/upload?_csrf='+ejsObj._csrf, true)

		xmlHttp.onload = function(e){
			if(xmlHttp.readyState === 4){
				if (xmlHttp.status === 200) {
                    return cb(null, JSON.parse(xmlHttp.response))
                } else {
                   return cb(xmlHttp)
                }
			}
		}

		xmlHttp.send(form);
	}

	return ImageUploadService
})