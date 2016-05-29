
Array.prototype.clean = function() {
    var i = this.length;
    var clean = []
    while (i--) {
        this[i] = this[i].trim()
        if (this[i] && this[i].length) {
            clean.push(this[i])
        }
    }
    return clean.reverse();
}

Array.prototype.unique = function(){
    var temp = {};
    for (var i = 0; i < this.length; i++)
        temp[this[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

String.prototype.ucFirst = function(){
    if(!this.length) return this

    var string_array = this.split(' ')
    _.each(string_array,function(word, key){
            var word_array = word.split('')
            var fChar = word_array.shift()
            
            if(fChar) fChar = fChar.toUpperCase()
            else fChar = ''

            var ucFWord = fChar + word_array.join('');
            string_array[key] = ucFWord
    })
    return string_array.join(' ')
}

Array.prototype.contains = function(obj) {
    if(!obj) return false;
    var i = this.length;
    while (i--) {
        if (this[i].trim().toLowerCase() === obj.trim().toLowerCase()) {
            return true;
        }
    }
    return false;
}

Date.prototype.getDaysInMonth = function(){
    var year  = this.getFullYear(),
        month = this.getMonth()
    // On a leap year the number of days in Feb change from 28 to 29
    // Rules for leap year:
    // 1) Every 4th year is a leap year
    // 2) However, every 100th year is NOT a leap year
    // 3) Every 400th year is a leap year
    var leap_year = (year%4==0 && year%100!=0) || year%400==0;
    // Months are in integers starting with 'Jan': 0
    if (month==1 && !leap_year) {return 28}
    if (month==1 && leap_year)  {return 29}
    if (month>6) {month--;}
    if (month%2==0) {return 31}
    else {return 30}
}

String.prototype.display = function(){
    if(!this.length) return this

    var string_array = this.split(' ')

    var first = string_array.shift()
    var last = string_array.pop()

    var array = last ? [first, last] : [first]
    array.forEach(function(item, key){

        if(key === 0){

            var word_array = first.split('')
            var fChar = word_array.shift()
            var ucFWord = fChar.toUpperCase() + word_array.join('');

            array[key] = ucFWord

        }else {

            var word_array = last.split('')
            var fChar = word_array.shift()

            array[key] = fChar.toUpperCase() + '.'
        }
    })

    return array.join(' ')
}


Date.prototype.timeSince = function(date) {

    var seconds = 0
    if(this > date) seconds = Math.floor((this - date) / 1000); 
    else seconds = Math.floor((date - this) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        if(interval > 1) return interval + " years ago";
        return interval + " year ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        if(interval > 1) return interval + " months ago";
        return interval + " month ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        if(interval > 1) return interval + " days ago";
        return interval + " day ago";
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        if(interval > 1) return interval + " hours ago";
        return interval + " hour ago";
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        if(interval > 1) return interval + " minutes ago";
        return interval + " minute ago";
    }

    return Math.floor(seconds) + " seconds ago";
}

// day starts 'Sun': 0 but our calendar starts Mon
Date.prototype.getWeekday = function(){
    var day_of_week = this.getDay()-1
    if (day_of_week<0) {day_of_week += 7}
    return day_of_week
}
