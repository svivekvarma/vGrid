/*
==================================================================================================
Author : Vivek Siruvuri

Plugin Name : tableRender

License : Creative Commons Attribution 3.0 Unported License

GitHub Repository: https://github.com/svivekvarma/tablerender

Contact Url : https://github.com/svivekvarma
==================================================================================================
*/
(function($) {
    var defaults = {
        data: [],
        emptyDataMessage: "No data available to show",
        css: {
            table: "table",
            tablestyle: "max-width:1010px",
            tdstyle: "max-width:40%",
            tdclass: "",
            trstyle: "",
            trclass: ""
        },
        headerTemplate: [],
        fieldTemplate: [],
        hidefields: [],
        showOnlyMode: false,
        showOnlyFields: [],
        keyfields: [],
        amalgateColumns: [],
        datefields: [],
        datetimefields: [],
        actions: ["update", "delete", "add"],
        rowEvents: function() {},
        showPagination: true,
        paginationPageSize: 5,
        pageSize: 5,
        showSearchField: true,
        dataconfiguration: {}
    };
    var settings = {};

    var tablerender = {
        _searchText: function(searchtext) {
            var $this = $(this);
            var config = $this.data('tablerender');
            if (searchtext === '' || searchtext === "") {

                config.settings.data = config.settings.originaldata;
            } else {
                var filtereddata = [];
                for (var i = 0; i < config.settings.originaldata.length; i++) {
                    for (var property in config.settings.originaldata[i]) {
                        var tobebroken = false;
                        if (config.settings.originaldata[i].hasOwnProperty(property)) {

                            if (config.settings.originaldata[i][property] != null && config.settings.originaldata[i][property] != '' && config.settings.originaldata[i][property] != undefined) {
                                if (config.settings.originaldata[i][property].toString().toLowerCase().indexOf(searchtext.toLowerCase()) >= 0) {
                                    filtereddata.push(config.settings.originaldata[i]);
                                    tobebroken = true;
                                }
                            }
                            if (tobebroken)
                                break;
                        }
                    }
                }

                config.settings.data = filtereddata;
            }
            $this.data('tablerender', config);
            tablerender.renderPagination.apply($this);
            tablerender.renderRows.apply($this);

        },
        _renderTable: function(data) {

            var $this = $(this);
            // Extract headers to be displayed
            
            var headers = tablerender.extractHeaders.apply($this);
            data.settings.headers = tablerender.extractHeaders.apply($this);

            //calculate the pagination and render it
            if (data.settings.headers.length > 0) {
                if (data.settings.showPagination) {
                    tablerender.renderPagination.apply($this);
                }
            }

            data = $this.data('tablerender');
            
            data.settings.headers = headers;
            //console.log(data);
            //console.log(settings);


            var arrHTML = [];
            arrHTML.push('<div class="searchsection"><label>Search </label><input type="search" class="searchtextfield" placeholder="Filter your results by typing search text"/></div>');
            arrHTML.push('<div class="clearboth"></div>');

            arrHTML.push('<table class=\'' + data.settings.css.table + '\'>');
            arrHTML.push(' <thead>');
            if ((data.settings.headers.length > 0 || data.settings.amalgateColumns.length > 0) && data.settings.data.length > 0) {

                if (data.settings.amalgateColumns.length > 0) {
                    for (var i = 0; i < data.settings.amalgateColumns.length; i++) {
                        if (data.settings.amalgateColumns[i].prepend) {
                            arrHTML.push(' <th data-realname="amalgated">');
                            arrHTML.push(data.settings.amalgateColumns[i].columnHeader);
                            arrHTML.push('</th>');
                        }
                    }
                }

                if (data.settings.headers.length > 0) {
                    for (var i = 0; i < data.settings.headers.length; i++) {
                        arrHTML.push(' <th data-realname="' + data.settings.headers[i] + '">');
                        arrHTML.push(tablerender.headerOutput.apply($this, [data.settings.headers[i]]));
                        arrHTML.push('<span class=\'asc\'>▲</span>');
                        arrHTML.push('<span class=\'desc\'>▼</span>');
                        arrHTML.push('</th>');
                    }
                }

                if (data.settings.amalgateColumns.length > 0) {
                    for (var i = 0; i < data.settings.amalgateColumns.length; i++) {
                        if (!data.settings.amalgateColumns[i].prepend) {
                            arrHTML.push(' <th data-realname="amalgated">');
                            arrHTML.push(data.settings.amalgateColumns[i].columnHeader);
                            arrHTML.push('</th>');
                        }
                    }
                }


            } else {
                arrHTML.push(' <th>');
                arrHTML.push(data.settings.emptyDataMessage);
                arrHTML.push('</th>');
            }

            arrHTML.push(' </thead>');
            arrHTML.push(' <tbody>');
            arrHTML.push(' </tbody>');
            arrHTML.push('</table>');
            $this.append(arrHTML.join(''));

            // Start generating the rows

            tablerender.renderRows.apply($this);
            $this.data('tablerender', data);
            tablerender._bind.apply($this);
        },
        _bind: function() {

            //Create binding for click event on header
            var $this = $(this);
            $(" th", this)
                .on('click.tablerender', function() {
                    //console.log('Click event beign called on header');
                    var data = $this.data('tablerender');
                    if (!($(this)
                            .attr('data-realname') === "amalgated")) {
                        data.settings.sortField = $(this)
                            .attr('data-realname');
                        $(' .tablerenderpagination > ul > li', $this)
                            .removeClass('active');
                        data.settings.dataconfiguration.currentBlock = 1;
                        data.settings.dataconfiguration.currentPage = 1;
                        $this.data('tablerender', data);

                        tablerender.renderPagination.apply($this);
                        tablerender.sort.apply($this);
                    }
                });

            // Bind Search events 

            $(" .searchtextfield", this)
                .on('keyup.tablerender', function() {
                    //console.log('Click event beign called on header');
                    var data = $this.data('tablerender');
                    data.settings.dataconfiguration.currentBlock = 1;
                    data.settings.dataconfiguration.currentPage = 1;
                    $this.data('tablerender', data);

                    tablerender._searchText.apply($this, [$(this).val()]);
                });

            // Bind pagination events

            $this.on('click.tablerender .tablerenderpagination', function() {
                var $target = $(event.target);
                $target = $target.is('li') ? $target : $target.closest('li').first();
                if ($target.hasClass('paginationpage')) {
                    var pagenum = $(' a', $target)
                        .text();
                    var data = $this.data('tablerender');
                    $(' .tablerenderpagination > ul > li', $this)
                        .removeClass('active');


                    if (!(pagenum === "<<" || pagenum === ">>")) {
                        data.settings.dataconfiguration.currentPage = parseInt($(' a', $target)
                            .text(), 10);
                        $this.data('tablerender', data);
                        $target.addClass('active');
                    } else if (pagenum === ">>") {
                        if (!(data.settings.dataconfiguration.currentBlock + 1 > data.settings.dataconfiguration.totalBlocks)) {
                            data.settings.dataconfiguration.currentBlock = data.settings.dataconfiguration.currentBlock + 1;
                            data.settings.dataconfiguration.currentPage = data.settings.dataconfiguration.currentBlock * data.settings.paginationPageSize - data.settings.paginationPageSize + 1;
                            $this.data('tablerender', data);

                            tablerender.renderPagination.apply($this);

                        } else {
                            return;
                        }
                    } else if (pagenum === "<<") {
                        if (!(data.settings.dataconfiguration.currentBlock - 1 <= 0)) {
                            data.settings.dataconfiguration.currentBlock = data.settings.dataconfiguration.currentBlock - 1;
                            data.settings.dataconfiguration.currentPage = data.settings.dataconfiguration.currentBlock * data.settings.paginationPageSize - data.settings.paginationPageSize + 1;
                            $this.data('tablerender', data);

                            tablerender.renderPagination.apply($this);

                        } else {
                            return;
                        }
                    }
                    tablerender.renderRows.apply($this);
                }
            });
        },
        customSort: function(property, type) {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1, property.length - 1);
            }
            if (type) {
                if (type === "string") {
                    return function(a, b) {
                        var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
                        return result * sortOrder;
                    }
                } else {
                    return function(a, b) {
                        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                        return result * sortOrder;
                    }
                }
            } else {
                return function(a, b) {
                    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                    return result * sortOrder;
                }
            }
        },
        extractHeaders: function() {
            var $this = $(this),
                data = $this.data('tablerender');
            var headers = [];
            //console.log(data.settings.dataconfiguration);
            if (data.settings.data.length > 0) {
                var obj = data.settings.data[0];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
                        if (data.settings.showOnlyMode) {
                            var result = $.grep(data.settings.showOnlyFields, function(a) {
                                return a.toLowerCase() === key.toLowerCase()
                            });
                            if (result.length > 0) {
                                headers.push(key);
                            }
                        } else {
                            var result = $.grep(data.settings.hidefields, function(a) {
                                return a.toLowerCase() === key.toLowerCase()
                            });
                            if (result.length === 0) {
                                headers.push(key);
                            }
                        }
                    }
                }
            }
            return headers;
        },
        renderPagination: function() {
            var $this = $(this),
                data = $this.data('tablerender');

            if (data.settings.showPagination) {
                    
                var arrPagination = [];
                
                if(data.settings.data.length <= 0){                  
                    $(' .tablerenderpagination > ul', $this)
                    .html('');
                    return;
                }
                if (!data.settings.dataconfiguration.renderedPagination) {
                    arrPagination.push('<div class=tablerenderpagination>');
                    arrPagination.push('<ul>');
                    arrPagination.push('</ul>');
                    arrPagination.push('</div>');
                    $this.append(arrPagination.join(''));
                    arrPagination = [];

                    var totalpages = 1;
                    if (data.settings.data.length >= data.settings.pageSize) {
                        totalpages = data.settings.data.length / data.settings.pageSize;
                    }
                    var totalblocks = 1;
                    if (totalpages > data.settings.paginationPageSize) {
                        totalblocks = totalpages / data.settings.paginationPageSize;
                    }
                    data.settings.dataconfiguration.totalPages = Math.ceil(totalpages);
                    data.settings.dataconfiguration.totalBlocks = Math.ceil(totalblocks);
                    data.settings.dataconfiguration.currentPage = 1;
                    data.settings.dataconfiguration.currentBlock = 1;
                }

                //tablerender._unbindPaginationEvents.apply($this);

                // render the page number based on block logic
                var startpage;
                var endpage;

                if (data.settings.dataconfiguration.totalPages - data.settings.dataconfiguration.currentPage >= data.settings.paginationPageSize) {
                    startpage = data.settings.dataconfiguration.currentPage;
                    endpage = data.settings.dataconfiguration.currentPage + (data.settings.paginationPageSize - 1);
                } else {
                    startpage = data.settings.dataconfiguration.currentPage;
                    //if(data.settings.dataconfiguration.totalPages - data.settings.dataconfiguration.currentPage === 0) 
                    //endpage = data.settings.dataconfiguration.totalPages - data.settings.dataconfiguration.currentPage;
                    endpage = data.settings.dataconfiguration.totalPages;
                    if (endpage === 0) {
                        endpage = startpage;
                    }
                }
                arrPagination.push('<li class="paginationpage"><a>' + "<<" + '</a></li>');
                for (var i = startpage; i <= endpage; i++) {
                    if (i == startpage) {
                        arrPagination.push('<li class="paginationpage active"><a>' + i + '</a></li>');
                    } else {
                        arrPagination.push('<li class="paginationpage"><a>' + i + '</a></li>');
                    }
                }
                arrPagination.push('<li class="paginationpage"><a>' + ">>" + '</a></li>');
                $(' .tablerenderpagination > ul', $this)
                    .html(arrPagination.join(''));


                data.settings.dataconfiguration.renderedPagination = true;
                //tablerender._bindPaginationEvents.apply($this);
                $this.data('tablerender', data);


            }
        },
        sort: function() {
            var $this = $(this),
                data = $this.data('tablerender');
            // If the plugin hasn't been initialized yet
            if (!data) {
                //Do more setup stuff here
                return this;
            }

            //console.log($(' th[data-realname=' + settings.sortField + ']', $this).attr('data-sortasc'));
            //console.log(settings.sortField);
            //console.log($(' th[data-realname=' + settings.sortField + ']', $this));

            var currentSort = $(' th[data-realname=' + data.settings.sortField + ']', $this)
                .attr('data-sortasc');
            $(' th', $this)
                .removeAttr('data-sortasc');

            if (currentSort) {
                if (currentSort == "true") {
                    currentSort = "false";
                } else {
                    currentSort = "true";
                }
            } else {
                currentSort = "true";
            }
            var sortstring = currentSort == "true" ? "" : "-";
            data.settings.data = data.settings.data.sort(tablerender.customSort(sortstring + data.settings.sortField));
            $(' th[data-realname=' + data.settings.sortField + ']', $this)
                .attr('data-sortasc', currentSort.toString());
            $this.data('tablerender', data);
            tablerender.renderRows.apply($this);
        },
        renderRows: function() {
            var $this = $(this),
                data = $this.data('tablerender');
            // If the plugin hasn't been initialized yet
            if (!data) {
                return this;
            }
            // Start generating the rows

            $this.children('.' + data.settings.css.table + ':first')
                .children('tbody:first')
                .html('');
            arrHTML = [];

            // Pagination info is used to calculate which records to show
            var startrecord = 0,
                endrecord = 0;
            if (data.settings.showPagination) {

                var currentpage = data.settings.dataconfiguration.currentPage,
                    currentpagesize = data.settings.pageSize;

                startrecord = (currentpage) * currentpagesize - currentpagesize;
                if (startrecord < 0) {
                    startrecord = 0;
                }

                if (startrecord + currentpagesize > data.settings.data.length) {
                    endrecord = data.settings.data.length - 1;
                } else {
                    endrecord = startrecord + currentpagesize - 1;
                }
            } else {
                startrecord = 0;
                endrecord = data.settings.data.length - 1;
            }
            if (startrecord === 0 && endrecord <= 0) {
               var headers = data.settings.headers;
                
                arrHTML = [];
                arrHTML.push(' <tr>');
                arrHTML.push(' <td colspan="' +headers.length + data.settings.amalgateColumns.length + '" class="norecords">No records found for the search criteria</td>');
                arrHTML.push(' </tr>');
                $this.children('.' + data.settings.css.table + ':first')
                    .children('tbody:first')
                    .append(arrHTML.join(''));
            }

            for (var i = startrecord; i <= endrecord; i++) {
                arrHTML = [];
                arrHTML.push(' <tr>');
                if (data.settings.amalgateColumns.length > 0) {
                    for (var am = 0; am < data.settings.amalgateColumns.length; am++) {
                        if (data.settings.amalgateColumns[am].prepend) {
                            if (data.settings.amalgateColumns[am].hasOwnProperty('style')) {
                                arrHTML.push('<td style="' + data.settings.amalgateColumns[am].style + '">');
                            } else {
                                arrHTML.push('<td>');
                            }

                            arrHTML.push(data.settings.amalgateColumns[am].template(data.settings.data[i], i));
                            arrHTML.push('</td>');
                        }
                    }
                }

                for (var j = 0; j < data.settings.headers.length; j++) {
                    arrHTML.push(' <td>');
                    arrHTML.push(tablerender.fieldOutput.apply($this, [data.settings.data[i][data.settings.headers[j]], data.settings.headers[j], data.settings.data[i]]));
                    arrHTML.push(' </td>');
                }
                if (data.settings.amalgateColumns.length > 0) {
                    for (var am = 0; am < data.settings.amalgateColumns.length; am++) {
                        if (!data.settings.amalgateColumns[am].prepend) {
                            if (data.settings.amalgateColumns[am].hasOwnProperty('style')) {
                                arrHTML.push('<td style="' + data.settings.amalgateColumns[am].style + '">');
                            } else {
                                arrHTML.push('<td>');
                            }

                            arrHTML.push(data.settings.amalgateColumns[am].template(data.settings.data[i], i));
                            arrHTML.push('</td>');
                        }
                    }
                }
                arrHTML.push(' </tr>');
                $this.children('.' + data.settings.css.table + ':first')
                    .children('tbody:first')
                    .append(arrHTML.join(''));
            }
            data.settings.rowEvents();
        },
        headerOutput: function() {
            var $this = $(this),
                data = $this.data('tablerender');
            //console.log('this is the arg i got' + arguments[0].toLowerCase())
            var field = arguments[0];
            if (data.settings.headerTemplate.length > 0) {
                for (var i = 0; i < data.settings.headerTemplate.length; i++) {
                    if (data.settings.headerTemplate[i].fieldName.toLowerCase() === field.toLowerCase()) {
                        return data.settings.headerTemplate[i].template(field);
                    }
                }
            }
            return field;
        },
        fieldOutput: function() {
            var $this = $(this),
                data = $this.data('tablerender');
            var record = arguments[2];
            var fieldName = arguments[1];
            var field = arguments[0];
            if (data.settings.fieldTemplate.length > 0) {
                for (var i = 0; i < data.settings.fieldTemplate.length; i++) {
                    if (data.settings.fieldTemplate[i].fieldName.toLowerCase() === fieldName.toLowerCase()) {
                        return data.settings.fieldTemplate[i].template(field, record);
                    }
                }
            }

            if (data.settings.datetimefields.length > 0) {
                for (var i = 0; i < data.settings.datetimefields.length; i++) {
                    if (data.settings.datetimefields[i].toLowerCase() === fieldName.toLowerCase()) {
                        if (!(field === null || field === undefined || field === '')) {
                            var date = new Date(parseInt(field.substr(6)));
                            return date.toLocaleString();
                        } else {
                            return '';
                        }

                    }
                }
            }

            if (data.settings.datefields.length > 0) {
                for (var i = 0; i < data.settings.datefields.length; i++) {
                    if (data.settings.datefields[i].toLowerCase() === fieldName.toLowerCase()) {
                        if (!(field === null || field === undefined || field === '')) {
                            var date = new Date(parseInt(field.substr(6)));
                            return date.toLocaleDateString();
                        } else {
                            return '';
                        }

                    }
                }
            }


            return field;
        }
    }


    var methods = {
        refresh: function() {
            return this.each(function() {
                // If the plugin hasn't been initialized yet

                var $this = $(this),
                    data = $this.data('tablerender');
                if (!data) {
                    //Do more setup stuff here
                    $this.data('tablerender', {
                        initialized: true,
                        settings: settings
                    });
                }
                methods.renderTable.apply(this);
            });
        },
        renderTable: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('tablerender');
                // If the plugin hasn't been initialized yet
                if (!data) {
                    //Do more setup stuff here
                    $this.data('tablerender', {
                        initialized: true,
                        settings: settings
                    });
                    data = $this.data('tablerender');
                } else {
                    data.settings = $.extend({}, data.settings, settings);

                    data.settings.dataconfiguration.renderedPagination = false;
                }
                data.settings.originaldata = data.settings.data;
                
                //Clear the elements html to get a clean canvas
                $this.html('');
                $this.css({
                    "text-align": "center"
                });
                $this.data('tablerender', data);

                tablerender._renderTable.apply($this, [data]);
            });
        }
    };
    $.fn.tablerender = function(method, options) {
        //defaults.dataconfiguration = {};
        settings = $.extend(true, {}, defaults, options);
        //console.log(defaults);
        //console.log(settings);
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tablerender');
        }

    };
})(jQuery);