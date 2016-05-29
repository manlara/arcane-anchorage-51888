require(
	[
		'template setup', 
		'request service', 
		'response service',
		'socket'
	],

	function(TemplateSetup, request, response, io){
		var Error = response.Error
		var Success = response.Success
		

		$(function(){

			var socket = io('http://localhost:1338');
			socket.on('disconnect', function(){});

			var datasets = [{corporate_name: [{collaboration: "ALICE"}], number_of_authors: 100, publication_info: {pagination: "064905", title: "Phys.Rev.", volume: "C91", year: "2015"}, recid: 1335350},
							{corporate_name: [{collaboration: "BESIII"}], number_of_authors: 100, publication_info: {pagination: "064905", title: "Phys.Rev.B", volume: "C91", year: "2016"}, recid: 1335310}]
			
			// convert inspire response to array of arrays
			// Each array is a unique collaboration
			// For each collaboration we summarize the number publications per year
			// The subarray:
			// 		0: year
			// 		1: number of publications for a given collaboration
			// 		2: name of collaboration
			var formatRecords = function(data) {
				
				var results = []
				
				// Summarize the papers published by every collaborator
				var summarizeCollaborationPapers = function(data){
				
					var obj = {}
					data.forEach(function(d){
				
						if (d.corporate_name[0] && d.corporate_name[0].collaboration && d.publication_info && d.publication_info.year){
							var collaboration = d.corporate_name[0].collaboration
							var year = d.publication_info.year
							//console.log('d.publication_info: ', d.publication_info, 'year = ', year, 'collab: ', collaboration)
							if (!obj[collaboration]) {
								obj[collaboration] = {}; 
							}
							if (!obj[collaboration][year]) {
								obj[collaboration][year] = 0
							}
							obj[collaboration][year]++
							//console.log('obj[collaboration][year]: ', obj[collaboration][year])
						}
					})
					return obj
				}
				
				var collaboration_obj = summarizeCollaborationPapers(data)

				var results = []
				for(var collaboration in collaboration_obj){
					var collaboration_list = []
					for (var year in collaboration_obj[collaboration]){
						collaboration_list.push([ parseInt(year), collaboration_obj[collaboration][year], collaboration ])
					}
					results.push(collaboration_list)
				}
				return results
			}

			/* 
			** D3 Visualization
			*/

			// Make a table of collaborators for a given search query showing a summary of ther publications per year
			var collaborationPublicationsPerYear = function(records){
				var margin = {top: 20, right: 200, bottom: 0, left: 20},
					width = 600,
					height = 650;

				var start_year = 2004,
					end_year = 2016;

				var c = d3.scale.category20();

				var x = d3.scale.linear()
				.range([0, width]);

				var formatYears = d3.format("0000");
				var xAxis = d3.svg.axis()
					.scale(x)
					.orient("top")
					.tickFormat(formatYears);

				x.domain([start_year, end_year]);
				var xScale = d3.scale.linear()
					.domain([start_year, end_year])
					.range([0, width]);

				var svg = d3.select("body").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.style("margin-left", margin.left + "px")
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + 0 + ")")
					.call(xAxis);
				
				var j=-1
				records.forEach(function(record){
					j++

					var g = svg.append("g").attr("class","journal").data(record);
					
					var circles = g.selectAll("circle")
						.data(record)
						.enter()
						.append("circle");

					
					var text = g.selectAll("text")
						.data(record)
						.enter()
						.append("text");
					
					
					var rScale = d3.scale.linear()
						.domain([0, d3.max(record, function(d) { return d[1]; })])
						.range([2, 9]);
					
					
					circles
						.attr("cx", function(d, i) { return xScale(d[0]); })
						.attr("cy", j*20+20)
						.attr("r", function(d) { return rScale(d[1]); })
						.style("fill", function(d) { return c(j); });

					
					
					text
						.attr("y", j*20+25)
						.attr("x",function(d, i) { return xScale(d[0])-5; })
						.attr("class","value")
						.text(function(d){ return d[1]; })
						.style("fill", function(d) { return c(j); })
						.style("display","none");
					
					
					g.append("text")
						.attr("y", j*20+25)
						.attr("x",width+20)
						.attr("class","label")
						//.text(truncate(data[j]['name'],30,"..."))
						.text(function(d){ return d[2]; })
						//.text("yo")
						.style("fill", function(d) { return c(j); })
						.on("mouseover", mouseover)
						.on("mouseout", mouseout);				
					
				})

				function mouseover(p) {
					var g = d3.select(this).node().parentNode;
					d3.select(g).selectAll("circle").style("display","none");
					d3.select(g).selectAll("text.value").style("display","block");
				}

				function mouseout(p) {
					var g = d3.select(this).node().parentNode;
					d3.select(g).selectAll("circle").style("display","block");
					d3.select(g).selectAll("text.value").style("display","none");
				}
			}

			$(document)._on('keyup', '#search', function(event){
				if(event.keyCode == 13){
					
					$('.error-section').hide()
					$('#progress').removeClass("hide")
					$('#progress i').addClass('fa-spin').show()
					$("#progress span").text('Getting records...0 so far')

					// Get messages from the server about the progress of the api request
					socket.on('progress', function(data){
						$("#progress span").text('Getting records...'+data+' so far')
						console.log('socket: ', data)
					});
					socket.on('completed', function(data){
						$("#progress span").text("Done! "+data+" records retrieved")
						$('#progress i').removeClass('fa-spin').hide()
					});
					
					var query = { 
						text: $(this).val().trim().replace(/\s\s+/g, ' ').replace(/ /g, "+"),
						search_by: "name"
					}
					
					request('GET', '/inspire', query, function(err, res){
						if(err) return Error(err.responseText).show()
						
						// Remove the html elements associated to D3 if they exist
						$('svg').remove()
						// Draw the D3 table
						collaborationPublicationsPerYear(formatRecords(res))
					})
					
				}
			})

			var truncate = function(str, maxLength, suffix) {
				if(str.length > maxLength) {
					str = str.substring(0, maxLength + 1); 
					str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
					str = str + suffix;
				}
				return str;
			}
			// D3 Code
			
			//var records = [[ [2004, 1], [2005, 1], [2006, 3], [2007, 3], [2009, 3], [2013, 3]], [ [2004, 5], [2005, 1], [2006, 2], [2010, 20], [2011, 3] ] ,[ [2004, 5], [2005, 15], [2006, 2], [2010, 20], [2012, 25] ]];
			//console.log('records: ', records)

			

			
			
		})
	}
)