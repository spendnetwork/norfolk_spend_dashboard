// graphs are organised in rows and boxes. r1 = row 1, b1 = box 1.
// pullquotes are denoted by p, so r1b1p1 is the first pull-quote in the first box in the first row.
//


// calls the funcs to update the three pull quotes for r1b1
function update_r1b1_PullQuotes(year) {

    d3.csv("data/ncc_service2.csv", function(csv) {

        if (typeof year !== "undefined") {
            csv = dimple.filterData(csv, 'YYYY', year);
        }

        update_r1b1p1(csv);
        update_r1b1p2(csv);
        update_r1b1p3(csv);
    });
}
// r1b1p1
function update_r1b1p1(csv) {
  // roll up and group data
  var data = d3.nest()
      .rollup(function(d) {
          return d3.sum(d, function(g) {
              return g.total_spend;
          });
      })
      .entries(csv);

  // set up formatter
  var rolledup = (data/1000000000)
  var formatter = d3.format(",.2f");
  // format my data
  fd = "£" + formatter(rolledup) + "bn";

  // print the output
  d3.select("#r1b1p1 .pull_fig").remove();
  d3.select("#r1b1p1").append("div").attr("class", "pull_fig").html(fd);
}
// r1b1p2
function update_r1b1p2(csv) {
  // roll up and group data
  var data = d3.nest()
      .key(function(d) {
          return d.date_calculated;
      })
      .rollup(function(d) {
          return d3.sum(d, function(g) {
              return g.total_spend;
          });
      }).entries(csv);

  // calculate avg
  var avg = d3.sum(data, function(d) {
      return d.values;
  }) / data.length;

  // set up formatter
  var rolledup = (avg/1000000);
  var formatter = d3.format(",.2f");
      // format my data
  fd = "£" + formatter(rolledup) + "m";

  // print data
  d3.select("#r1b1p2 .pull_fig").remove();
  d3.select("#r1b1p2").append("div").attr("class", "pull_fig").html(fd);
}
// r1b1p3
function update_r1b1p3(csv) {
  console.log("I'm processing the r1b1p3 function");

  // roll up and group data
  var data = d3.nest()
      .key(function(d) {
          return d.service;
      })
      .rollup(function(d) {
          return d3.sum(d, function(g) {
              return g.total_spend;
          });
      }).entries(csv);

  // get fractional share
  var sum = d3.sum(data, function(d) {return d.values;});
  var service = data.filter(function(d) { return d.key === "COMMUNITY SERVICES";});
  var perc = (service[0].values / sum);

  // set up formatter
  var formatter = d3.format("%.2f");

  // format my data
  fd = formatter(perc);

  // print data
  d3.select("#r1b1p3 .pull_fig").remove();
  d3.select("#r1b1p3").append("div").attr("class", "pull_fig").html(fd);
}
// r1b1-chart
function update_r1b1(year) {
    var svg1_1b = dimple.newSvg("#r1b1 .graph_wrapper", "100%", 300);
    d3.csv("data/ncc_service2.csv", function(data) {

        if (typeof year !== "undefined") {
            // console.log("data.length", data.length);
            // console.log("filtering by year", year);
            // console.log("filtering monthspend by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
            // console.log("data.length", data.length);
        }

        var monthlyBarChart = new dimple.chart(svg1_1b, data);
        monthlyBarChart.setBounds(60, 30, "92%", "70%");
        var x = monthlyBarChart.addCategoryAxis("x", "date_calculated");
        x.addOrderRule("date");
        var y = monthlyBarChart.addMeasureAxis("y", "total_spend");
        var monthBarChartseries = monthlyBarChart.addSeries(null, dimple.plot.bar);
        y.showGridlines = false;
        monthlyBarChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

        monthlyBarChart.draw(2000);
    });
}
// r2b1-chart & pull quotes
function update_r2b1(year) {
    var svg2_1 = dimple.newSvg("#r2b1 .graph_wrapper", "94%", 300);
    d3.csv("data/ncc_category.csv", function(csv) {

       
	    if (typeof year !== "undefined") {
            // console.log("filtering regionalSpendRing by ", year, '...');
            data = dimple.filterData(csv, 'YYYY', year);
        
		
		
	var data2= d3.nest()
	.key(function(d) { return d.category;})
	.rollup(function(d) { 
	var arr=[];
	arr[0] = d3.sum(d, function(g) {return g.total_spend; });
	arr[1] = d[0].YYYY;
	return arr;
	})	.entries(data)	;	
			
		
		}
		else
		{
	var data2= d3.nest()
	.key(function(d) { return d.category;})
	.rollup(function(d) { 
	var arr=[];
	arr[0] = d3.sum(d, function(g) {return g.total_spend; });
	arr[1] = d[0].YYYY;
	return arr;
	})	.entries(csv)	;	
			
			
			
		}
		
		
	data2.sort(function (a, b) {
	   return parseFloat(a.values) - parseFloat(b.values)
	});
	data2.reverse();
	
	var top10 = [];
	var jj=0;
	data2.forEach(function(d) {
	jj++;
	if(jj<=10) {
	top10.push (new Object({ category : d.key,	total_spend : d.values[0],YYYY: d.values[1]}));
		
		
		
		//throw BreakException;
		}
	
	});
	   

        var myChart = new dimple.chart(svg2_1, top10);
        myChart.setBounds(10, 15, "92%", "84%");
        myChart.addMeasureAxis("x", "total_spend");
        var y = myChart.addCategoryAxis("y", "category");
        y.addOrderRule("total_spend");
        y.hidden = true;
        // flat single colour, to add variable colours add series name in place of null
        var buyerchartSeries = myChart.addSeries(null, dimple.plot.bar);
        myChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

        buyerchartSeries.afterDraw = function(s, d) {
            var shape = d3.select(s);
            var widthThreshold = svg2_1.node().getBoundingClientRect().width / 2;
            var textXPos = shape.attr('width') > widthThreshold ? 0 : shape.attr('width') + 150;
            //var textColor = shape.attr('width') > widthThreshold ? "white" : "black";

            svg2_1.append("text")
                .attr("x", parseFloat(shape.attr("x")) + 10)
                .attr("y", parseFloat(shape.attr("y")) + 12) // need to calculated height based on number in series
                .style('fill', "black")
                .text(d.cy);
        };

        myChart.draw(2000);

		
		
	});
	
		
		
d3.csv("data/ncc_category_top10.csv", function(csv) {
		
		if (typeof year !== "undefined") {
            csv = dimple.filterData(csv, 'YYYY', year);
        }
		
        // roll up and group data
        var data = d3.nest()
            .key(function(d) {
                return d.category;
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g.sum;
                });
            }).entries(csv);

		
        var waste = data.filter(function(b) {
          return b.key == "Personal care services";
        });
		var ws = waste[0].values
		var divws = (ws/1000000)
        // set up formatter
        var formatter = d3.format(",.0f");

        // debugger
        // format my data
        fd = "£" + formatter(divws) + "m";
        console.log("waste: " + fd)

        // print data
        d3.select("#r2b1p1 .pull_fig").remove();
        d3.select("#r2b1p1").append("div").attr("class", "pull_fig").html(fd);

        // roll up and group data
        var data = d3.nest()
            .key(function(d) {
                return d.category;
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g.sum;
                });
            }).entries(csv);

        // get small business number
        var cat1 = data.filter(function(b) {
          return b.key == "Refuse disposal and treatment";
        });
        var ct = cat1[0].values;
		var divct = (ct/1000000)
		// console.log("divd1: ", divd1);

        // set up formatter
        var formatter = d3.format(",.0f");

        // format my data
        fd = "£" + formatter(divct) + "m";

        // print data
        d3.select("#r2b1p2 .pull_fig").remove();
        d3.select("#r2b1p2").append("div").attr("class", "pull_fig").html(fd);
    });
}
// r2b2-chart & pull quotes
function update_r2b2(year) {
    var svg2_2 = dimple.newSvg("#r2b2 .graph_wrapper", "94%", 300);
    d3.csv("data/ncc_supplier_type.csv", function(csv) {

        if (typeof year !== "undefined") {
          // console.log("filtering orgTypeChart by ", year, '...');
            data = dimple.filterData(csv, 'YYYY', year);
                // console.log(data);
        }

        var myChart = new dimple.chart(svg2_2, data);
        myChart.setBounds(10, 15, "92%", "84%");
        myChart.addMeasureAxis("x", "sum");
        var y = myChart.addCategoryAxis("y", "org_type");
        y.addOrderRule("sum");
        y.hidden = true;
        // flat single colour, to add variable colours add series name in place of null
        var buyerchartSeries = myChart.addSeries(null, dimple.plot.bar);
        myChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

		buyerchartSeries.afterDraw = function(s, d) {
            var shape = d3.select(s);
            var widthThreshold = svg2_2.node().getBoundingClientRect().width / 2;
            var textXPos = shape.attr('width') > widthThreshold ? 0 : shape.attr('width') + 150;
            //var textColor = shape.attr('width') > widthThreshold ? "white" : "black";

            svg2_2.append("text")
                .attr("x", parseFloat(shape.attr("x")) + 10)
                .attr("y", parseFloat(shape.attr("y")) + 22) // need to calculated height based on number in series
                .style('fill', "black")
                .text(d.cy);
        };

        myChart.draw(2000);

        if (typeof year !== "undefined") {
            csv = dimple.filterData(csv, 'YYYY', year);
        }

        // roll up and group data
        var data = d3.nest()
            .key(function(d) {
                return d.org_type;
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g.sum;
                });
            }).entries(csv);

        // get medium / large business number


        var mediumLargeBusinesses = data.filter(function(b) {
          return b.key == "MEDIUM / LARGE";
        });
		var ml = mediumLargeBusinesses[0].values
		var divml = (ml/1000000)
		console.log("this is divml: "+ divml)
        // set up formatter
        var formatter = d3.format(",.0f");

        // debugger
        // format my data
        fd = "£" + formatter(divml) + "m";

        // print data
        d3.select("#r2b2p1 .pull_fig").remove();
        d3.select("#r2b2p1").append("div").attr("class", "pull_fig").html(fd);

        // roll up and group data
        var data = d3.nest()
            .key(function(d) {
                return d.org_type;
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g.sum;
                });
            }).entries(csv);

        // get small business number
        var smallBusinesses = data.filter(function(b) {
          return b.key == "SMALL BUSINESS";
        });
        var d1 = smallBusinesses[0].values;
		var divd1 = (d1/1000000)
		// console.log("divd1: ", divd1);

        // set up formatter
        var formatter = d3.format(",.0f");

        // format my data
        fd = "£" + formatter(divd1) + "m";

        // print data
        d3.select("#r2b2p2 .pull_fig").remove();
        d3.select("#r2b2p2").append("div").attr("class", "pull_fig").html(fd);

    });
}
// r2b3-chart & pull quotes
function update_r2b3(year) {
    var svg2_3 = dimple.newSvg("#r2b3 .graph_wrapper", "94%", 300);
    d3.csv("data/ncc_service.csv", function(csv) {

        if (typeof year !== "undefined") {
            // console.log("filtering r2b3 by ", year, '...');
            // console.log(year);
            data = dimple.filterData(csv, 'YYYY', year);
        }

		var myChart = new dimple.chart(svg2_3, data);
        myChart.setBounds(10, 15, "92%", "84%");
        myChart.addMeasureAxis("x", "total_spend");
        var y = myChart.addCategoryAxis("y", "service");
        y.addOrderRule("total_spend");
        y.hidden = true;
        // flat single colour, to add variable colours add series name in place of null
        var buyerchartSeries = myChart.addSeries(null, dimple.plot.bar);
        myChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

		buyerchartSeries.afterDraw = function(s, d) {
            var shape = d3.select(s);
            var widthThreshold = svg2_3.node().getBoundingClientRect().width / 2;
            var textXPos = shape.attr('width') > widthThreshold ? 0 : shape.attr('width') + 150;
            //var textColor = shape.attr('width') > widthThreshold ? "white" : "black";

            svg2_3.append("text")
                .attr("x", parseFloat(shape.attr("x")) + 10)
                .attr("y", parseFloat(shape.attr("y")) + 15)
                .style('fill', "black")
                .text(d.cy);
        };

        myChart.draw(2000);

         if (typeof year !== "undefined") {
            csv = dimple.filterData(csv, 'YYYY', year);
        }

        // roll up and group data
        var data = d3.nest()
            .key(function(d) {
                return d.service;
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g.total_spend;
                });
            }).entries(csv);

        // get community services number


        var r2b3p1 = data.filter(function(b) {
          return b.key == "COMMUNITY SERVICES";
        });
		var p1 = r2b3p1[0].values
		var divp1 = (p1/1000000)
        // set up formatter
        var formatter = d3.format(",.0f");
        // format my data
        fd = "£" + formatter(divp1) + "m";
        console.log("r2b2p1: " + fd)

        // print data
        d3.select("#r2b3p1 .pull_fig").remove();
        d3.select("#r2b3p1").append("div").attr("class", "pull_fig").html(fd);

        // roll up and group data
        var data = d3.nest()
            .key(function(d) {
                return d.service;
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g.total_spend;
                });
            }).entries(csv);

        // get small business number
        var r2b3p2 = data.filter(function(b) {
          return b.key == "ENVIRONMENT TRANSPORT & DEVELOPMENT";
        });
        var p2 = r2b3p2[0].values;
		var divp2 = (p2/1000000)
		// console.log("divd1: ", divd1);

        // set up formatter
        var formatter = d3.format(",.0f");

        // format my data
        fd = "£" + formatter(divp2) + "m";

        // print data
        d3.select("#r2b3p2 .pull_fig").remove();
        d3.select("#r2b3p2").append("div").attr("class", "pull_fig").html(fd);
    });
}

