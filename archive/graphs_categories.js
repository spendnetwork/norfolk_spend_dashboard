// graphs are organised in rows and boxes. r1 = row 1, b1 = box 1.
// pullquotes are denoted by p, so r1b1p1 is the first pull-quote in the first box in the first row.
//


// calls the funcs to update the three pull quotes for r1b1
// r1b1-chart

//$(document).ready( function () {
  //  $('#test_table').DataTable();
  //  $('#data_table').DataTable();
//} );


function generatedata(year)
{

d3.csv("data/ncc_category2.csv", function(data) {   
	
	 if (typeof year !== "undefined" && year !='') {
            // console.log("data.length", data.length);
            // console.log("filtering by year", year);
            // console.log("filtering monthspend by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
            // console.log("data.length", data.length);
        }
	console.log(data.length);
	if(data.length > 0)
	{	
update1(data,year);
	}
	else
	{
		jQuery(".t22table").html('<table id="data_table" class="display"><thead><tr><th></th><th></th><th></th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table></div>');
		
	}
	});
	
	
}


function setdata(val,id)
{
	if (oTable != null) {
//       $("#data_table").html("");
	jQuery('#data_table').dataTable().fnDestroy();
	jQuery(".t22table").html('<table id="data_table" class="display"><thead></thead><tbody></tbody></table></div>');
		
     }
	
	$("#r1b1 .graph_wrapper").empty();
	$(".pure-button button-small").removeClass("pure-button-active");
	$("#"+id).addClass("pure-button-active");
	try{
	generatedata(val);
	}
	catch(e)
	{
		console.log(e);
	}
	
	
}





	var oTable= null;
	
	function update1(data,year)
	{
	
	
	
	var data2= d3.nest()
	.key(function(d) { return d.category;})
	.rollup(function(d) { 
	var arr=[];
	arr[0] = d3.sum(d, function(g) {return g.total_spend; });
	arr[1] = d[0].YYYY;
	return arr;
	})
	
	.entries(data)
	
	;
	

	data2.sort(function (a, b) {
	   return parseFloat(a.values) - parseFloat(b.values)
	});
	data2.reverse();
	console.log(data2);
	
	
	
	var top10 = [];
	var jj=0;
	
	
	var BreakException= {};
	
	var data3=[];
try {
	data2.forEach(function(d) {
		data3.push( new Object({category: d.key,total_spend: d.values[0],year:d.values[1]}));
	top10.push (new Object({ category : d.key,	total_spend : d.values[0],year: d.values[1]}));
	jj++;
	if(jj>9) {
		throw BreakException;
		}
	
	});
	} catch(e) {
    if (e!==BreakException) throw e;
	}
	
	
	
	console.log(data3);
	//var top10 = data2.slice(0, 10); // slice the first 10
	
	    
	var svg1_1b = dimple.newSvg("#r1b1 .graph_wrapper", "100%", 500);     	
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
      barChart.draw();
	 
	  
    // create the table header
     d3.select("#data_table thead")
        .append('tr')
        .selectAll("th")
        .data(d3.keys(data3[0]))
        .enter().append("th").text(function(d){ console.log(d);if(d== "category") return "Category"; if(d == "total_spend") return "Amount"; if(d == "year") return "Year"; });
        
    // fill the table
    // create rows
    var tr = d3.select("tbody").selectAll("tr")
        .data(data3).enter().append("tr")

    // cells
	var col=0;
    var td = tr.selectAll("td")
        .data(function(d){
			col=0;
			return d3.values(d)
			
			})
        .enter().append("td")
        .text(function(d) {
			col++;
		
			
				if(col % 3 == 2)
				d = "£"+Math.ceil(d);
				
				
			
			return d
			})
			.attr("data-sort", function( d ){  return d; });

 oTable =  $("#data_table").dataTable();

	}
$(document).ready( function () {
	generatedata("");
});



