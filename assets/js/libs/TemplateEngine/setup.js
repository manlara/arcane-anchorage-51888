
define(['./templateEngine.js'], function(LoadTemplate){
    var isFunction = function(obj){ return Object.prototype.toString.call(obj) !== '[object Function]'  ? false : true; }

    var TemplateSetup = function(map, page, $template){ 
        this.page = page, 
        this.map = map, 
        this.$template = $template; 
    }

    TemplateSetup.prototype.init = function(pages, controls, cb){
        var options = [], _self = this;

        _.each(pages, function(page){
            options.push(_.extend(_self.map[page], {page:page, subPages:null}))
        })

        if(!controls) controls = {}
        this.nextButton = controls.next; this.prevButton = controls.prev;

        this.loadTemp = new LoadTemplate(this.page, options)
        this.loadTemp.getPage(this.page, this.$template, cb)

        this.prevFunc = function(e){
            return e.data._setup.prev()
        }

        if(this.loadTemp.getFunc()){

            $(document).off( "click", this.nextButton, this.loadTemp.getFunc())
            $(document).off( "click", this.prevButton, this.prevFunc)

            $(document).on('click',this.nextButton,{_setup:this},this.loadTemp.getFunc())
            $(document).on('click',this.prevButton,{_setup:this},this.prevFunc)
        }
    }

    TemplateSetup.prototype.changePage = function(page){

        if(this.loadTemp.getFunc()){
            $(document).off( "click", this.nextButton, this.loadTemp.getFunc())
            $(document).off( "click", this.prevButton, this.prevFunc)
        }

        this.loadTemp.page = page
        if(this.loadTemp.getFunc()){
            $(document).on('click',this.nextButton,{_setup:this},this.loadTemp.getFunc())
            $(document).on('click',this.prevButton,{_setup:this},this.prevFunc)
        }
    }

    TemplateSetup.prototype.template = function(page){
        var $template = null
        var params = null
        var cb = null

        for(var i = 1; i <= 3; i++){
            if(arguments[i.toString()]){
                if(arguments[i.toString()] instanceof $ === true) $template = arguments[i.toString()]
                else if(isFunction(arguments[i.toString()])) cb = arguments[i.toString()]
                else params = arguments[i.toString()]
            }
        }

        if(this.loadTemp.getFunc()){
            $(document).off( "click", this.nextButton, this.loadTemp.getFunc())
            $(document).off( "click", this.prevButton, this.prevFunc)
        }

        this.loadTemp.setParams(params, true)
        this.loadTemp.getPage(page, $template, cb) 
        this.loadTemp.setParams(params, true)
        
        if(this.loadTemp.getFunc()){
            $(document).on('click',this.nextButton,{_setup:this},this.loadTemp.getFunc())
            $(document).on('click',this.prevButton,{_setup:this},this.prevFunc)
        }
    }

    TemplateSetup.prototype.prev = function(res){
        $(document).off( "click", this.nextButton, this.loadTemp.getFunc())
        $(document).off( "click", this.prevButton, this.prevFunc)

        this.loadTemp.prev()
        this.loadTemp.getPage();

        $(document).on('click',this.nextButton,{_setup:self},this.loadTemp.getFunc())
        $(document).on('click',this.prevButton,{_setup:self},this.prevFunc)    
    }

    TemplateSetup.prototype.next = function(res, $template){
        $(document).off( "click", this.nextButton, this.loadTemp.getFunc())
        $(document).off( "click", this.prevButton, this.prevFunc)

        this.loadTemp.setParams(res, true)
        this.loadTemp.next()
        this.loadTemp.setParams(res, true)
        this.loadTemp.getPage(null, $template);

        $(this.nextButton).unbind('click')
        $(document).on('click',this.nextButton,{_setup:this},this.loadTemp.getFunc())
        $(document).on('click',this.prevButton,{_setup:this},this.prevFunc)
    }

    return TemplateSetup
})