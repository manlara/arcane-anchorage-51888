'use strict'

require('./config/protos')
global.ROOT = __dirname

var express = require('express')
var app = express();
var path = require('path')

var _$ = { app : app, express : express }
global._$ = _$

global._ = require('lodash')
global.async = require('async')
global.log = require('./lib/logger.js').init()

_$.environment = require('./config/environment')

var shell = require('shelljs');
shell.exec(_$.environment.development ? ' echo In Development ' : 'grunt --target=prod', function(code, stdout, stderr){
    if(code) return console.log(code)

    /**
    * Sync 
    */

    global.Sync = function(callback){

        if(this instanceof Sync === false) return new Sync(callback)
        var self = this

        function *init(){

            var temp = function(){
                this.next = function(params){ i.next(params) }
                this.throw = function(err){ i.throw(err) }
            }

            yield* callback.call(new temp())
        }

        var i = init()
        i.next()
    }

    /**
    * ObjectHandler setup
    */

    global.ObjectHandler = require('./lib/ObjectHandler.js')

    /**
    * Converter setup
    */

    global.Converter = require('./lib/Converter.js')

    /**
    * Constants Setup
    */

    var consts = require('./config/constants.js')
    Object.keys(consts).forEach(function(key){
      global[key] = consts[key]
    })

    /**
    * Services Setup
    */

    var services = require('./lib/services.js')
    Object.keys(services).forEach(function(index){
      global[index] = services[index]
    })  



    if(!require('fs').existsSync(ROOT + '/.tmp')) require('fs').mkdirSync(ROOT + '/.tmp')

    /**
    * Memory watch
    */

    var memwatch = require('memwatch-next')
    memwatch.on('leak', function(info) { log.error(info) })


    var viewPath = path.join(__dirname, 'api/views')
    var partialsPath = viewPath
    var handlebars  = require('express-handlebars');
    var settings = require('./config/settings.js')


    _$.app.set('views', viewPath);
    _$.app.set('view engine', 'ejs');
    _$.app.set('view options', { layout:'layout.ejs' });

    /**
    * Middleware setup
    */

    require('./lib/middleware.js')(_$)

    _$.app.use(express.static(path.join(__dirname, '.tmp')));

    var _ddos = require('ddos')
    var ddos = new _ddos({
        maxcount : 300,
        burst : 100
    })

    app.use(ddos.express)


    /**
    * Helpers setup
    */

    _$.helpers = require('./lib/helpers.js')

    /**
    * Policies Setup
    */

    var policies = require('./lib/policies.js')

    
    /**
    * DB Setup
    */

    require(ROOT + '/lib/_db.js')(function(mongoose){

        
        _$.mongoose = mongoose

        let file = './lib/models.js'
        let src = require('fs').readFileSync(file);
        let err = require('syntax-error')(src, file);
        if (err) return log.error(err)

        global.models = require('./lib/models.js')(_$.mongoose)
        
        /**
        * Repository Setup
        */

        global.$ = require('./lib/repositories/RepositoryCollection.js').init()

       

        require('./config/bootstrap.js').bootstrap(function(){
             /**
            * Routes Setup
            */
            require('./lib/routes.js')(_$, policies) 
            /**
            * Cron Setup
            */
            //require(ROOT + '/lib/crons.js')

            /**
            * Grunt Setup
            */
            if(_$.environment.development) require(require.resolve("grunt")).cli();
           
            var server =  _$.app.listen(process.env.PORT || 1338, function(){
              
                //server.setMaxListeners(0);
                _$.server = server
                var host = 'localhost'
                var port = global._$.server.address().port
                    
                console.log('listening at http://%s:%s', host, port)

                global.io = require('socket.io')(_$.server)
            })
        })  
    })
})