function update_r4b1(year) {

    var svg4_1 = dimple.newSvg("#r4b1 .graph_wrapper", "94%", 300);

    d3.csv("data/ncc_supplier_top10small.csv", function(data) {

        // console.log(data);
        if (typeof year !== "undefined") {
            // console.log("filtering buildTopTenSupplierChart by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
            // console.log("filtered data", data);
        }

        ds = data.sort(function(a, b) {
            return parseFloat(a.sum) - parseFloat(b.sum);
        });

        dt = ds.slice(0, 10);

        var myChart = new dimple.chart(svg4_1, dt);
        myChart.setBounds(4, 20, "88%", "80%");
        myChart.addMeasureAxis("x", "sum");
        var y = myChart.addCategoryAxis("y", "supplier_name");
        y.hidden = true;
        // y.addOrderRule("supplier_name");
        supplierChartSeries = myChart.addSeries(null, dimple.plot.bar);
        myChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

        supplierChartSeries.afterDraw = function(s, d) {
            var shape = d3.select(s);
            var widthThreshold = svg4_1.node().getBoundingClientRect().width / 2;
            //var textXPos = shape.attr('width') > widthThreshold ? 0 : shape.attr('width') + 150;
            //var textColor = shape.attr('width') > widthThreshold ? "white" : "black";

            svg4_1.append("text")
                .attr("x", parseFloat(shape.attr("x")) + 10)
                .attr("y", parseFloat(shape.attr("y")) + 15)
                //.style('fill', textColor)
                .text(d.cy);
        };



        myChart.draw(2000);
    });

}

