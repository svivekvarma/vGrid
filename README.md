vGrid
===========

A jquery plugin to render table or grid view with sorting, pagination and theming.

Additional information about usage and options and demos can be found here 

<a href="http://svivekvarma.github.com/vGrid/"> Additional Info</a>

Usage
______

*Markup

´´´
  <div id="container1" class="container">

    </div>

´´´
*Configuration

´´´

    TEST1 = {
            "data": [],
            css: {
                table: "grid"
            },
            headerTemplate: [{
                fieldName: "Address1",
                template: function (field) {
                    return "Address";
                }
            }],
            fieldTemplate: [{
                fieldName: "ID",
                template: function (field) {
                    return '<a href=\'/studentdetails?studentid=' + field + '\'>' + field + '</a>'
                }
            }],
            hidefields: ["id"],
            keyfields: ["ID"],
            amalgateColumns: [{
                columnHeader: "",
                amalgations: ["Name", "Address1"],
                prepend: true,
                template: function (fields) {
                    var arrHTML = [];
                    arrHTML.push('<div>Date of Birth: ' + fields["dateofbirth"] + '</div>');
                    arrHTML.push('<div>Accounts:' + fields["accounts"] + '</div>');
                    return arrHTML.join('');
                }
            }],
            datetimefields: ["datecreated"],
            showPagination: true,
            paginationPageSize: 10,
            pageSize: 20,
	    };

´´´

* Initialize the plugin

´´´
   $(document).ready(function () {

            $.getJSON('data.json').done(function (data) {

                TEST1.data = data.fathers;
               
                $('#container1').tablerender('renderTable', TEST1);
                
            });


        });

´´´

