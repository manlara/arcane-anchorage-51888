/**
* The create function is used to take a formated object ({result : {} || [{}], model : string})
* and add the content into the db
*/
'use strict'

var isObject = function(obj){ return Object.prototype.toString.call(obj) !== '[object Object]'  ? false : true; }
var isArray = Array.isArray

var create = function(callback){

    var objs = [], _self = this
    Object.keys(_self).forEach(function(index){

        if(index !== 'identity' && index !== 'globalId'){

            if(_self[index].model){

                if(Array.isArray(_self[index].result)){

                    _self[index].result.forEach(function(item, key){
                        objs.push({

                            model : _self[index].model, 
                            index : index, 
                            item : item || {},
                            key : key

                        })      
                    })
                     

                }else{

                    if(!_self[index].result) _self[index].result = {}
                    if(!_self[index].result._id) objs.push({

                        model : _self[index].model, 
                        index : index, 
                        item : _self[index].result

                    })
    
                }
            }
        }
    })

    if(!objs.length) return callback()
        
    var associate = function(cb){


        var findAssociation = function(item, attributes, parent, name, position){
            var objs = []

            for(let index in attributes){

                if(isArray(attributes[index]) && attributes[index][0].ref) {

                    let _attributes = $[attributes[index][0].ref].attributes
                    let ck = null
                    let c_push = null

                    for(let key in _attributes){

                        if(isObject(_attributes[key]) && _attributes[key].ref === parent){

                            ck = key
                            c_push = false

                        } else if(isArray(_attributes[key]) && _attributes[key][0].ref === parent){

                            ck = key 
                            c_push = true

                        }

                        if(ck) break
                    }

                    objs.push({
                        parent : parent,
                        pn : name,
                        p_push : true,
                        pk : index,
                        pv : item,
                        child : attributes[index][0].ref,
                        position : position,
                        ck : ck || '_id',
                        c_push : c_push
                    })

                } else if(isObject(attributes[index]) && attributes[index].ref) {

                    let _attributes = $[attributes[index].ref].attributes
                    let ck = null
                    let c_push = null

                    for(let key in _attributes){

                        if(isObject(_attributes[key]) && _attributes[key].ref === parent){

                            ck = key
                            c_push = false

                        } else if(isArray(_attributes[key]) && _attributes[key][0].ref === parent){

                            ck = key 
                            c_push = true

                        }

                        if(ck) break
                    }
                    
                    objs.push({
                        parent : parent,
                        pn : name,
                        p_push : false,
                        pk : index,
                        pv : item,
                        child : attributes[index].ref,
                        position : position,
                        ck : ck || '_id',
                        c_push : c_push
                    })
                }
            }

            return objs
        }

        var _objs = []
        for(let index in _self){

            if(_self[index].model){

                let model = _self[index].model.toLowerCase()
                let attributes = $[model].attributes
                let item = _self[index].result

                if(isObject(item)) {
                    _objs = _objs.concat(findAssociation(item, attributes, model, index))
                }
                else if(isArray(item)){

                    item.forEach(function(_item, position){
                        _objs = _objs.concat(findAssociation(_item, attributes, model, index))
                    })
                }
            }
        }

        var _loop = function(obj, _callback){
            
            let childResult = null
            let parentResult = obj.pv
            

            for(let key in _self){

                if(_self[key].model.toLowerCase() === obj.child) {

                    if(_self[obj.pn].mapTo && _self[obj.pn].mapTo[key] === obj.pk){

                        childResult = _self[key].result
                        break

                    } else {

                        if(!childResult) childResult = _self[key].result
                        else if(!isArray(childResult)){

                            childResult = [childResult]
                            childResult.push(_self[key].result)

                        } else childResult.push(_self[key].result)

                        //if(isArray(childResult) && childResult)  break
                    }
                }
            }
            
            if(childResult){ 
               
                if(obj.p_push){
                    if(isArray(childResult)){

                        childResult.forEach(function(item){
                            if(item._id)  parentResult[obj.pk].push(item._id)
                        })
                       
                    }else if(isObject(childResult) && childResult._id) parentResult[obj.pk].push(childResult._id)

                }else parentResult[obj.pk] = childResult._id
                
                if(isArray(parentResult[obj.pk])) parentResult[obj.pk] = parentResult[obj.pk].unique()
                parentResult.save(function(err){
                    if(err) return _callback(err)
                    else {
                        _self[obj.pn].result = parentResult
                        _callback()
                    }
                })

            } else if(parentResult && parentResult._id){
                if(!parentResult[obj.pk] || isArray(parentResult[obj.pk])) _callback()
                else {
                    
                    $[obj.child].findOne({_id : parentResult[obj.pk]}).exec(function(err, response){
                        if(err) return _callback(err)
                        else if(!response) _callback()
                        else {
                            
                            if(obj.c_push) response[obj.ck].push(parentResult._id)
                            else response[obj.ck] = parentResult._id
                            
                            if(isArray(response[obj.ck])) response[obj.ck] = response[obj.ck].unique()
                            response.save(function(err){
                                if(err) return _callback(err)
                                else _callback()
                            })
                        }
                    })
                }
            }
            else _callback()

        }, _done = function(err){
            if(err) return cb(err)
            
            return cb()
        }
        
        async.eachSeries(_objs, _loop, _done)
    }


    var loop = function(obj, cb){

        if(obj.item._id) cb()
        else if(!$[obj.model]) cb()
        else {

            $[obj.model].create(obj.item).exec(function(err,res){ 
                if(err) return cb(err)
                else {

                    if(!obj.key && obj.key !== 0) _self[obj.index].result = res
                    else _self[obj.index].result[obj.key] = res
                    
                    cb()
                }
            })

        }

    }, done = function(err){
        if(err) return callback(err)
        associate(function(err){
            if(err) return callback(err)
            return callback()
        })
    }
    
    async.eachSeries(objs, loop, done)
}