function update_r4b2(year) {
    var svg4_2 = dimple.newSvg("#r4b2 .graph_wrapper", "94%", 300);

    d3.csv("data/ncc_supplier_top10.csv", function(data) {

        if (typeof year !== "undefined") {
          // console.log("filtering buildTopTenBuyerChart by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
        }

        ds = data.sort(function(a, b) {
            return parseFloat(a.sum) - parseFloat(b.sum);
        });

        dt = ds.slice(0, 10);

        var myChart = new dimple.chart(svg4_2, dt);
        myChart.setBounds(4, 20, "88%", "80%");
        myChart.addMeasureAxis("x", "sum");
        var y = myChart.addCategoryAxis("y", "supplier_name");
        y.addOrderRule("sum");
        y.hidden = true;
        var buyerchartSeries = myChart.addSeries(null, dimple.plot.bar);
        myChart.defaultColors = [
          new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

        buyerchartSeries.afterDraw = function(s, d) {
            var shape = d3.select(s);
            var widthThreshold = svg4_2.node().getBoundingClientRect().width / 2;
            //var textXPos = shape.attr('width') > widthThreshold ? 0 : shape.attr('width') + 150;
            //var textColor = shape.attr('width') > widthThreshold ? "white" : "black";

            svg4_2.append("text")
                .attr("x", parseFloat(shape.attr("x")) + 10)
                .attr("y", parseFloat(shape.attr("y")) + 15)
                //.style('fill', textColor)
                .text(d.cy);
        };



        myChart.draw(2000);
    });
}

