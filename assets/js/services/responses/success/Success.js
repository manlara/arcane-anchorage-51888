define(function(){

    var Success = function(msg){
       if (this instanceof Success === false) {
            return new Success(msg);
        }

        this.msg = msg;
    }

    Success.prototype.show = function($successDiv, $optional){

    	if(!$successDiv) $successDiv = $('.success-section')
    	if($optional){

            $optional.parent().addClass('has-success')
            $optional.keyup({self : this},function(e){

                e.data.self.clear($(this))
                $(this).unbind('keyup');

            })

        }

        var html = '<div class="alert alert-success" role="alert">'+this.msg+'</div>'
        $successDiv.html(html)
        
        console.log(this.msg)
        return this.msg
    }

    return Success
})