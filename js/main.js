$(document).ready(function() {

    update_r1b1(null);
    update_r1b1_PullQuotes(null);
    update_r2b1(null);
    update_r2b2(null);
    update_r2b3(null);
    update_r4b1(null);
    update_r4b2(null);

    // add the relevant listeners to the page
    function addYearSwitcher(selector, graphs, funcs) {
        $(selector + ' .year-chooser button').on('click', function(e) {

            $(selector + ' .year-chooser button')
                .removeClass('active')
                .removeClass('pure-button-active');

            $(this).addClass('active')
                .addClass('pure-button-active');

            var year = $(this).text();

            // clear our year for the null case
            if (year === "All") {
                year = null;
            }
            // console.log("graphs", graphs);
            for (var i = 0; i < graphs.length; i++) {
                // console.log(graphs[i] + ' .graph_wrapper');
                $(graphs[i] + ' .graph_wrapper').empty();

            }

            // convert year to financial year
            console.log(convertYearToFinancialYear(year));
            // new_year = convertYearToFinancialYear(year);
            for (var i = 0; i < funcs.length; i++) {
                // console.log("year", year);
                // console.log("funcs[i].name", funcs[i].name);

                // we call the function we pass in, so it's called like
                // buildRingSpendChart(year)
                // debugger
                funcs[i].call(undefined, year);
            }
        });
    }

    function convertYearToFinancialYear(year) {
      console.debug("converting ", year, ":");
      switch (parseInt(year)) {
        case 2011:
           //console.debug("214");
          return "FY 2011/12";
        case 2012:
          return "FY 2012/13";
        case 2013:
          return "FY 2013/14";
        case 2014:
          return "FY 2013/14";
        default:
          // console.debug("nothing matched!");
          return null;
      }
    }

    function refreshPipelineView(){
      updatePipelinePullQuotes(NFPipeline.workingSet);
      cleanedData = preparePayload(NFPipeline.workingSet);
      just10contracts = cleanedData.slice(0,9)
      buildPipeline(just10contracts);
    }

    addYearSwitcher('.r1b1', ['#r1b1'], [update_r1b1, update_r1b1_PullQuotes]);
    addYearSwitcher('.r2b1', ['#r2b1'], [update_r2b1]);
    addYearSwitcher('.r2b2', ['#r2b2'], [update_r2b2]);
    addYearSwitcher('.r2b3', ['#r2b3'], [update_r2b3]);
    addYearSwitcher('.r4b1', ['#r4b1'], [update_r4b1]);
    addYearSwitcher('.r4b2', ['#r4b2'], [update_r4b2]);

});
