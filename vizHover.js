// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");



// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var data = d3.map();
var colorScheme = d3.schemeBlues[7];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([1, 26, 76, 151, 501, 1001, 5001])
    .range(colorScheme);
    
// Legend
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Refugees Admitted to the US in 2015");
var labels = ['0', '1-25', '26-75', '76-150', '151-500', '501-1000', '1001-5000', '> 5000'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
svg.select(".legendThreshold")
    .call(legend);
// Load external data and boot
d3.queue()
    .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, "d3data.csv", function(d) { data.set(d.code, +d.total); })
    .await(ready);
function ready(error, topo) {
    if (error) throw error;
    // Draw the map
    var g = svg.append("g").attr("class", "countries");
    var centered;
    
    g.selectAll("path")
        .data(topo.features)
        .enter().append("path")
            .attr("fill", function (d){
                // Pull data for this country
                d.total = data.get(d.id) || 0;
                // Set the color
                return colorScale(d.total);
            })
            .attr("d", path)
            .on("click", clicked);

    function clicked(d) {
	  var x, y, k;

	  if (d && centered !== d) {
	    var centroid = path.centroid(d);
	    x = centroid[0];
	    y = centroid[1];
	    k = 4;
	    centered = d;
	  } else {
	    x = width / 2;
	    y = height / 2;
	    k = 1;
	    centered = null;
	  }

	  g.selectAll("path")
	      .classed("active", centered && function(d) { return d === centered; });

	  g.transition()
	      .duration(750)
	      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
	      .style("stroke-width", 1.5 / k + "px");
	}
}