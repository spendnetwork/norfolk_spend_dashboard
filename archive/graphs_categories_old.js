// graphs are organised in rows and boxes. r1 = row 1, b1 = box 1.
// pullquotes are denoted by p, so r1b1p1 is the first pull-quote in the first box in the first row.
//


// calls the funcs to update the three pull quotes for r1b1
// r1b1-chart

//$(document).ready( function () {
  //  $('#test_table').DataTable();
  //  $('#data_table').DataTable();
//} );


d3.csv("data/ncc_category.csv", function(error, csv) {   
	var data = d3.nest()
	.key(function(d) { return d.category;})
	.rollup(function(d) { return d3.sum(d, function(g) {return +g.total_spend; }); }).entries(csv)	
	
	 if (typeof year !== "undefined") {
            // console.log("data.length", data.length);
            // console.log("filtering by year", year);
            // console.log("filtering monthspend by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
            // console.log("data.length", data.length);
        }

	
	var sorted = data.sort(function (a, b) {
	   if (a.values < b.values) {
          return 1;
       }
       if (a.values > b.values) {
	       return -1;
	   }
	   // a must be equal to b
	   return 0;
	});
	
	var top10 = sorted.slice(0, 10); // slice the first 10
	    console.dir(top10);
	    
	var svg1_1b = dimple.newSvg("#r1b1 .graph_wrapper", "100%", 300);     	
        var barChart = new dimple.chart(svg1_1b, top10);
        barChart.setBounds(300, 30, "70%", "88%");
        var y = barChart.addCategoryAxis("y", "category");
        var x = barChart.addMeasureAxis("x", "total_spend");
        var barChartseries = barChart.addSeries(null, dimple.plot.bar);
        y.showGridlines = false;
        y.addOrderRule("total_spend");
        
        barChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];   
     
    // create the table header
     d3.select("#data_table thead")
        .append('tr')
        .selectAll("th")
        .data(d3.keys(sorted[0]))
        .enter().append("th").text(function(d){return d});
        
    // fill the table
    // create rows
    var tr = d3.select("tbody").selectAll("tr")
        .data(sorted).enter().append("tr")

    // cells
    var td = tr.selectAll("td")
        .data(function(d){return d3.values(d)})
        .enter().append("td")
        .text(function(d) {return d})

    $("#data_table").dataTable();

});




