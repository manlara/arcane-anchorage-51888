'use strict'
var fs = require('fs');

var Collection = {
    init:function(){
        
        var getModelsFromDirectories = function(path){
        
            let items = require('fs').readdirSync(path)
            let modelFiles = []
            
            items.forEach(function(item){
                if(!~item.indexOf('.js') && !~item.indexOf('.')) modelFiles = modelFiles.concat(getModelsFromDirectories(path + '/' + item))
                else if(~item.indexOf('.js')) modelFiles.push({path : path + '/' + item, name : item.split('.js').shift() })
            })

            return modelFiles
        }

        var $ = {}
        var _template = require(ROOT+'/lib/repositories/_template.js')

        var models = getModelsFromDirectories(ROOT + '/api/models')
        models.forEach(function(model){

            var template = new _template(model.name)
            
            $[model.name] = template
            $[model.name.toLowerCase()] = template
            
        })
        
        return $
    }
}

module.exports = Collection