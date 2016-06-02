// graphs are organised in rows and boxes. r1 = row 1, b1 = box 1.
// pullquotes are denoted by p, so r1b1p1 is the first pull-quote in the first box in the first row.
//


// calls the funcs to update the three pull quotes for r1b1
function update_r1b1_PullQuotes(year) {

    d3.json("https://dataclips.heroku.com/trvuaxfjorkjryxjhyevbtzkscml-norfolk_service.json", function (jsondata) {

        var csv = []
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            csv.push({
                'service': row[0] || '(no data)',
                'date_calculated': row[1],
                'total_spend': row[2],
                'YYYY': row[3]
            });
        }

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
        .rollup(function (d) {
            return d3.sum(d, function (g) {
                return g.total_spend;
            });
        })
        .entries(csv);

    // set up formatter
    var rolledup = (data / 1000000000)
    var formatter = d3.format(",.2f");
    // format my data
    fd = "£" + formatter(rolledup) + "bn";

    // print the output
    d3.select("#r1b1p1 .pull_fig").remove();
    d3.select("#r1b1p1").insert("div",":first-child").attr("class", "pull_fig").html(fd);
}
// r1b1p2
function update_r1b1p2(csv) {
    // roll up and group data
    var data = d3.nest()
        .key(function (d) {
            return d.date_calculated;
        })
        .rollup(function (d) {
            return d3.sum(d, function (g) {
                return g.total_spend;
            });
        }).entries(csv);

    // calculate avg
    var avg = d3.sum(data, function (d) {
        return d.values;
    }) / data.length;

    // set up formatter
    var rolledup = (avg / 1000000);
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
        .key(function (d) {
            return d.service;
        })
        .rollup(function (d) {
            return d3.sum(d, function (g) {
                return g.total_spend;
            });
        }).entries(csv);

    // get fractional share
    var sum = d3.sum(data, function (d) {
        return d.values;
    });
    var service = data.filter(function (d) {
        return d.key === "Community Services";
    });
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
    d3.json("https://dataclips.heroku.com/trvuaxfjorkjryxjhyevbtzkscml-norfolk_service.json", function (jsondata) {

        var data = []
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            data.push({
                'service': row[0] || '(no data)',
                'date_calculated': row[1],
                'total_spend': row[2],
                'YYYY': row[3]
            });
        }

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

    d3.json("https://dataclips.heroku.com/cmfvkuhdrrzlxrkbebtiuptjkvwd-norfolk_category.json", function (jsondata) {

        var csv = [];
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            var category = row[0] || '(no data)';

            csv.push({
                'category': category,
                'total_spend': row[1],
                'YYYY': row[2]
            });
        }

        if (typeof year !== "undefined") {
            // console.log("filtering regionalSpendRing by ", year, '...');
            data = dimple.filterData(csv, 'YYYY', year);

            var data2 = d3.nest()
                .key(function (d) {
                    return d.category;
                })
                .rollup(function (d) {
                    var arr = [];
                    arr[0] = d3.sum(d, function (g) {
                        return g.total_spend;
                    });
                    arr[1] = d[0].YYYY;
                    return arr;
                }).entries(data);


        }
        else {
            var data2 = d3.nest()
                .key(function (d) {
                    return d.category;
                })
                .rollup(function (d) {
                    var arr = [];
                    arr[0] = d3.sum(d, function (g) {
                        return g.total_spend;
                    });
                    arr[1] = d[0].YYYY;
                    return arr;
                }).entries(csv);


        }


        data2.sort(function (a, b) {
            return parseFloat(a.values) - parseFloat(b.values)
        });
        data2.reverse();

        var top10 = [];
        var jj = 0;
        var top2 = [];
        data2.forEach(function (d) {
            jj++;
            if (jj <= 10) {
                top10.push(new Object({ category: d.key, total_spend: d.values[0], YYYY: d.values[1]}));
            }
            if (top2.length < 2 && d.key != '(no data)') {
                top2.push(new Object({category: d.key, total_spend: d.values[0]}));
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

        buyerchartSeries.afterDraw = function (s, d) {
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

        var divps = (top2[0].total_spend / 1000000);
        // set up formatter
        var formatter = d3.format(",.0f");

        // debugger
        // format my data
        var fd = "£" + formatter(divps) + "m";

        // print data
        d3.select("#r2b1p1 .pull_fig").remove();
        d3.select("#r2b1p1").append("div").attr("class", "pull_fig").html(fd);
        d3.select("#r2b1p1 .pull_sub").html(top2[0].category);

        var divws = (top2[1].total_spend / 1000000);

        // format my data
        fd = "£" + formatter(divws) + "m";

        // print data
        d3.select("#r2b1p2 .pull_fig").remove();
        d3.select("#r2b1p2").append("div").attr("class", "pull_fig").html(fd);
        d3.select("#r2b1p2 .pull_sub").html(top2[1].category);
    });
}
// r2b2-chart & pull quotes
function update_r2b2(year) {
    var svg2_2 = dimple.newSvg("#r2b2 .graph_wrapper", "94%", 300);
    d3.json("https://dataclips.heroku.com/qqkkhidlndgblqtobmzxenlosizj-norfolk_supplier_type.json", function (jsondata) {

        var medlarge_businesses = 0;
        var small_businesses = 0;

        var data = {};
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            if (year && year != row[3]) {
                continue;
            }

            if (!data[row[0]]) {
                data[row[0]] = 0;
            }
            data[row[0]] += row[2];

            if (row[0] == 'MEDIUM / LARGE') {
                medlarge_businesses += row[2];
            }
            if (row[0] == 'SMALL BUSINESS') {
                small_businesses += row[2];
            }
        }

        var csv = []
        for (var org_type in data) {
            if (data.hasOwnProperty(org_type)) {
                console.log(org_type);
                console.log(data[org_type]);
                csv.push({
                    'org_type': org_type,
                    'sum': data[org_type]
                });
            }
        }

        var myChart = new dimple.chart(svg2_2, csv);
        myChart.setBounds(10, 15, "92%", "84%");
        var x = myChart.addMeasureAxis("x", "sum");
        var y = myChart.addCategoryAxis("y", "org_type");
        y.addOrderRule("sum");
        y.hidden = true;
        // flat single colour, to add variable colours add series name in place of null
        var buyerchartSeries = myChart.addSeries(null, dimple.plot.bar);
        myChart.defaultColors = [
            new dimple.color("#81C936", "#81C936", 1), // Norfolk green
        ];

        buyerchartSeries.afterDraw = function (s, d) {
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
        x.titleShape.text("total spend");

        // get medium / large business number

        var divml = (medlarge_businesses / 1000000)
        console.log("this is divml: " + divml)
        // set up formatter
        var formatter = d3.format(",.0f");

        // debugger
        // format my data
        fd = "£" + formatter(divml) + "m";

        // print data
        d3.select("#r2b2p1 .pull_fig").remove();
        d3.select("#r2b2p1").append("div").attr("class", "pull_fig").html(fd);

        var d1 = small_businesses;
        var divd1 = (d1 / 1000000)
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
    d3.json("https://dataclips.heroku.com/trvuaxfjorkjryxjhyevbtzkscml-norfolk_service.json", function (jsondata) {

        var csv = []
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            csv.push({
                'service': row[0] || '(no data)',
                'date_calculated': row[1],
                'total_spend': row[2],
                'YYYY': row[3]
            });
        }
        if (typeof year !== "undefined") {
            // console.log("filtering r2b3 by ", year, '...');
            // console.log(year);
            csv = dimple.filterData(csv, 'YYYY', year);
        }

        var data_copy = d3.nest()
            .key(function (d) {
                return d.service;
            })
            .rollup(function (d) {
                return d3.sum(d, function (g) {
                    return g.total_spend;
                });
            }).entries(csv);

        data_copy.sort(function(a, b) { return b.values - a.values});

        var top10 = [];
        var jj = 0;
        data_copy.forEach(function (d) {
            jj++;
            if (jj <= 10) {
                top10.push(new Object({ service: d.key, total_spend: d.values}));
            }
        });

        console.log(top10);

        var myChart = new dimple.chart(svg2_3, top10);
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

        buyerchartSeries.afterDraw = function (s, d) {
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
            .key(function (d) {
                return d.service;
            })
            .rollup(function (d) {
                return d3.sum(d, function (g) {
                    return g.total_spend;
                });
            }).entries(csv);

        // get community services number


        var r2b3p1 = data.filter(function (b) {
            return b.key == "Community Services";
        });
        var p1 = r2b3p1[0].values
        var divp1 = (p1 / 1000000)
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
            .key(function (d) {
                return d.service;
            })
            .rollup(function (d) {
                return d3.sum(d, function (g) {
                    return g.total_spend;
                });
            }).entries(csv);

        // get small business number
        var r2b3p2 = data.filter(function (b) {
            return b.key == "Environment, Transport & Development";
        });
        var p2 = r2b3p2[0].values;
        var divp2 = (p2 / 1000000)
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

    d3.json("https://dataclips.heroku.com/eylcztpirojwkpimoerwdantthcr-norfolk_supplier_top10_small.json", function (jsondata) {

        var data = [];
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            data.push({
                'supplier_name': row[0],
                'sum': row[1],
                'YYYY': row[2]
            });
        }

        // console.log(data);
        if (typeof year !== "undefined") {
            // console.log("filtering buildTopTenSupplierChart by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
            // console.log("filtered data", data);
        }

        ds = data.sort(function (a, b) {
            return parseFloat(b.sum) - parseFloat(a.sum);
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

        supplierChartSeries.afterDraw = function (s, d) {
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

    d3.json("https://dataclips.heroku.com/xfgsnoumtajyxowzymyxhfuoaeza-norfolk_supplier_top10_medlarge.json", function (jsondata) {

        var data = [];
        for (var i = 0; i < jsondata['values'].length; i++) {
            var row = jsondata['values'][i];
            data.push({
                'supplier_name': row[0],
                'sum': row[1],
                'YYYY': row[2]
            });
        }

        if (typeof year !== "undefined") {
            // console.log("filtering buildTopTenBuyerChart by ", year, '...');
            data = dimple.filterData(data, 'YYYY', year);
        }

        ds = data.sort(function (a, b) {
            return parseFloat(b.sum) - parseFloat(a.sum);
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

        buyerchartSeries.afterDraw = function (s, d) {
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

