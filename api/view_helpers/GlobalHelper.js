module.exports = {
	getStates : function(query, only){
		return Data.states(query, only)
	},

	getStateFullName : function(abbrv){
		if(!abbrv) return 

		var fs = require('fs');
		var states = JSON.parse(fs.readFileSync(ROOT+'/data/states.json', 'utf8')).states;

		var state_name = null
		for(var i = 0; i < states.length; i++){
			if(states[i].abbreviation.toLowerCase() === abbrv.toLowerCase()){
				state_name = states[i].name.toLowerCase()
				break
			}	
		}

		return state_name
	},

	getCountries : function(){
		var fs = require('fs');
		return JSON.parse(fs.readFileSync(ROOT+'/data/countries.json', 'utf8'));
	},

	getServices : function(query, only){
		return Data.services(query, only)
	},

	getCategories : function(query, only){
		return Data.categories(query, only)
	},

	getLastDayOfMonth: function(year, month){
        // On a leap year the number of days in Feb change from 28 to 29
        // Rules for leap year:
        // 1) Every 4th year is a leap year
        // 2) However, every 100th year is NOT a leap year
        // 3) Every 400th year is a leap year
        var leap_year = (year%4==0 && year%100!=0) || year%400==0;
        // Months are in integers starting with 'Jan': 0
        if (month==1 && !leap_year) {return 28;}
        if (month==1 && leap_year)  {return 29;}
        if (month>6) {month--;}
        if (month%2==0) {return 31;}
        else {return 30;}
	}
}