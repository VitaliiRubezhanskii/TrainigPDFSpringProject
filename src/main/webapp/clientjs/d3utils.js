/*<style>
.bar {
  fill: steelblue;
}
.bar:hover {
  fill: brown;
}
.axis {
  font: 10px sans-serif;
}
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.x.axis path {
  display: none;
}

</style>*/

// simplest example of adding barchart to element
function addBarChart(element)
{
			var margin = {top: 10, right: 10, bottom: 30, left: 30},
			    width = 500 - margin.left - margin.right,
			    height = 150 - margin.top - margin.bottom;
			
			var jsonTable = [
			        {
			                "slide": "5",
			                "time": 10
			         },
			        {
			                "slide": "6",
			                "time": 20
			         },
			];
			
			var x = d3.scale.ordinal()
			    .rangeRoundBands([0, width], .1);
			var y = d3.scale.linear()
			    .range([height, 0]);
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom");								
			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .ticks(5, "");
			var svg = d3.select(element).append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			  x.domain(jsonTable.map(function(d) { return d.slide; }));
			  y.domain([0, d3.max(jsonTable, function(d) { return d.time; })]);
			  svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);
			  svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis)
			    .append("text") // the text element - legend on y axis
			      .attr("transform", "rotate(-90)")
			      .attr("y", 6)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text("sec");
			  			  
			  // now we add the data
			  svg.selectAll(".bar")
			      .data(jsonTable)
			    .enter().append("rect")
			      .attr("class", "bar")
			      .attr("x", function(d) { return x(d.slide); })
			      .attr("width", x.rangeBand())
			      .attr("y", function(d) { return y(d.time); })	
			      .attr("height", function(d) { return height - y(d.time); });
}

function type(d) {
  d.time = +d.time;
  return d;
}


// add barchart for given jsonTable
function addAlertBarChart(element, jsonTable)
{
			var margin = {top: 20, right: 10, bottom: 30, left: 30},
			    width = 500 - margin.left - margin.right,
			    height = 150 - margin.top - margin.bottom;
/*			
			var jsonTable = [
			        {
			                "slide": "5",
			                "time": 10
			         },
			        {
			                "slide": "6",
			                "time": 20
			         },
			];
	*/		
			
			//alert(JSON.stringify(jsonTable));
			
			var x = d3.scale.ordinal()
			    .rangeRoundBands([0, width], .1);
			var y = d3.scale.linear()
			    .range([height, 0]);
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom");
			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .ticks(5, "");
			var svg = d3.select(element).append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			  x.domain(jsonTable.map(function(d) { return d.slide; }));
			  y.domain([0, d3.max(jsonTable, function(d) { return d.time; })]);
			  svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);
			  svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis)
			  svg.append("text")
			      //.attr("transform", "rotate(-90)")
			      .attr("class","xtext")
			      .attr("y", -5	)
			      .attr("x", -margin.left)
			      //.attr("dy", ".71em")
			      .style("text-anchor", "start")
			      .text("Seconds for each slide viewed:");
			  
			  svg.append("text")
			   .attr("class","xtext")
			   .attr("x",width/2 - margin.left)
			   .attr("y",height+margin.bottom)
			   .attr("text-anchor","middle")
			   .text("Slide number");
			   
			  //colors = d3.scale.category20();
			  			    				 
			 //barcolors = []; //colors array
			 for(var i=0; i<jsonTable.length; i++)
			  {
				 	 var timesappeared=0;
				 	 // check how many times current slide appeared before.
		 		   jsonTable[i].color = "blue"; //"rgb(0, 0, " + (jsonTable[i].time * 10) + ")";
				 	 for(var j=0; j<i; j++)
				 		 {
				 		 //  slide already viewed before.
				 		 //alert("comparing  " + jsonTable[i].slide + 
				 		 		//" and " + jsonTable[j].slide+ " result: "+ (jsonTable[i].slide==jsonTable[j].slide));
				 		 
				 		 // must use trim, because on creation of strings
				 		 // I padded spaces if string already appeared.
				 		 // otherwise it causes problems with duplicates in the d3.
				 		  		if (jsonTable[i].slide.trim()==jsonTable[j].slide.trim())
				 		  			{
				 		  				  timesappeared++;
				 		  			}
				 		 }
				 	 		 		  		
		 		  		// default value if not appeared before.
		 		  		if (timesappeared==1)
		 		  			{
		 		  			jsonTable[i].color = "orange"; //"rgb(" + (jsonTable[i].time * 10) + ",0,0)";
		 		  			}
		 		  		if (timesappeared==2)
	 		  				{
		 		  			jsonTable[i].color = "green"; //"rgb(0," + (jsonTable[i].time * 10) + ",0)";
	 		  				}
		 		  		// white for more than 2 appearances.
		 		  		if (timesappeared>2)
			  				{
			 		  			jsonTable[i].color = "white"; //"rgb("+(jsonTable[i].time * 10) + "," 
			  						//+(jsonTable[i].time * 10) + ","
			  						//+(jsonTable[i].time * 10)
			  							//+ ")";
			  				}				 	 
			  }
			  
			 svg.selectAll(".bar")
			      .data(jsonTable)
			      .enter().append("rect")
			      .attr("class", "bar")
			      .attr("x", function(d) { return x(d.slide); })
			      .attr("width", x.rangeBand())
			      .attr("y", function(d) { return y(d.time); })
			      .attr("height", function(d) { return height - y(d.time); })
			      .style("fill",function(d,i){return d.color;});			      			      
}


