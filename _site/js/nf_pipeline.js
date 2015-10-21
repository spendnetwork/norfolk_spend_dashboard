var NFPipeline = (function() {

    var page = 1;
    // returns the relevant array slice for results
    var sliceForPage = function() {
        var lowerBound = (page * 10) - 10;
        var upperBound = (page * 10) - 1;
        return [lowerBound, upperBound];
    }

    return {

        // for storing the results of the JSON query
        payload: null,
        workingSet: null,
        dateRange: null,
        category: null,

        // public functions
        sliceForPage: sliceForPage,

        // sets the page number
        setPage: function(pageNo) {
            if (type(pageNo) === 'number') {
                page = pageNo;
            }
        },

        dateFilterOptions: function() {

            var fmt = d3.time.format("%Y-%m-%d");
            var dateFilters = [{
                "name": "this month",
                "date": {
                    "from": fmt(d3.time.month.offset(new Date(), 0)),
                    "to": fmt(d3.time.month.offset(new Date(), 1))
                }
            }, {
                "name": "in 1 to 6 months",
                "date": {
                    "from": fmt(d3.time.month.offset(new Date(), 1)),
                    "to": fmt(d3.time.month.offset(new Date(), 6))
                }
            }, {
                "name": "in 6 to 12 months",
                "date": {
                    "from": fmt(d3.time.month.offset(new Date(), 6)),
                    "to": fmt(d3.time.year.offset(new Date(), 1))
                }
            }, {
                "name": "12 to 24 months",
                "date": {
                    "from": fmt(d3.time.year.offset(new Date(), 1)),
                    "to": fmt(d3.time.year.offset(new Date(), 2))
                }
            }, {
                "name": "24 to 36 months",
                "date": {
                    "from": fmt(d3.time.year.offset(new Date(), 2)),
                    "to": fmt(d3.time.year.offset(new Date(), 3))
                }
            }, {
                "name": "in more than 36 months",
                "date": {
                    "from": fmt(d3.time.year.offset(new Date(), 3)),
                    "to": fmt(d3.time.year.offset(new Date(), 100))
                }
            }]
            return dateFilters;
        },

        decrementPage: function() {
            return page--;
        },

        incrementPage: function() {
            return page++;
        },

        resetPage: function() {
            console.log("page prior to reset: " + page);
            page = 1;
        },

        // returns a set of results based on the page number
        paginatedSlice: function(payload) {

            var slice = sliceForPage();
            var rows = NFPipeline.workingSet.slice(slice[0], slice[1]);
            return rows;
        },

        showPaginatedResults: function(rows) {
            cleanedData = preparePayload(rows);
            buildPagePipeline(cleanedData, NFPipeline);
            pipelineTable(cleanedData);
        },

        // takes a set of results, and returns a subset of results that
        // that match a given category
        filterByCategory: function(rows) {
            console.log(NFPipeline.category)
            if (NFPipeline.category) {

                filteredRows = rows.filter(function(row) {
                    return row.category === NFPipeline.category;
                });
                return filteredRows;
            } else {
                return rows;
            }
        },

        filterByDate: function(rows) {

            if (NFPipeline.dateRange) {
                var dateRange = NFPipeline.dateRange
                console.log(dateRange)
                // debugger
                // filter out contracts before our start date
                filteredRows = rows.filter(function(row) {
                    // debugger
                    return new Date(row.end_date) > new Date(dateRange[0]);
                });
                // debugger
                // filter out contracts after our end date
                filteredRows = filteredRows.filter(function(row) {
                    return new Date(row.end_date) < new Date(dateRange[1]);
                });


                return filteredRows;
            } else {
                return rows;
            }
            // NFPipeline.workingSet = filteredRows;
            // return filteredRows;
        },
        applyFilters: function() {
            rows = NFPipeline.payload
            console.log(rows.length)
            rows = NFPipeline.filterByCategory(rows);
            console.log("filtered by cat", rows.length)
            rows = NFPipeline.filterByDate(rows);
            console.log("filtered by date", rows.length)

            NFPipeline.workingSet = rows

            NFPipeline.resetPage();
        }


    };


})();
