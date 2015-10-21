//  build a select bar which has all the categories in the list, so you can
// trigger category filtering
function buildPipelineFilterWidget(pipelineData, NFPipeline) {

    _buildCategoryFilterOptions(".widget-category-filter", pipelineData)
}

function _buildCategoryFilterOptions(selection, data){
  var categoryFilterOptions = d3.select(selection)

  categoryFilterOptions
      .selectAll("option")
      .data(data)
      .enter()
        .append("option")
        .attr('value', function(row) {
            return row.category;
        })
        .text(function(row) {
            return row.category + " - (" + row.value + ")";
        });
}


function _addPagination(NFPipeline) {

    var slice = NFPipeline.sliceForPage();
    var count = NFPipeline.workingSet.length;

    var chartTitle = d3.select(".graph_wrapper")

    // clear our pagination
    d3.select(".pagination").html(null);

    var paginationButtons = d3.select(".pagination")
        .append("div")
        .attr('class', 'pagination')

    var lower = (slice[0] + 1) > count ? count : slice[0] + 1;
      //
    var upper = (slice[1] + 1) > count ? count : (slice[1] + 1);

    paginationButtons.append("p")
        .text(function() {
            return "Currently showing from " + ( lower ) + " to " + ( upper ) + " of a possible " + count + " results.";
        });

    var paginators = ["First", "Prev", "Next"]

    // build our pagination buttons
    paginationButtons.selectAll("div")
        .append('div')
        .attr('class', 'controls')
        .data(paginators)
        .enter()
        .append("span")
        .attr('class', function(c) {
            return c.toLowerCase()
        })
        .append('a')
        .attr('class', 'pure-button')
        .text(function(b) {
            return b;
        });

    // add check to mark buttons as disabled when pagination would take
    // the user past the last result, or before the first
    if (slice[1] > count){
      paginationButtons.selectAll("div .next a")
      .attr('class', function(c){
        return 'pure-button pure-button-disabled'
      });
    }
    if (slice[0] <= 1){
      paginationButtons.selectAll("div .prev a")
      .attr('class', function(c){
        return 'pure-button pure-button-disabled'
      });
    }

}


function preparePayload(pipelineData) {

    cleanedData = [];
    // for parsing the date strings
    var format = d3.time.format("%d/%m/%Y");

    pipelineData.forEach(function(dat) {
        // sample data
        // {
        //     "supplier": "PETER WALTON T/A AGELESS DRIVING",
        //     "end_date": "2015-03-31",
        //     "category": "Highways - road safety",
        //     "contract_value": "35000"
        // }

        // try making this work from now, instead of looking back at old contracts
        var date = new Date;

        cleanedData.push({
            "label": dat.supplier,
            "description": dat.category,
            "value": dat.contract_value,
            "end_date": dat.end_date,
            "times": [{
                "color": "#a9dd95",
                "starting_time": date.getTime(),
                "ending_time": new Date(dat.end_date).getTime()
            }]
        });

    });

    return cleanedData;
}


function updatePipelinePullQuotes(data) {

  var contractSum = d3.sum(data, function(d) { return d.contract_value })

  // set up formatter
  var fmt = d3.format(".3s");

  var contractsEnding = d3.select(".no-contracts-ending");
  contractsEnding.select(".pull_fig").remove();
  contractsEnding.append("div").attr("class", "pull_fig").html(data.length);

  var contractVal = d3.select(".contract-value");
  contractVal.select(".pull_fig").remove();
  contractVal.append("div").attr("class", "pull_fig").html("£" + fmt(contractSum));

}
function coercePayload(payload) {

  payload.forEach(function(d,i) {
    d.index = i;
    d.end_date = parseDate(d.end_date);
    // coerce string to number
    d.contract_value = +d.contract_value;
  });

  return payload;
}

function parseDate(date){
  formatter = d3.time.format("%Y-%m-%d");
  return formatter.parse(date)
}
window.parseDate = parseDate;

// used buy the dc.js charts when you have one dimension for two displays

function rangesEqual(range1, range2) {
  if (!range1 && !range2) {
      return true;
  }
  else if (!range1 || !range2) {
      return false;
  }
  else if (range1.length === 0 && range2.length === 0) {
      return true;
  }
  else if (range1[0].valueOf() === range2[0].valueOf() &&
      range1[1].valueOf() === range2[1].valueOf()) {
      return true;
  }
  return false;
}

function formatMoney(value) {
  var formatter = d3.format(",.2f");
  return "£" + formatter(value);;
}

function formatDate(date) {
  formatter = d3.time.format("%d %b %Y");
  return formatter(date);
}
