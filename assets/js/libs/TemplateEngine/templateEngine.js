/*****************************************************************************************/
/*****************************************************************************************/
/*********************************Created By: Mac ****************************************/
/*****************************************************************************************/
/*****************************************************************************************/

var jcf = jcf || null 

var Template = function(page, pages){
    this.page = page || '';
    this.init(pages)
}

Template.prototype.init = function(pages){
    var _pages = []
    var _map = []

    _.each(pages, function(pageObj){
        if(pageObj.page){
            _pages.push(pageObj.page)
            _map.push(pageObj)
        }
    })

    this.setPages(_pages)
    this.map(_map)
}

Template.prototype.setPages = function(pages){
    return this.pages = pages
}

Template.prototype.getPages = function(){
    return this.pages
}

Template.prototype.map = function(map){

    var _map = {}

    _.each(map,function(mapObj){

        _map[mapObj.page] = {

            params: mapObj.params, 
            func: mapObj.func, 
            path: mapObj.path,
            template_div : 'template-content'
        }
    })

    this.map = _map
    return;
}

Template.prototype.params = function(_self,res){
    var params = {};
    _.each(_self.map, function(obj, page){
        if(page === _self.page){
            params = obj.params;
        }
    })
    return params
}

Template.prototype.func = function(_self){
    var func;
    _.each(_self.map, function(obj, page){
        if(page === _self.page){
            func = obj.func;
        }
    })
    return func
}

Template.prototype.template = function(params, _cb){
    if(!_cb) _cb = function(){}

    function loadTemp(params, url, div) {
        
        var initializeEJS = function(cb){
            if(self.ejs) return cb()

            self.ejs = new EJS({cache : false})

            var _params = {}
            _params.onComplete = cb
            _params.url = url

            EJS.ajax_request(_params)
        }

        initializeEJS(function(res){

            if(res){

                var template = new EJS.Compiler(res.responseText)
                template.compile(params, url)
                self.ejs.template = template
            }
           
            $('#'+div).html(self.ejs.render(params))
            return _cb()
        })
    }

    var templateToLoad = this.map[this.page].path;
    var paramsToLoad = params
    var self = this

    loadTemp(paramsToLoad, templateToLoad, this.map[this.page].template_div)
}

Template.prototype.update_template = function(params){
    
    function updateTemp(params, url, div) {
        
        var params = params;
        EJS.config({cache: false});

        //url = url+'?n=1.3'
        new EJS({url: url, cache: false}).update(div, params)
                   
    }

    var templateToLoad = this.map[this.page].path;
    var paramsToLoad = params
    updateTemp(paramsToLoad, templateToLoad, this.map[this.page].template_div)
}

Template.prototype.setPage = function(page){
    this.page = page;
    return
}

Template.prototype.next = function(){
    var index = this.getPages().indexOf(this.page)
    if(index === -1) return
    if(index !== this.getPages.length - 1) index ++;
    this.page = this.getPages()[index]
    return
}

Template.prototype.prev = function(){
    var index = this.getPages().indexOf(this.page)
    if(index === -1) return
    if(index !== 0) index --;
    this.page = this.getPages()[index]
    return
}

Template.prototype.setParams = function(_self, page, params, only_params, cb){
    if(!_self) return;
   
    if(!cb) cb = function(){}
    var updateParams = function(params,oldParams){
        _.each(params, function(val,key){
            oldParams[key] = val;
        })
    }
    var index = _self.getPages().indexOf(page)
    if(index === -1) return;

    var loop = function(_page, _cb){
        var obj = _self.map[_page]
        if(page !== _page) _cb()
        else {
            updateParams(params,_self.map[_page].params)
            if(only_params) _cb()
            else {
                
                _self.template(_self.map[_page].params, function(){
                    _cb()
                })
            }
        }
    }, done = function(err){
        if(err) return cb(err)
        return cb()
    }
    
    async.eachSeries(Object.keys(_self.map), loop, done)
    // _.each(_self.map, function(obj,_page){
    //     if(_page === page){
    //         updateParams(params,_self.map[_page].params)
    //         if(!only_params) _self.template(_self.map[_page].params)
    //         //_self.template(_self.map[_page].params)
    //     }
    // })

    
    return
}

/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/

var LoadTemplate = function(page, options){
    if(!options || (options && options.length === 0)) return console.log('options is empty');
    this.options = _.clone(options)
    this.page = page || '';
    this.init(this.options)
}

