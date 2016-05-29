define(function(){

    var Error = function(msg){ 

        if (this instanceof Error === false) {
            return new Error(msg);
        }

        this.msg = msg;

    }

    Error.prototype.show = function($errDiv, $optional){

    	if(!$errDiv) $errDiv = $('.error-section')
    	if($optional){

            $optional.parent().addClass('has-error')
            $optional.keyup({self : this},function(e){

                e.data.self.clear($(this))
                $(this).unbind('keyup');

            })

        }

        var html = '<div class="alert alert-danger" role="alert">'+this.msg+'</div>'
        $errDiv.html(html)

        console.log(this.msg)
        return this.msg
    }

    Error.prototype.destroy = function($errDiv){
        if($errDiv){
            return $errDiv.html('')
        }

        return $('.error-section').html('')
    }

    return Error
})