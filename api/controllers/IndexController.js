var http = require('http');
module.exports = {

	__views : {

		'index' : {
			
			index : function(req, res){

				var description = 'Connect to InspireHEP and make make class to their REST API'
				var title =  'Author Name Disambiguation'
				var keywords = 'inpire, machine learning'
				var canonical = '/'

				if(req.metatag){

					if(!req.metatag.title) req.metatag.title = title
					if(!req.metatag.description) req.metatag.description = description
					if(!req.metatag.keywords) req.metatag.keywords = keywords
					if(!req.metatag.canonical) req.metatag.canonical = canonical

				}else {

					req.metatag = {
						title : title,
						description : description,
						keywords : keywords,
						canonical : canonical
					}
				}
				return res.view('index')
			}
		},
	},

	/* Inspire API query format

	p = pattern (query)

		This is the query in the Inspire search syntax. All search features and operators familiar from the Inspire web interface and documented in the online help are supported and complex queries are possible.

	of = output format

		The format of the response sent back to the client. There are two choices, of=xm for (MARC-) XML or of=recjson for JSON. The XML response format is MARCXML or fragments thereof when individual fields are selected via the ot parameter

	ot = output tags

		Select (filter) specific tags from the MARCXML response. This option takes a comma separated list of MARC tags. Valid MARC tags for Inspire records can be found here.

		Select specific named fields for the JSON response. This is similar to selecting MARC tags, however by name instead of numerical value. In addition the JSON response can contain derived or dynamically calculated values which are not available in MARC. See below for more information on JSON field names.

	rg = records in groups of (25)

		This parameter specifies the number of records per chunk for long responses. Note that the default setting is 25 records per chunk. The maximum number is 250.

	jrec = jump to record (123)

		Long responses are split into several chunks. To access subsequent chunks specify the record offset with this parameter.
	*/
	inspire: function(req, res){
		
		if (!req.query || !req.query.text) return res.status(404).end('No query given')

		// Makes a call to the Inspire HEP API
		var call_inspire = function(options, cb){

			var api = http.get(options, function(response){
				var bodyChunks = [];
				response.on('data', function(chunk) {
					bodyChunks.push(chunk);
				}).on('end', function() {
					var body = Buffer.concat(bodyChunks);
					return cb(null, JSON.parse(body))
				})
			})
			api.on('error', function(e){
				return cb(e.message)
			})
		}

		var options = {
				host: 'inspirehep.net',
				output: "recid,number_of_authors,publication_info,corporate_name[0]", //"recid,title,authors",	
				limit : 250,
				query: req.query.text,
				counter: -1,
				output_format: 'recjson',
				sort_by: 'earliestdate',
				jump: function(){
					if (this.counter==-1 || this.counter==0) return 0
					return this.limit*this.counter+1
				},
				path: function(){
					return '/search?p='+this.query+'&of='+this.output_format+'&ot='+this.output+'&rg='+String(this.limit)+'&jrec='+String(this.jump())+'&sf='+this.sort_by
				}
			},
			all_responses = false,
			records = []
		
		var	loop = function(cb){
			options.counter++

			// The host and path are required to make a request to any server (local or not)
			call_inspire({host: options.host, path: options.path()}, function(err, response){
				if(err) return cb(err)

				if (response.length==0) all_responses = true
				records.push.apply(records,response) // merge response into records
				io.sockets.emit('progress', records.length);
				//console.log("N: ", records.length)
				return cb()
			})
		}, done = function(err){
			if (err) return res.status(500).send(err)

			//console.log(records[0])
			//console.log("Total: ", records.length)
			io.sockets.emit('completed', records.length);
			return res.status(200).json(records)
		}

		// Get all records for the given search query
		async.until(
			function(){return all_responses || options.counter>40}, 
			loop, done
		)
		
	}
}