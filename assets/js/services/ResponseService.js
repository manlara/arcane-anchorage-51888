
define(
    
    [
        './responses/errors/Error.js', 
        './responses/success/Success.js',
        './responses/warning/warning.js'
    ],

    function(Error, Success, Warning){
        return {
            Error : Error,
            Success : Success,
            Warning : Warning,
        }
    }

)