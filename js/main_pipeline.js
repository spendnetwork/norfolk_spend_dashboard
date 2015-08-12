$(document).ready(function() {

  window.dataTable = dc.dataTable("#dc-table-graph");
  window.frequencyChart = dc.barChart("#dc-frequency-chart");

  d3.json('/js/norfolk.pipeline.data.json', function(payload) {

    coercePayload(payload);

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


    var earliest = parseDate("2015-03-01")
      // , latest = cfd.top(1)[0].end_date]
      , latest = parseDate("2017-05-05");

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
          $('.widget-category-filter').select2();

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
            $('.widget-category-filter').select2();

          }
        });
      });
      return this;
    };

    window.frequencyChart = frequencyChart;

    dataTable.width(chartWidth).height(800)
      .dimension(cfd)
      .group(function(d) {
          return "Contracts Ending Soon"
      })
      .columns([
          function(d) {
              return d.supplier;
          },
          function(d) {
              return d.category;
          },
          function(d) {
              return formatMoney(d.contract_value);
          },
          function(d) {
              return formatDate(d.end_date);
          }
      ])
      .size(5)
      .sortBy(function(d) {
          return d.end_date;
      })
      .order(d3.ascending);

      frequencyChart.focusCharts([])

    dc.renderAll();

    frequencyChart.filter([parseDate("2015-05-01"), parseDate("2015-08-01")])
    dc.renderAll();
    // dc.redrawAll();
  })


})
