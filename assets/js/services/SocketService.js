define(['socket'], function(io){

	var SocketService = function(url, options){
		if (this instanceof SocketService === false) return new SocketService(url, options)
		this.url = url
		this.socket = io(url, options);
	}

	SocketService.prototype.on = function(channel, cb){
		return this.socket.on(channel, cb)
	}

	SocketService.prototype.emit = function(channel, message){
		return this.socket.emit(channel, message)
	}
	return SocketService
})