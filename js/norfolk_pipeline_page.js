$(document).ready(function() {

    window.dataTable = dc.dataTable("#dc-table-graph");
    window.detailChart = dc.barChart("#dc-detail-chart");
    window.frequencyChart = dc.barChart("#dc-frequency-chart");

    var cfc, cfcg;

    d3.json('/js/norfolk.pipeline.data.json', function(payload) {

        coercePayload(payload);

        // store json results for later reference
        NFPipeline.payload = payload;

        cf = crossfilter(NFPipeline.payload);
        all = cf.groupAll();

        // category dimension and group
        cfc = cf.dimension(function(d) {
            return d.category;
        })
        cfcg = cfc.group();

        // crossFilterDates
        cfd = cf.dimension(function(d) {
                return d.end_date;
            })
            // crossFilterDates, grouped
        cfdg = cfd.group(d3.time.month)

        // make the category dimension available globally
        window.cfc = cfc

        var chartWidth = parseInt(d3.select('.graph_wrapper').style('width'), 10)

        function _updateFilteredDates(dates) {
          if (!dates){
            d3.select('pipeline-widget span.filters')
          }
          d3.select('span')
        }

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
            .size(200)
            .sortBy(function(d) {
                return d.end_date;
            })
            .order(d3.ascending);

        var earliest = parseDate("2015-03-01")
          , latest = parseDate("2020-05-05");

        frequencyChart.dimension(cfd)
            .group(cfdg)
            .width(chartWidth)
            .height(100)
            .margins({
                top: 10,
                right: 10,
                bottom: 20,
                left: 40
            })
            .transitionDuration(500)
            .gap(0)
            .renderHorizontalGridLines(true)
            .yAxisPadding(100)
            .xAxisPadding(150)
            .round(d3.time.month.round)
            .xUnits(d3.time.months)
            .x(d3.time.scale().domain([earliest, latest]))
            .y(d3.scale.linear().domain([0, 80]).clamp(true))
            .yAxis().tickFormat("").outerTickSize(0).innerTickSize(0);

        frequencyChart.filterPrinter = function() {
          console.log(frequencyChart.filters());
        };

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

                        // frequencyChart
                        _updateFilteredDates(frequencyChart.filters());

                    }
                });
            });
            return this;
        };


        // Create our live counter
        dc.dataCount('.dc-data-count')
            .dimension(cfcg)
            .group(all)
            .html({
                some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
                all: 'All records selected. Please click on the graph to apply filters.'
            });


        detailChart.dimension(cfd)
            .brushOn(false)
            .group(cfdg)
            .width(chartWidth)
            .height(400)
            .margins({
                top: 10,
                right: 10,
                bottom: 20,
                left: 40
            })
            .transitionDuration(500)
            .gap(5)

            .elasticY(true)
                .yAxisPadding("10%")
                .xAxisPadding("50%")
                .round(d3.time.month.round)
                .xUnits(d3.time.months)
                .y(d3.scale.linear().domain([0, 300]).clamp(true))
                .x(d3.time.scale()
                    .domain([earliest, latest]))
            .xAxis().tickFormat()

        frequencyChart.focusCharts([detailChart])

        dc.renderAll()


        // initialise the starting value for the category filter
        var optionData = d3.values(cfcg.all())
        formatted_keys = optionData.map(function(d) {
            return {
                "category": d.key,
                "value": d.value
            }
        });

        _buildCategoryFilterOptions(".widget-category-filter", formatted_keys)
        $('.widget-category-filter').select2();

        // pre-set the brush selection between these two dates
        frequencyChart.filter([parseDate("2015-05-01"), parseDate("2016-02-01")])

        // add listener for updating the categories
        $('.pipeline-widget')
            .on('change', '.widget-category-filter', function() {
                var category = $(this).find('option:selected').attr('value');
                cfc.filterExact(category)
                dc.redrawAll()
            })
    });
});