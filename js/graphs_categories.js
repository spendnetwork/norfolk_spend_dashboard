// graphs are organised in rows and boxes. r1 = row 1, b1 = box 1.
// pullquotes are denoted by p, so r1b1p1 is the first pull-quote in the first box in the first row.
//


// calls the funcs to update the three pull quotes for r1b1
// r1b1-chart

//$(document).ready( function () {
  //  $('#test_table').DataTable();
  //  $('#data_table').DataTable();
//} );

function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }
function generatedata(year)
{

d3.csv("data/ncc_category.csv", function(data) {   
	
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
generatedatatable(data);

	}
	else
	{ 
		jQuery(".t22table").html('<table id="data_table" class="display"><thead><tr><th></th><th></th><th></th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table></div>');
		// adds blank table so that we don't break the dataTables() func 
	}
	});
	
	
}

// the code to reset button and fetch the values for graph and datatable for that year selected
function setdata(val,id)
{
	if (oTable != null) {
//       $("#data_table").html("");
	jQuery('#data_table').dataTable().fnDestroy();
	jQuery(".t22table").html('<table id="data_table" class="display"><thead></thead><tbody></tbody></table></div>');
		
     }
	
	$("#r1b1 .graph_wrapper").empty();
	$(".pure-button").removeClass("pure-button-active");
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
	jj++;
	if(jj<=15) {
	top10.push (new Object({ category : d.key,	total_spend : d.values[0],year: d.values[1]}));
		
		
		
		//throw BreakException;
		}
	
	});
	} catch(e) {
    if (e!==BreakException) throw e;
	}
	
	
	
	//console.log(data3);
	//var top10 = data2.slice(0, 10); // slice the first 10
	
	    
	var svg1_1b = dimple.newSvg("#r1b1 .graph_wrapper", "100%", "400");     	
        var barChart = new dimple.chart(svg1_1b, top10);
        barChart.setBounds(20, 30, "94%", "88%");
        barChart.addMeasureAxis("x", "total_spend");
        var y = barChart.addCategoryAxis("y", "category");
        y.addOrderRule("total_spend");
        y.hidden = true;
        
        var barChartseries = barChart.addSeries(null, dimple.plot.bar);
        y.showGridlines = false;
        
        barChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];   
    
    barChartseries.afterDraw = function(s, d) {
        var shape = d3.select(s);
        var widthThreshold = svg1_1b.node().getBoundingClientRect().width / 2;
        var textXPos = shape.attr('width') > widthThreshold ? 0 : shape.attr('width') + 150;
        //var textColor = shape.attr('width') > widthThreshold ? "white" : "black";

        svg1_1b.append("text")
            .attr("x", parseFloat(shape.attr("x")) + 10)
            .attr("y", parseFloat(shape.attr("y")) + 14) // need to calculated height based on number in series
            .style('fill', "black")
            .text(d.cy);
    	};

        
      barChart.draw(2000);
	}
	
	
	function generatedatatable(data)
{
	
	  
    // create the table header
     d3.select("#data_table thead")
        .append('tr')
        .selectAll("th")
        .data(d3.keys(data[0]))
        .enter().append("th").text(function(d){ console.log(d);if(d== "category") return "Category"; if(d == "total_spend") return "Amount"; if(d == "YYYY") return "Year"; });
        
    // fill the table
    // create rows
    var tr = d3.select("tbody").selectAll("tr")
        .data(data).enter().append("tr")

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
				d = "£"+commaSeparateNumber(Math.ceil(d));
				
				
			
			return d
			})
			.attr("data-sort", function( d ){  return d; });

        oTable =  $("#data_table").dataTable({
	        "order": [[1, 'desc']]
 		});
      
	}
$(document).ready( function () {
	generatedata("");
});



