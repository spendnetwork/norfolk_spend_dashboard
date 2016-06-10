function pipelineChart(selection) {

  var dimension, group, crossfilter;

  var xScale = d3.time.scale()
    , yScale = d3.scale.linear()

  var margin = {top: 30, right: 50, bottom: 30, left: 40}

  // set up width based on the size of the page
    , outerWidth = parseInt(d3.select('.graph_wrapper').style('width'), 10)
    , outerHeight = parseInt(d3.select('.graph_wrapper').style('height'), 10)
  // allow for margins, so when we set our graph, and shift inwards
  // it doesn't bleed paste the edges
    , width = outerWidth - margin.left - margin.right
    , height = outerHeight - margin.top - margin.bottom;

    // make our scale include the earliest and latest dates in the list
    // scaling them the length of what our our x axis will be



  function chart(selection){

    // debugger

    // console.log(earliest, latest)

    // debugger

    // set our domain, based on the grouped cross filter info
    var earliest = dimension.bottom(1)[0].end_date
      , latest = dimension.top(1)[0].end_date;

    // console.log(earliest, latest)

    // set our upper and lower bounds for the height of our graphs
    var least = d3.min(group.all(), function(d) { return d.value; })
      , most =  d3.max(group.all(), function(d) { return d.value; })
        // , most = cfdg.top(1)[0].value;

    var xScale = d3.time.scale()
        .domain([earliest, latest]).nice()
        .range([0, width]);

    var yScale = d3.scale.linear()
        .domain([least, most]).nice()
        .range([height,0]);

    // console.log(xScale.domain());

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
      , yAxis = d3.svg.axis().scale(yScale).orient("left");



      // debugger



    var brush = d3.svg.brush()
      .x(xScale)
      // .extent([earliest, latest])

    // debugger

    function brushed() {
      // console.log(brush.extent());
      var values = brush.extent();
      var fmt = d3.time.format("%Y-%m-%d");
      // debugger;
      d3.select('.crossfilter_start_text').html(fmt(values[0]));
      d3.select('.crossfilter_end_text').html(fmt(values[1]));
      NFPipeline.dateRange = [fmt(values[0]), fmt(values[1]) ]
      NFPipeline.applyFilters();
      var just10Contracts = NFPipeline.paginatedSlice();
      NFPipeline.showPaginatedResults(just10Contracts);
    }


    // create our outer box, and translate the centre for adding
    // visible elements
    var svg = selection
          .append('svg')
            .attr('width', outerWidth)
            .attr('height', outerHeight)
            // move a group inside, where we add our graph elements
          .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var outerBox = svg.append("rect")
        .attr("class", "outer")
        .attr("width", width)
        .attr("height", height);

    svg.append('g')
      .attr('class', 'x axis')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    brush.on("brush", brushed);

    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush)
    .selectAll("rect") //select all the just-created rectangles
      .attr("y", -6)
      .attr("height", height + 7); //set their height

    // debugger;
    data = group.all();

    // debugger;

    svg.selectAll('rect')
      data(data)
      .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('value', function(d) { return d.value })
        .attr('scaledValue', function(d) { return yScale(d.value) })
        .attr('date', function(d) { return d.key })
        .attr('x', function(d, i) { return xScale(d.key); })
        .attr('y', function(d) { return height - d.value; } )
        .attr('width',  function(d) { return width / data.length; })
        .attr('height', function(d, i) { return d.value; })
        .datum(data)

  }


  chart.dimension = function(_) {
    if (!arguments.length) return dimension;
    dimension = _;
    return chart;
  };

  chart.filter = function(_) {
    if (_) {
      brush.extent(_);
      dimension.filterRange(_);
    } else {
      brush.clear();
      dimension.filterAll();
    }
    brushDirty = true;
    return chart;
  };

  chart.group = function(_) {
    if (!arguments.length) return group;
    group = _;
    return chart;
  };

  chart.crossfilter = function(_) {
    if (!arguments.length) return crossfilter;
    crossfilter = _;
    return chart;
  }

  chart.xScale = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart
  }

  chart.yScale = function(_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart
  }

  chart.width = function(_) {
    if (!arguments.length) return outerWidth;
    outerWidth = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return outerHeight;
    outerHeight = _;
    return chart;
  };

  return chart;

}
