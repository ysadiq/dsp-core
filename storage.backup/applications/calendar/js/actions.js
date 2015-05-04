/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 11/28/12
 * Time: 3:09 PM
 * To change this template use File | Settings | File Templates.
 */
var actions = function(){
    $(document).ready(function () {
        var today = new Date();
        Actions.getEvents(today.getMonth(), today.getFullYear());
        prettyPrint();
    });
    // Render the Calendar
    this.renderCalendar =function (mm, yy) {


        // HTML renderers
        var _html = "";
        var cls = "";
        var msg = "";
        var id = "";

        // Create current date object
        var now = new Date();

        // Defaults
        if (arguments.length == 0) {
            mm = now.getMonth();
            yy = now.getFullYear();
        }

        // Create viewed date object
        var mon = new Date(yy, mm, 1);
        var yp = mon.getFullYear();
        var yn = mon.getFullYear();

        var prv = new Date(yp, mm - 1, 1);
        var nxt = new Date(yn, mm + 1, 1);

        var m = [
            "January"
            , "February"
            , "March"
            , "April"
            , "May"
            , "June"
            , "July"
            , "August"
            , "September"
            , "October"
            , "November"
            , "December"
        ];

        var d = [
            "Sunday"
            , "Monday"
            , "Tuesday"
            , "Wednesday"
            , "Thursday"
            , "Friday"
            , "Saturday"
        ];

        // Days in Month
        var n = [
            31
            , 28
            , 31
            , 30
            , 31
            , 30
            , 31
            , 31
            , 30
            , 31
            , 30
            , 31
        ];


        // Leap year
        var nyr = now.getYear();
        if ((nyr % 4 == 0 && nyr % 100 != 0) || nyr % 400 == 0) {
            n[1] = 29;
        }

        // Get some important days
        var fdom = mon.getDay(); // First day of month
        var mwks = 6 // Weeks in month

        // Render Month
        $('.year').html(mon.getFullYear());
        $('.month').html(m[mon.getMonth()]);

        // Clear view
        var h = $('#calendar > thead:last');
        var b = $('#calendar > tbody:last');

        h.empty();
        b.empty();

        // Render Days of Week
        for (var j = 0; j < d.length; j++) {
            _html += "<th>" + d[j] + "</th>";
        }
        _html = "<tr>" + _html + "</tr>";
        h.append(_html);

        // Render days
        var dow = 0;
        var first = 0;
        var last = 0;
        for (var i = 0; i >= last; i++) {

            _html = "";

            for (var j = 0; j < d.length; j++) {

                cls = "";
                msg = "";
                id = "";

                // Determine if we have reached the first of the month
                if (first >= n[mon.getMonth()]) {
                    dow = 0;
                } else if ((dow > 0 && first > 0) || (j == fdom)) {
                    dow++;
                    first++;
                }

                // Format Day of Week with leading zero
                dow = "0" + dow;

                // Get last day of month
                if (dow == n[mon.getMonth()]) {
                    last = n[mon.getMonth()];
                }


                // Check Event schedule
                $.each(Events.event, function () {
                    if (this.date == mon.getMonth() + 1 + "/" + dow.substr(-2) + "/" + mon.getFullYear()) {
                        cls += " holiday";
                        msg = msg + '<div style="margin-top:4px;" rel ="' + this.date + '" class="cal label ' + this.type + '" id = "' + this.id + '">' + this.title + '</div>';
                        rel = this.date;
                    }
                });


                // Set class
                //if (cls.length == 0) {
                if (
                    dow == now.getDate()
                        && now.getMonth() == mon.getMonth()
                        && now.getFullYear() == mon.getFullYear()
                    ) {
                    cls += " today";

                } else if (j == 0 || j == 6) {
                    cls += " weekend";
                } else {
                    cls += "";
                }
                //}

                // Set ID
                id = mon.getMonth() + 1 + "/" + dow.substr(-2) + "/" + mon.getFullYear();

                // Render HTML
                if (dow == 0) {
                    _html += '<td style="padding:0px;padding-top:10px;" class="well">&nbsp;</td>';
                } else if (msg.length > 0) {
                    _html += '<td style="padding:0px;padding-top:10px;" class="well ' + cls + '" rel="' + id + '">' + dow.substr(-2) + '<div>' + msg + '</div></td>';
                } else {
                    _html += '<td style="padding:0px;padding-top:10px;" class="well ' + cls + '" rel="' + id + '">' + dow.substr(-2) + '</td>';
                }

            }

            _html = "<tr>" + _html + "</tr>";
            b.append(_html);
        }

        $('#last').unbind('click').bind('click', function () {
            Actions.getEvents(prv.getMonth(), prv.getFullYear());
        });

        $('#current').unbind('click').bind('click', function () {
            Actions.getEvents(now.getMonth(), now.getFullYear());
        });

        $('#next').unbind('click').bind('click', function () {
            Actions.getEvents(nxt.getMonth(), nxt.getFullYear());
        });
        $('.calendar td').bind('click', function () {
            Actions.promptForNewDate($(this).attr('rel'));

        });
        $('.cal.label').bind('click', function (event) {
            event.stopPropagation();
            Actions.promptForEdit($(this).attr('id'));


        });


    },


    // Render Clock
    this.renderTime =function () {
        var now = new Date();

        var tt = "AM";
        var hh = now.getHours();
        var nn = "0" + now.getMinutes();

        if (now.getHours() > 12) {
            hh = now.getHours() - 12;
            tt = "PM";
        }

        $('.time').html(
            hh + ":" + nn.substr(-2) + " " + tt
        );

        var doit = function () {
            Actions.renderTime();
        }

        setTimeout(doit, 500);
    },
    this.promptForNewDate =function (date) {
        $('#form_title').val('').removeClass("required").attr("placeholder", "Enter a Title").focus();
        $("#modal").modal();
        $('#form_date').val(date);
        $('#form_desc').val('');
        //$('input:radio[name=color]').filter('[value="success"]').attr('checked', true);
        $('input:radio[name="color"]').removeAttr('checked');
        $('input:radio[name="color"]').filter('[value="success"]').attr('checked', true);


    },
    this.promptForEdit= function (id) {
        $.ajax({
            dataType:'json',
            url:location.protocol + '//' + location.host + '/rest/db/Events',
            data:'app_name=Calendar&filter=id=' + id,
            cache:false,
            success:function (response) {
                $('input:radio[name=color]:checked').val("success");
                var row = response.record[0];
                $('#form_title-edit').val(row.title).removeClass("required").attr("placeholder", "Enter a Title").focus();
                $('#form_date-edit').val(row.date);
                $('input:radio[name="form-color"]').filter('[value="' + row.type + '"]').attr('checked', true);
                $('#form_desc-edit').val(row.desc);
                $('#id-edit').val(id);
                $("#modal-edit").modal();
            },
            error:function (response) {
                alertErr(response);
            }

        });


    },
    this.promptForDelete=function (id, title) {
        $("#modal-delete").modal();
    },
    this.getEvents=function (month, year) {
        $.ajax({
            dataType:'json',
            url:location.protocol + '//' + location.host + '/rest/db/Events',
            data:'app_name=Calendar',
            cache:false,
            success:function (response) {

                Events = {"event":[]};
                $.each(response.record, function (index, val) {
                    Events.event[index] = val;
                });

                Actions.renderCalendar(month, year);

                Actions.renderTime();
            },
            error:function (response) {
                alertErr(response);
            }

        });

    },

    this.deleteEvent=function (id, date) {
        $.ajax({
            dataType:'json',
            type:"DELETE",
            url:location.protocol + '//' + location.host + '/rest/db/Events/' + id + '?app_name=Calendar',
            cache:false,
            processData:false,
            success:function () {
                var currentView = new Date(date);
                mm = currentView.getMonth();
                yy = currentView.getFullYear();

                $("#modal-edit").modal('toggle');
                Actions.getEvents(mm, yy);
            },
            error:function (response) {
                alertErr(response);
            }

        });

    },
    this.addEvent=function (title, date, type, desc, id) {
        if (!title) {
            $("#form_title").addClass('required').attr("placeholder", "this is a required field");
        } else {
            var currentView = new Date(date);
            mm = currentView.getMonth();
            yy = currentView.getFullYear();
            dd = currentView.getDate();

            /*if (Modernizr.inputtypes.date) {
                if (dd < 9) {
                    date = mm + 1 + "/0" + (dd + 1) + "/" + yy;
                } else {
                    date = mm + 1 + "/" + (dd + 1) + "/" + yy;
                }

            }*/
            if (id) {

                var newRec = {"record":[
                    {"id":id, "title":title, "date":date, "type":type, "desc":desc}
                ]};
                var method = "MERGE";
                var edit = true;
            } else {
                var method = "POST";
                var newRec = {"record":[
                    {"title":title, "date":date, "type":type, "desc":desc}
                ]};
            }
            $.ajax({
                dataType:'json',
                type:method,
                url:location.protocol + '//' + location.host + '/rest/db/Events?app_name=calendar',
                data:JSON.stringify(newRec),
                cache:false,
                processData:false,
                success:function (response) {
                    if (edit) {
                        $("#modal-edit").modal('toggle');
                    } else {
                        $("#modal").modal('toggle');
                    }


                    /*Events = {"event":[]};
                     $.each(response.record, function(index, val){
                     Events.event[index] = val;
                     });*/
                    Actions.getEvents(mm, yy);

                    //Actions.renderTime();
                },
                error:function (response) {
                    alertErr(response);
                }
            });
        }
    }




};


