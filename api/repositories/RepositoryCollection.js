var fs = require('fs');

var Collection = {
    init:function(){
        //initialize objs
        var $ = {}
        var _template = require('./_template.js')

        //get path to parent folder
        var path = __dirname
        
        path = path.split('/')
        if(path.length === 1) path = __dirname.split('\\')
        path.pop()
        path = path.join('/')

        //grab files from models folder
        var files = fs.readdirSync(path+'/models')
        files.forEach(function(file){

            //check if its a .js file
            if(file.indexOf('.js') !== -1){
                var model = file.split('.js').shift()
                var template = new _template(model)
                $[model] = template
            }
            
        })
        
        return $
    }
}

module.exports = Collection