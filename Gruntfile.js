'use strict'

var _ = require('lodash')

var findFileFromDirectory = function(path, name, extension, recursive){
    if(~__dirname.indexOf('\\')) path = path.replace(/\//g, '\\')

    let items = require('fs').readdirSync(path)
    let files = []
    
    items.forEach(function(item){
        if((!~item.indexOf(extension) || !extension) && !~item.indexOf('.') && recursive) {

            let _path = path + '/' + item
            if(~__dirname.indexOf('\\')) _path = path + '\\' + item

            files = files.concat(findFileFromDirectory(_path, name, extension, recursive))

        }else if(~item.indexOf(name) || !name) {
            if(!require('fs').lstatSync(path + '/' + item).isDirectory()) files.push({ path : path, name : item })
        }
    })

    return files
}

var baseUrl = __dirname + '/assets'
if(~__dirname.indexOf('\\')) baseUrl = baseUrl.replace(/\//g, '\\')

var webpack = require("webpack");

var webpack_config_js = function(production){
    var response = {}

    var app_paths = [
        //baseUrl + '/js/accounts',
        //baseUrl + '/js/accounts/admin',
        //baseUrl + '/js/index',
    ]

    var other_paths = [
        baseUrl + '/js',
        //baseUrl + '/js/pages',
        //baseUrl + '/js/accounts',
        //baseUrl + '/js/accounts/pro',
        //baseUrl + '/js/accounts/client',
        //baseUrl + '/js/accounts/admin',
    ]

    var files = []
    app_paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, 'app.js', '.js', true))
    })

    other_paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, '.js', '.js', false))
    })
    
    files.forEach(function(file, key){

        let path_url = file.path.split(baseUrl + '/')
        if(~__dirname.indexOf('\\'))  path_url = file.path.split(baseUrl + '\\')

        path_url = path_url.pop()

        let entry = {}
        entry[file.name.split('.js').shift()] = [baseUrl + '/js/app.js', baseUrl + '/js/protos.js', file.path + '/' + file.name]
        if(~__dirname.indexOf('\\')) entry[file.name.split('.js').shift()] = [baseUrl + '\\js\\app.js', baseUrl + '\\js\\protos.js', file.path + '\\' + file.name]

        let Index = path_url + '/' + file.name
        if(~__dirname.indexOf('\\')) Index =  path_url + '\\' + file.name

        let output = {
            path: ".tmp/" + path_url,
            publicPath : '/' + path_url + '/',
            chunkFilename : "[name]_[hash].js",
            filename: "[name].js",
        }

        if(~__dirname.indexOf('\\')) output = {
            path: ".tmp\\" + path_url,
            publicPath : '/' + path_url.replace(/\\/g, '/') + '/',
            chunkFilename : "[name]_[hash].js",
            filename: "[name].js",
        }

        let alias = {
            'google maps' : baseUrl + '/js/libs/GoogleMaps/google_maps.js',
            'geocoder' : baseUrl + '/js/services/GeoService.js',
            'socket' : baseUrl + '/js/libs/Socketio/socket.io-1.3.7.js',
            'request service' :  baseUrl + '/js/services/RequestService.js',
            'response service' :  baseUrl + '/js/services/ResponseService.js',
            'template setup' : baseUrl + '/js/libs/TemplateEngine/setup.js',
        }

        if(~__dirname.indexOf('\\')) alias = {
            'google maps' : baseUrl + '\\js\\libs\\GoogleMaps\\google_maps.js',
            'geocoder' : baseUrl + '\\js\\services\\GeoService.js',
            'socket' : baseUrl + '\\js\\libs\\Socketio\\socket.io-1.3.7.js',
            'request service' :  baseUrl + '\\js\\services\\RequestService.js',
            'response service' :  baseUrl + '\\js\\services\\ResponseService.js',
            'template setup' : baseUrl + '\\js\\libs\\TemplateEngine\\setup.js',
        }

        var plugins = []
        var loaders = []

        if(production) plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                drop_console: true
            }
        }))

        //if(production) loaders.push({ test: /\.js$/, loader: "strip-loader?strip[]=debug,strip[]=console.log" })
        
        response[Index] = {
            entry : entry,

            output: output,

            resolve: {
                alias: alias
            },
            watch: production ? false : true,
            plugins : plugins,
            module: {
                loaders: loaders
            }
        }
    }) 

    return response
}