LoadTemplate.prototype.init = function(options){
    function jsonConcat(o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
        return o1;
    }

    var createTemplates = function(parent, page,parentObj, childObj, subPages){
        if(!parentObj[parent]) parentObj[parent] = {};

        _.each(subPages, function (subPage) {
            if (subPage.subPages && subPage.subPages.length !== 0){

                childObj[subPage.page] = {}
                createTemplates(parent,subPage.subPages[0].page,parentObj,  childObj[subPage.page], subPage.subPages)
            
            }else{
                
                childObj[subPage.page] = new Template(page,subPages)
            }
        })

        parentObj[parent] = childObj;
        return parentObj
    }

    var _pages = []
    var map = {}
    _.each(options,function(option){
        if(option.page) _pages.push(option.page);

        if(option.subPages && option.subPages.length !== 0) map = jsonConcat(map, createTemplates(option.page,option.subPages[0].page,{},{},option.subPages));
        else map[option.page] = new Template(option.page,[option])
    });

    this.setPages(_pages)
    this.map = map;
    console.log(map)
}

LoadTemplate.prototype.getPage = function(page, $template, cb){
    if(page) this.page = page
    if(!cb) cb = function(){}
    if($template && $template.selector) this.map[this.page].map[this.page].template_div = $template.selector.replace('.', '').replace('#', '')

    var findChildPage = function(page,obj){
        var childTemp = null;
        _.each(obj, function(val){
            if(!(val instanceof Template)) findChildPage(page,val);
            else{
                val.setPage(page || val.page)
                childTemp = val;
            }
        })
        if(childTemp){
            childTemp.template(childTemp.params(childTemp,null))
            return;
        }
    }

    if(this.map && this.map[this.page] && this.map[this.page] instanceof Template){
        this.map[this.page].template(this.map[this.page].params(this.map[this.page],null), cb)
        return this.map[this.page]
    }
    if(this.map && this.map[this.page] && !(this.map[this.page] instanceof Template)){
        findChildPage(page,this.map[this.page]);
        return
    }
}

LoadTemplate.prototype.setParent = function(page){
    if(this.getPages().indexOf(page) !== -1) this.page = page
}


LoadTemplate.prototype.setPages = function(pages){
    return this.pages = pages
}

LoadTemplate.prototype.getPages = function(){
    return this.pages
}

LoadTemplate.prototype.getSubPages = function(parent){
    if(!parent) return
    var result = {}
    result[parent] = []
    var findPages = function(page,obj,result){
        var pages = []
        if(!result[page]) result[page] = []
        _.each(obj, function(val, subPage){
            if(!(val instanceof Template)) findPages(page,val,result);
            else{
                var active = false;
                val.page === subPage ? active = true : active = active;
                result[page].push({page:subPage, active:active})
            }
        })
        
        return result
    }
    return findPages(parent,this.map[parent],result);
}

LoadTemplate.prototype.next = function(){
    var findChildPage = function(page,obj){
        _.each(obj, function(val){
            if(!(val instanceof Template)) findChildPage(null,val);
            else{
                val.next()
                return val
            }
        })
    }
    var index = this.getPages().indexOf(this.page)
    if(index === -1) return
    if(index !== this.getPages().length - 1) index++;
    if(this.map[this.page] instanceof Template){
        this.page = this.getPages()[index]
        return
    }
    findChildPage(null,this.map[this.page])
}

LoadTemplate.prototype.prev = function(){
    var findChildPage = function(page,obj){
        _.each(obj, function(val){
            if(!(val instanceof Template)) findChildPage(null,val);
            else{
                val.prev()
                return val
            }
        })
    }
    var index = this.getPages().indexOf(this.page)
    if(index === -1) return
    if(index !== 0) index--;
    if(this.map[this.page] instanceof Template){
        this.page = this.getPages()[index]
        return
    }
    findChildPage(null,this.map[this.page])
}

LoadTemplate.prototype.setParams = function(params, only_params, cb){
    if(!cb) cb = function(){}

    var updateChildParams = function(page, params, obj){
        _.each(obj, function(val){
            if(!(val instanceof Template)) updateChildParams(page,params,val);
            else{
                val.setParams(val,page,params)
                return val
            }
        })
    }

    if(!params) return;
    if(this.map[this.page] instanceof Template) return this.map[this.page].setParams(this.map[this.page], this.page, params, only_params, cb);
    
    //return updateChildParams(subPage, params, this.map[this.page])
}

LoadTemplate.prototype.getFunc = function(){
    var findChildFunc = function(obj){
        var func;
        _.each(obj, function(val){
            if(!(val instanceof Template)) findChildFunc(val);
            else{
                func = val.func(val)
            }
        })
        return func
    }
    if(this.map[this.page] instanceof Template) return this.map[this.page].func(this.map[this.page])
    return findChildFunc(this.map[this.page]);
}

define(['../EJS/ejs_production2.js'], function(EJS, ejs){
    console.log(EJS)
    return LoadTemplate
})
