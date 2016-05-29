/*
			var data=[{"crimeType":"mip","totalCrimes":24},{"crimeType":"theft","totalCrimes":558},{"crimeType":"drugs","totalCrimes":81},{"crimeType":"arson","totalCrimes":3},{"crimeType":"assault","totalCrimes":80},{"crimeType":"burglary","totalCrimes":49},{"crimeType":"disorderlyConduct","totalCrimes":63},{"crimeType":"mischief","totalCrimes":189},{"crimeType":"dui","totalCrimes":107},{"crimeType":"resistingArrest","totalCrimes":11},{"crimeType":"sexCrimes","totalCrimes":24},{"crimeType":"other","totalCrimes":58}];


			var width = 800,
			    height = 250,
			    radius = Math.min(width, height) / 2;

			var color = d3.scale.ordinal()
			    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

			var arc = d3.svg.arc()
			    .outerRadius(radius - 10)
			    .innerRadius(radius - 70);

			var pie = d3.layout.pie()
			    .sort(null)
			    .value(function (d) {
			    return d.totalCrimes;
			});



			var svg = d3.select("body").append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .append("g")
			    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			    var g = svg.selectAll(".arc")
			        .data(pie(data))
			        .enter().append("g")
			        .attr("class", "arc");

			    g.append("path")
			        .attr("d", arc)
			        .style("fill", function (d) {
			        return color(d.data.crimeType);
			    });

			    g.append("text")
			        .attr("transform", function (d) {
			        return "translate(" + arc.centroid(d) + ")";
			    })
			        .attr("dy", ".35em")
			        .style("text-anchor", "middle")
			        .text(function (d) {
			        return d.data.crimeType;
			    });
			*/

			/*
			d3.select("body").selectAll("p")
				.data(dataset)
				.enter()
				.append("p")
				.text(function(d){ return d.corporate_name[0].collaboration});
			*/
/*
			// var dataset = [[ [2002, 8], [2003, 1], [2004, 1], [2005, 1], [2006, 3], [2007, 3], [2009, 3], [2013, 3]], [ [2004, 5], [2005, 1], [2006, 2], [2010, 20], [2011, 3] ] ,[ [2001, 5], [2005, 15], [2006, 2], [2010, 20], [2012, 25] ]];
			// var dataset = [ [2001, 5], [2005, 15], [2006, 2], [2010, 20], [2012, 25] ];

			d3.json("journals_optogenetic.json", function(data) {
				x.domain([start_year, end_year]);
				var xScale = d3.scale.linear()
					.domain([start_year, end_year])
					.range([0, width]);

				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + 0 + ")")
					.call(xAxis);

				for (var j = 0; j < data.length; j++) {
					var g = svg.append("g").attr("class","journal");

					var circles = g.selectAll("circle")
						.data(data[j]['articles'])
						.enter()
						.append("circle");

					var text = g.selectAll("text")
						.data(data[j]['articles'])
						.enter()
						.append("text");

					var rScale = d3.scale.linear()
						.domain([0, d3.max(data[j]['articles'], function(d) { return d[1]; })])
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
						.text(truncate(data[j]['name'],30,"..."))
						.style("fill", function(d) { return c(j); })
						.on("mouseover", mouseover)
						.on("mouseout", mouseout);
				};

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
			});
			*/
			/*
			var diameter = 960;
			var tree = d3.layout.tree()
						.size([360, diameter/2 - 120])
						.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; })
			var diagonal = d3.svg.diagonal.radial()
							.projection(function(d) { return [d.y, d.x/180 * Math.PI]; })

			var svg = d3.select("body").append("svg")
						.attr("width", diameter)
						.attr("height", diameter-150)
					.append("g")
						.attr("transform", "translate(" + diameter/2 + "," + diameter/2 + ")")
			d3.json("flare.json", function(error, root){
				if (error) throw error;

				var nodes = tree.nodes(root),
					links = tree.links(nodes)

				var link = svg.selectAll(".link")
						  .data(links)
						.enter().append("path")
						  .attr("class", "link")
						  .attr("d", diagonal);

				var node = svg.selectAll(".node")
						  .data(nodes)
						.enter().append("g")
						  .attr("class", "node")
						  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
					node.append("circle")
						.attr("r", 4.5);

					node.append("text")
						.attr("dy", ".31em")
						.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
						.attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
						.text(function(d) { return d.name; });
			})
			d3.select(self.frameElement).style("height", diameter - 150 + "px");
			*/