/**
* The update function is used to take a formated object ({result : {} || [{}], model : string})
* and update the content in the db
*/

var update = function (callback){

    var objs = [], _self = this
    Object.keys(_self).forEach(function(index){

        if(index !== 'identity' && index !== 'globalId'){

            if(_self[index].model){

                if(Array.isArray(_self[index].result)){

                    _self[index].result.forEach(function(item, key){
                        objs.push({

                            model : _self[index].model, 
                            index : index, 
                            item : item || {},
                            key : key

                        })      
                    })
                     

                }else{

                    if(_self[index].result && _self[index].result._id) objs.push({

                        model : _self[index].model, 
                        index : index, 
                        item : _self[index].result

                    })
    
                }
            }
        }
    })

    var loop = function(obj, cb){

        if(!obj.item) cb()
        else if(!$[obj.model]) cb()
        else if(!obj.item._id) cb()
        else { 

            var fields = Object.keys(obj.item).toString()
            fields = fields.replace(/,/g, ' ')

            $[obj.model].findOne({_id : obj.item._id}).select(fields).exec(function(err,_item){
                if(err) return cb(err)
                else if(!_item) cb()
                else{

                    for(let key in obj.item){
                        if(_item){
                            // if(isArray(_item[key])) _item[key] = _item[key].concat(obj.item[key]).unique()
                            // else 
                            _item[key] = obj.item[key]
                        }
                    }

                    _item.save(function(err){
                        if(err) return cb(err)
                        else{

                            if(!obj.key && obj.key !== 0) _self[obj.index].result = _item
                            else _self[obj.index].result[obj.key] = _item

                            cb()
                        }
                    })

                }
            })

        }

    }, done = function(err){
        if(err) return callback(err)

        return callback()
    }

    async.eachSeries(objs, loop, done)

}


var combine = function(parent){

    var attributes = _.clone($[parent].attributes)
    var models_accepted = []
    var attributes_map = {}
    var map = {}
    var result = null

    for(let index in this){
        map[this[index].model] = this[index].result
        models_accepted.push({ capital : this[index].model, lowercase : this[index].model.toLowerCase() })
    }

    result = map[parent]
    if(!result) return {}

    var search = function(attribute, index, attributes_map){

        var check = function(attribute){
            var model = null

            if(attribute.ref){
               
                for(let i = 0; i < models_accepted.length; i++){
                    
                    if(models_accepted[i].lowercase === attribute.ref){
                        model = models_accepted[i].capital
                        break
                    }
                }

            } else {

                for(let key in attribute){
                    if(isObject(attribute[key]) || isArray(attribute[key])) search(attribute[key], key, attributes_map[index])
                }
            }
           
            if(model && attributes_map) attributes_map[index] = model
            else if(model) {

                attributes_map = {}
                attributes_map[index] = model
            }
        }

        if(isObject(attribute)) attribute = check(attribute)
    }

    for(let key in attributes){
        if(isObject(attributes[key]) || isArray(attributes[key])) attributes[key] = search(attributes[key], key, attributes_map)
    }
    
    
    for(let model in map){
        if(model === parent) continue

        for(let key in attributes_map){
            result[key] =  map[attributes_map[key]]
        }
    }
    return result
}


var Handler = function(){
    var self = this

    Object.defineProperty(self, "create", {
        get : function(){

            return create

        } 
    })

    Object.defineProperty(self, "update", {
        get : function(){

            return update

        } 
    })

    Object.defineProperty(self, "combine", {
        get : function(){

            return combine

        } 
    })
}

module.exports = Handler