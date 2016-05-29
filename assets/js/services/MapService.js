define(['google maps'], function(google){

	var MapService = function(){
		this.google = google

	}

	MapService.prototype.setMap = function($element, options){
		this.map = new this.google.maps.Map($element, optons);
	}

	MapService.prototype.setCenter = function(lat, lng){
		this.map.setCenter(new this.google.maps.LatLng({lat: lat, lng: lng}));
	}

	return MapService
})