var css_to_load = function(){
    var response = {}

    var paths = [
        baseUrl + '/styles'
    ]

    var files = []
    paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, '.css', '.css', true))
    })

    files.forEach(function(file){

        let path_url = file.path.split(baseUrl + '/')
        if(~__dirname.indexOf('\\')) path_url = file.path.split(baseUrl + '\\')

        path_url = path_url.pop()
        
        if(~__dirname.indexOf('\\')) {

            response[path_url + '\\' + file.name] = {
            
              src: baseUrl + '\\' + 'styles' + '\\' + file.name,
              dest: '.tmp'+ '/' +'styles' + '/' + file.name,
            }

        }else { 

            response[path_url + '/' + file.name] = {
            
              src: baseUrl + '/styles/' + file.name,
              dest: '.tmp/styles/' + file.name,
            }
        }
        
    })

    return response
}

var fonts_to_load = function(){
    var response = {}

    var paths = [
        baseUrl + '/fonts'
    ]

    var files = []
    paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, null, null, true))
    })

    files.forEach(function(file){

        let path_url = file.path.split(baseUrl + '/')
        if(~__dirname.indexOf('\\')) path_url = file.path.split(baseUrl + '\\')

        path_url = path_url.pop()
        
        if(~__dirname.indexOf('\\')) {

            response[path_url + '\\' + file.name] = {
                
              src: file.path + '\\' + file.name,
              dest: '.tmp/' + path_url.replace(/\\/g, '/') + '/' + file.name,
            }

        }else {

            response[path_url + '/' + file.name] = {
                
              src: file.path + '/' + file.name,
              dest: '.tmp/' + path_url + '/' + file.name,
            }
        }
    })

    return response
}

var images_to_load = function(){
    var response = {}
    var mozjpeg = require('imagemin-mozjpeg');

    var paths = [
        baseUrl + '/images'
    ]

    var files = []
    paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, null, null, true))
    })
    
    files.forEach(function(file){

        let path_url = file.path.split(baseUrl + '/')
        if(~__dirname.indexOf('\\')) path_url = file.path.split(baseUrl + '\\')

        path_url = path_url.pop()
        
        var files = {}
        if(~__dirname.indexOf('\\')) files['.tmp/' + path_url.replace(/\\/g, '/') + '/' + file.name] = file.path + '\\' + file.name
        else files['.tmp/' + path_url + '/' + file.name] = file.path + '/' + file.name


        if(~__dirname.indexOf('\\')) {

            response[path_url + '\\' + file.name] = {
                
                options: {                       
                    optimizationLevel: 3,
                    svgoPlugins: [{ removeViewBox: false }],
                    use: [mozjpeg()]
                },

                files : files
            }
        }else { 
            response[path_url + '/' + file.name] = {
                
                options: {                       
                    optimizationLevel: 3,
                    svgoPlugins: [{ removeViewBox: false }],
                    use: [mozjpeg()]
                },

                files : files
            }
        }
        
    })

    return response
}

var templates_to_load = function(){
    var response = {}
    var base = __dirname + '/api/views'

    if(~__dirname.indexOf('\\')) base = base.replace(/\//g, '\\')

    function generatePaths(path, name){
        if(~__dirname.indexOf('\\')) path = path.replace(/\//g, '\\')

        let items = require('fs').readdirSync(path)
        let paths = []
        
        items.forEach(function(item){
            
            if(!~item.indexOf('.') && !~item.indexOf(name)) {

                let _path = path + '/' + item
                if(~__dirname.indexOf('\\')) _path = path + '\\' + item

                paths = paths.concat(generatePaths(_path, name))

            }else if(~item.indexOf(name)) {

                paths.push(path + '/' + name)
            }
        })

        return paths
    }

    var paths = generatePaths(base, 'templates')
    
    var files = []
    paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, '.ejs', '.ejs', true))
    })
    
    files.forEach(function(file){

        let path_url = file.path.split(base + '/')
        path_url = 'templates/' + path_url.pop()

        if(path_url.split('/').pop() === 'templates') {
            path_url = path_url.split('/')
            path_url.pop()
            path_url = path_url.join('/')
        }

        if(~__dirname.indexOf('\\')){ 

            path_url = file.path.split(base + '\\')
            path_url = 'templates\\' + path_url.pop()

            if(path_url.split('\\').pop() === 'templates') {
                path_url = path_url.split('\\')
                path_url.pop()
                path_url = path_url.join('\\')
            }
        }

        if(~__dirname.indexOf('\\')){

            response[path_url + '\\' + file.name] = {
                
              src: file.path + '\\' + file.name,
              dest: '.tmp/' + path_url.replace(/\\/g, '/') + '/' + file.name,
            }
        }else { 

            response[path_url + '/' + file.name] = {
                
              src: file.path + '/' + file.name,
              dest: '.tmp/' + path_url + '/' + file.name,
            }
        }

    })
    
    return response
}

