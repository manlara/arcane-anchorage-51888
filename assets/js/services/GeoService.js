var Geocoder = function(google_lib){
    this.google_lib = google_lib
}

// Geocoder.prototype.init = function(google){
//     this.google = google
//     //google.KEY = 'AIzaSyBqZxSLkD__kFo3cz1pZL7jhpBESgmYefE'
//     this.main = new google.maps.Geocoder();
// }

Geocoder.prototype.find = function(param, cb){
    if(!param || typeof param !== 'object') return cb();
    
    var self = this
    var loadGoogle = function(run, _cb){
        self.google_lib.load(function(google){
            self.google = google
            self.main = new self.google.maps.Geocoder();
            return _cb()
        })
    }

    loadGoogle(this.google_lib.isLoaded(), function(){
        self.main.geocode(param, function(results, status) {
           
            if (status == self.google.maps.GeocoderStatus.OK) {
                if(!results || results.length === 0) return cb()

                var data = results.shift()
                console.log(data)
                var result = {}
                var indexes = {
                    'address_components':[
                        {type:'postal_code', index:'zip'},
                        {type:'locality', index:'city'},
                        {type:'sublocality', index:'city'},
                        {type:'neighborhood', index:'city'},
                        {type:'administrative_area_level_1', index:'state'},
                        {type:'country', index:'country'}
                    ],
                    'geometry':{}
                };

                for(var key in indexes){
                    if(key === 'address_components'){
                        data[key].forEach(function(addressObj){
                            addressObj.types.forEach(function(type){
                                indexes[key].forEach(function(formatObj, order){
                                    if(formatObj.type === type && (!result[formatObj.index] || result[formatObj.index].order > order)){
                                        result[formatObj.index] =  { name : type !== 'administrative_area_level_1' ? 
                                            addressObj.long_name : addressObj.short_name, order : order} ;
                                    }
                                });
                            });
                        });
                    }

                    if(key === 'geometry' && data[key]){
                        result.viewport = data[key].viewport
                        data[key].location ? result.lat = data[key].location.lat() : null
                        data[key].location ? result.lng = data[key].location.lng() : null
                    }
                }   

                for(var key in result){
                    if(result[key].name) result[key] = result[key].name
                }

                return cb(null,result);
            }
            return cb();
        })
    })
}

define(['google maps'], function(google_lib){
    //console.log(google.load())
    google_lib.KEY = 'AIzaSyBqZxSLkD__kFo3cz1pZL7jhpBESgmYefE'
    return new Geocoder(google_lib)
    
})

var HtmlLocation = function(cb){
    var _self = this
    _self.lat = null, _self.lng = null

    _self.getPosition = function(position){
        _self.lat = position.coords.latitude;
        _self.lng = position.coords.longitude;

        return cb({lat:_self.lat, lng:_self.lng})
    }

    _self.error = function(err){
        if (err.code == 1) {
            alert('We will not be able to show you teachers in your area')
        }else alert(err.code);
    }
    console.log('hoh')

    if (navigator.geolocation) {
        console.log('gfg')
        navigator.geolocation.getCurrentPosition(_self.getPosition, _self.error);
    } else {
        alert('Your device doesnt support html position service')
    }

    
}
