define(function(){

    var Warning = function(msg){
        if (this instanceof Warning === false) {
            return new Warning(msg);
        }

        this.msg = msg;
    }

    Warning.prototype.show = function($warningDiv, $optional){

    	if(!$warningDiv) $warningDiv = $('.warning-section')
    	if($optional){

            $optional.parent().addClass('has-warning')
            $optional.keyup({self : this},function(e){

                e.data.self.clear($(this))
                $(this).unbind('keyup');

            })

        }

        var html = '<div class="alert alert-warning" role="alert">'+this.msg+'</div>'
        $warningDiv.html(html)
        
        console.log(this.msg)
        return this.msg
    }

    return Warning
})