var root_to_load = function(){
    var response = {}

    var paths = [
        baseUrl + '/'
    ]

    var files = []
    paths.forEach(function(path){
        files = files.concat(findFileFromDirectory(path, null, null, false))
    })

    files.forEach(function(file){

        let path_url = file.path.split(baseUrl + '/')
        if(~__dirname.indexOf('\\')) path_url = file.path.split(baseUrl + '\\')
       
        path_url = path_url.pop()
        
        if(~__dirname.indexOf('\\')) {

            response[path_url + '\\' + file.name] = {
                
              src: file.path + '\\' + file.name,
              dest: '.tmp/' + path_url.replace(/\\/g, '/') + '/' + file.name,
            }

        }else {

            response[path_url + '/' + file.name] = {
                
              src: file.path + '/' + file.name,
              dest: '.tmp/' + path_url + '/' + file.name,
            }
        }
    })

    return response
}

var template_watch = function(){

    var base = __dirname + '/api/views'
    if(~__dirname.indexOf('\\')) base = base.replace(/\//g, '\\')

    function generatePaths(path, name){
        if(~__dirname.indexOf('\\')) path = path.replace(/\//g, '\\')

        let items = require('fs').readdirSync(path)
        let paths = []
        
        items.forEach(function(item){
            
            if(!~item.indexOf('.') && !~item.indexOf(name)) {

                let _path = path + '/' + item
                if(~__dirname.indexOf('\\')) _path = path + '\\' + item

                paths = paths.concat(generatePaths(_path, name))

            }else if(~item.indexOf(name)) {

                paths.push(path + '/' + name)
            }
        })

        return paths
    }

    var paths = generatePaths(base, 'templates')
    var _paths = []
    paths.forEach(function(_path){

        if(~__dirname.indexOf('\\')) _path = _path.split(__dirname + '\\').pop()
        else _path = _path.split(__dirname + '/').pop()

        let path = _path

        if(~__dirname.indexOf('\\')) _path += '\\*'
        else _path += '/*'

        if(~__dirname.indexOf('\\')) _paths.push( path + '\\**\\*' )
        else _paths.push(path + '/**/*')

        _paths.push(_path)
    })
    
    return _paths
}


module.exports = function(grunt) {
    var path = require('path');
    var conf = {
        pkg: grunt.file.readJSON('package.json'),
        watch: {

          styles : {
            files : ['assets/styles/*', 'assets/styles/**/*'],
            options: {
              spawn: false,
            },
          },

          templates : {
            files : template_watch(),
            options: {
              spawn: false,
            }
          }

        },

        clean: {
            js : ['.tmp/js/*', '.tmp/js/**/*'],
            templates : ['.tmp/templates/*', '.tmp/templates/**/*'],
            images : ['.tmp/images/*', '.tmp/images/**/*'],
        },

        cssmin : css_to_load(),
        imagemin : images_to_load(),
        copy : _.extend(fonts_to_load(), templates_to_load(), root_to_load()),
    }

    grunt.initConfig(_.extend({}, conf, { webpack : webpack_config_js(grunt.option('target') === 'prod' ? true : false) }))

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webpack-without-server');
    grunt.loadNpmTasks('grunt-newer');

    grunt.event.on('watch', function(action, filepath, target) {
        switch(target){
            case 'templates' : 
                
                var path = ''
                var file = ''

                if(~__dirname.indexOf('\\')) path = filepath.split('api\\views\\').pop()
                else path = filepath.split('api/views/').pop()

                 if(~__dirname.indexOf('\\')) file = filepath.split('\\').pop()
                else file = filepath.split('/').pop()

                if(~__dirname.indexOf('\\')) path = 'templates\\' + path
                else path = 'templates/' + path

                if(~__dirname.indexOf('\\') && !path.split('templates\\' + file).pop()) {

                    path = path.split('templates\\' + file)
                    path.pop()
                    path = path.join('\\') + file

                }else if(!path.split('templates/' + file).pop()){

                    path = path.split('templates/' + file)
                    path.pop()
                    path = path.join('/') + file

                }
                
                grunt.task.run('copy:' + path)

            break;

            case 'styles' : 

                var name = filepath.split("assets").pop()
                name = name.substring(1, name.length)

                grunt.task.run('cssmin:' + name)
                
            break;
        }

        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    var dev = ['clean:templates', 'clean:js', 'webpack', 'newer:cssmin', 'newer:copy', 'newer:imagemin', 'watch']
    var prod = ['clean:templates', 'clean:js', 'webpack', 'newer:cssmin', 'newer:copy']
    var staging = ['clean', 'webpack', 'newer:cssmin', 'newer:copy', 'newer:imagemin']

    if(grunt.option('target') === 'prod') grunt.registerTask('default', prod);
    else if(grunt.option('target') === 'staging') grunt.registerTask('default', staging);
    else grunt.registerTask('default', dev);

};