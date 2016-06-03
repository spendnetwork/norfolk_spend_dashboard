$(document).ready(function() {

  window.frequencyChart = dc.barChart("#dc-frequency-chart");

  d3.json('https://dataclips.s3.amazonaws.com/oneozfujgidzwkxozkwpcudylpxj.json?response-content-type=application/json&X-Amz-Expires=600&X-Amz-Date=20160603T142509Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJYMGOQOFWG6TTFYA/20160603/us-east-1/s3/aws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=c5e3c1e024fc7353562dd4d8cea98a4ec7c7d11e5c97a37bf6c971691bc37b80', function(jsondata) {

    var payload = [];

    for (var i = 0; i < jsondata['values'].length; i++) {
        var row = jsondata['values'][i];
        if (!row[2]) {
            continue;
        }
        var d = {
            'index': i,
            'supplier': row[0],
            'end_date': parseDate(row[2]),
            'category': row[1],
            'contract_value': 0+row[3],
            'description': row[1]
        };
        payload.push(d);
    }

    //coercePayload(payload);

    cf = crossfilter(payload);
    all = cf.groupAll();
    var cfc = cf.dimension(function(d) { return d.category; })
    var cfcg = cfc.group();

    window.cfc = cfc;
    window.cfcg = cfcg;

    // crossFilterDates
    cfd = cf.dimension(function(d) { return d.end_date; })
    // crossFilterDates, grouped
    cfdg = cfd.group(d3.time.month)

    var chartWidth = parseInt(d3.select('.pipeline .graph_wrapper').style('width'), 10)


    var earliest = parseDate("2016-03-01")
      // , latest = cfd.top(1)[0].end_date]
      , latest = parseDate("2018-03-01");

    frequencyChart.dimension(cfd)
      .group(cfdg)
      .width(chartWidth)
      .height(100)
      .margins({top: 10, right: 10, bottom: 20, left: 40})
      .transitionDuration(500)
      .gap(0)
      .yAxisPadding(100)
      .xAxisPadding(150)
      .round(d3.time.month.round)
      .xUnits(d3.time.months)
      .x(d3.time.scale().domain([earliest, latest]))
      .y(d3.scale.linear().domain([0,80]).clamp(true))
      .renderHorizontalGridLines(true)
      .yAxis().tickFormat("").outerTickSize(0).innerTickSize(0);

    frequencyChart.focusCharts = function(chartlist) {
      if (!arguments.length) {
        return this._focusCharts;
      }
      this._focusCharts = chartlist; // only needed to support the getter above
      this.on('filtered', function(range_chart) {
          RefreshTable();

        if (!range_chart.filter()) {
          dc.events.trigger(function() {
            chartlist.forEach(function(focus_chart) {
              focus_chart.x().domain(focus_chart.xOriginalDomain());
            });
          });
          // this doesn't when we drag the brush filter yet
          // TODO: make this update to show the live count
          var optionData = d3.values(cfcg.all())
          formatted_keys = optionData.map(function(d) {
            return {
              "category": d.key,
              "value": d.value
            }
          });

          _buildCategoryFilterOptions(".widget-category-filter", formatted_keys)
          //$('.widget-category-filter').select2();

        } else chartlist.forEach(function(focus_chart) {
          if (!rangesEqual(range_chart.filter(), focus_chart.filter())) {
            dc.events.trigger(function() {
              focus_chart.focus(range_chart.filter());
            });
            var optionData = d3.values(cfcg.all())
            formatted_keys = optionData.map(function(d) {
              return {
                "category": d.key,
                "value": d.value
              }
            });

            _buildCategoryFilterOptions(".widget-category-filter", formatted_keys)
            //$('.widget-category-filter').select2();

          }
        });
      });
      return this;
    };

    window.frequencyChart = frequencyChart;



      window.dataTable = $('#data_table').dataTable({
          "order": [[3, 'asc']],
          "columnDefs": [
              { "targets": 0, "data": function(d) { return d.supplier; } },
              { "targets": 1, "data": function(d) { return d.category; } },
              { "targets": 2, "data": function(d) { return formatMoney(d.contract_value); } },
              { "targets": 3, "data": function(d) { return formatDate(d.end_date); } },
              { "targets": 4, "data": function(d) { return d.description; } }
          ],
          "searching": false,
          "lengthChange": false,
          "pageLength": 5
      });

      function RefreshTable() {
          dc.events.trigger(function () {
              dataTable.api()
                  .clear()
                  .rows.add( cfd.top(Infinity) )
                  .draw() ;
          });
      }

      for (var i = 0; i < dc.chartRegistry.list().length; i++) {
          var chartI = dc.chartRegistry.list()[i];
          chartI.on("filtered", RefreshTable);
      }

      frequencyChart.focusCharts([]);

    frequencyChart.filter([parseDate("2016-03-01"), parseDate("2016-06-01")]);
    cfd.filter([parseDate("2016-03-01"), parseDate("2016-06-01")]);

    dc.renderAll();
    RefreshTable();
  })


})
