/* ****************************************************************************
* MVCControlToolkit.Controls.Datetime-3.0.0.js
* Copyright (c) Francesco Abbruzzese. All rights reserved.
* francesco@dotnet-programming.com
* http://www.dotnet-programming.com/
* 
* This software is subject to the the license at http://mvccontrolstoolkit.codeplex.com/license  
* and included in the license.txt file of this distribution.
* 
* You must not remove this notice, or any other, from this software.
*
* ***************************************************************************/
(function ($) {
    var mvcct = window.mvcct;
    var millisecondsInDay = 1000 * 60 * 60 * 24;
    var JQueryMobileF = 'JQueryMobile';
    var JQueryUIF = 'JQueryUI';
    var BootstrapF = 'Bootstrap';
    function computeDefaultFramework() {
        var desk = jQuery.fn.datepicker;
        if (!desk) return jQuery.fn.datebox ? JQueryMobileF : 'none';
        return ($.datepicker && $.datepicker.parseDate) ? JQueryUIF : BootstrapF;
    }
    var defaultFramework = computeDefaultFramework();
    function DateInput_Prepare(name, _Curr, _MaxDate, _MinDate, _YearCombo, _DateHidden, _DateInCalendar,
        _ClientDateChanged, _ClientDynamicMin, _ClientDynamicMax, _Propagation) {
        var hidden = $('#' + name + '_Hidden');
        hidden.data('_Curr', _Curr)
        .data('_Curr', _Curr)
        .data('_MaxDate', _MaxDate)
        .data('_MinDate', _MinDate)
        .data('Recursive', false)
        .data('_Valid', true)
        .data('_YearCombo', _YearCombo)
        .data('_DateHidden', _DateHidden)
        .data('_DateInCalendar', _DateInCalendar)
        .data('_ClientDateChanged', _ClientDateChanged)
        .data('_ClientDynamicMin', _ClientDynamicMin)
        .data('_ClientDynamicMax', _ClientDynamicMax);

        $(document).ready(function () {
            _Propagation();
            DateInput_Initialize(name, hidden);
        });
    }
    function Calendar_Prepare(name, _InLine, _CalendarOptions, bootstrapFormat, dateboxFormat) {
        var calendar = $('#' + name + '_Calendar');
        calendar.data('bootstrapFormat', bootstrapFormat);
        calendar.data('dateboxFormat', dateboxFormat);
        if (!_InLine) {
            calendar.data('_CalendarText', null);
            calendar.focus(
                function () {
                    {
                        var tval = this.value;
                        calendar.data('_CalendarText', tval); ;

                    }
                }
             );
        }
        calendar.data('_InLine', _InLine);
        calendar.data('_CalendarOptions', _CalendarOptions);
    };
    function DateInput_Initialize(id, hidden) {
        if (document.getElementById(id + "_Year") != null) {
            document.getElementById(id + "_Year").onkeypress = DateInputYearKeyVerify;
            document.getElementById(id + "_Year").onpaste = DateInputYearHandlePaste;
            document.getElementById(id + "_Year").ondrop = DateInputYearHandlePaste;
            document.getElementById(id + "_Year").onchange = DateInputChanged;
        }
        if (document.getElementById(id + "_Month") != null)
            document.getElementById(id + "_Month").onchange = DateInputChanged;

        if (document.getElementById(id + "_Day") != null)
            document.getElementById(id + "_Day").onchange = DateInputChanged;

        if (document.getElementById(id + "_Hours") != null)
            document.getElementById(id + "_Hours").onchange = DateInputChanged;

        if (document.getElementById(id + "_Minutes") != null)
            document.getElementById(id + "_Minutes").onchange = DateInputChanged;

        if (document.getElementById(id + "_Seconds") != null)
            document.getElementById(id + "_Seconds").onchange = DateInputChanged;

        if (hidden.data('_DateInCalendar')) {
            var calendar = $('#' + id + '_Calendar');
            var dType = hidden.attr('data-date-framework');
            if (!dType) {
                dType = defaultFramework;
                hidden.attr('data-date-framework', dType);
            }
            if (dType == JQueryUIF) {
                var options = calendar.data('_CalendarOptions');
                calendar.datepicker(options);
            }
            else if (dType == BootstrapF) {
                calendar.attr('data-date-format', calendar.data('bootstrapFormat'));
                calendar.datepicker().on('changeDate', function (e) {
                    DateTimeInput_UpdateFromCalendar(e.date, id);
                });
            }
            else if (dType == JQueryMobileF) {
                var options = calendar.attr('data-options');
                if (options) { calendar.removeAttr('data-options'); options = $.parseJSON(options) }
                else options = {};
                if (!options.mode) options.mode = 'calbox';
                options.overrideDateFormat = calendar.data('dateboxFormat');
                options.closeCallback = function (date) { DateTimeInput_UpdateFromCalendar(date, id); };
                calendar.datebox(options);
            }


        }
        DateInputChanged(null, id, true, null, true);
        hidden.data('ready', true);

    }

    function DateInputGetNumDays(M, curYear) {
        M = M + 1;
        if (curYear % 4 == 0) {
            return (M == 9 || M == 4 || M == 6 || M == 11) ? 30 : (M == 2) ? 29 : 31;
        } else {
            return (M == 9 || M == 4 || M == 6 || M == 11) ? 30 : (M == 2) ? 28 : 31;
        }
    }

    function DateTimeAdjustYears(cmbInput, min, max) {
        if (cmbInput == null || cmbInput.tagName != 'SELECT') return;
        var j = 0;
        if (min == cmbInput.options[0].value && max == cmbInput.options[cmbInput.options.length - 1].value) return;
        var oldVar = cmbInput.value;
        cmbInput.options.length = 0;
        for (i = min; i <= max; i++) {
            if (i < 10)
                cmbInput.options[j] = new Option("   " + i, i);
            else if (i < 100)
                cmbInput.options[j] = new Option("  " + i, i);
            else if (i < 1000)
                cmbInput.options[j] = new Option(" " + i, i);
            else
                cmbInput.options[j] = new Option("" + i, i);
            j++;
        }
        MvcControlsToolKit_SetDateElement(cmbInput.id, oldVar);
    }

    function DateTimeAdjustMonthes(cmbInput, min, max) {
        if (cmbInput == null) return;
        var j = 0;
        if (min == cmbInput.options[0].value && max == cmbInput.options[cmbInput.options.length - 1].value) return;
        var oldVar = cmbInput.value;
        cmbInput.options.length = 0;
        for (i = min; i <= max; i++) {
            cmbInput.options[j] = new Option(DateTimeMonthes[i], i + 1);
            j++;
        }
        MvcControlsToolKit_SetDateElement(cmbInput.id, oldVar);
    }

    function DateTimeAdjustDays(cmbInput, min, max) {
        if (cmbInput == null) return;
        var j = 0;
        if (min == cmbInput.options[0].value && max == cmbInput.options[cmbInput.options.length - 1].value) return;
        var oldVar = cmbInput.value;
        cmbInput.options.length = 0;
        for (i = min; i <= max; i++) {
            if (i < 10)
                cmbInput.options[j] = new Option(" " + i, i);
            else
                cmbInput.options[j] = new Option("" + i, i);
            j++;
        }
        MvcControlsToolKit_SetDateElement(cmbInput.id, oldVar);
    }
    function DateTimeAdjustTimeElement(cmbInput, min, max) {
        if (cmbInput == null) return;
        var j = 0;
        if (min == cmbInput.options[0].value && max == cmbInput.options[cmbInput.options.length - 1].value) return;
        var oldVar = cmbInput.value;
        cmbInput.options.length = 0;
        var step = parseInt($(cmbInput).attr('data-countstep')) || 1;
        for (i = min; i <= max; i += step) {
            if (i < 10)
                cmbInput.options[j] = new Option("0" + i, i);
            else
                cmbInput.options[j] = new Option("" + i, i);
            j++;
        }
        MvcControlsToolKit_SetDateElement(cmbInput.id, oldVar);
    }

    function DateInputYearHandlePaste(evt) {

        evt = (evt) ? (evt) : ((window.event) ? (window.event) : null);
        if (evt == null) return true;

        var sorg = (evt.target) ? (evt.target) : ((event.srcElement) ? (event.srcElement) : null);
        if (sorg == null) return true;

        var val;
        if (evt.type == "paste")
            val = window.clipboardData.getData("Text");
        else if (evt.type == "drop")
            val = evt.dataTransfer.getData("Text");
        else
            return true;


        for (i = 0; i < val.length; i++) {
            keyCode = val.charCodeAt(i);

            if (keyCode == 13 || keyCode == 8)
                continue;

            if ((keyCode >= 48) && (keyCode <= 57))
                continue;
            else
                return false;

        }
        sorg.value = val;
        return false;
    }

    function DateInputYearKeyVerify(evt) {
        evt = (evt) ? (evt) : ((window.event) ? (window.event) : null);
        if (evt == null) return true;

        var sorg = (evt.target) ? (evt.target) : ((event.srcElement) ? (event.srcElement) : null);
        if (sorg == null) return true;

        var keyCode = ((evt.charCode || evt.initEvent) ? evt.charCode : ((evt.which) ? evt.which : evt.keyCode));


        if (keyCode == 0 || keyCode == 13 || keyCode == 8)
            return true;
        if ((keyCode >= 48) && (keyCode <= 57))
            return true;
        return false;
    }

    function DateTimeInput_UpdateCalendar(clientId) {
        Nanno = document.getElementById(clientId + "_Year").value;
        Nmese = document.getElementById(clientId + "_Month").value;
        Ngiorno = document.getElementById(clientId + "_Day").value;

        var newDate = new Date(Nanno, Nmese - 1, Ngiorno);
        var dateHost = $('#' + clientId + "_Calendar");
        var dType = $('#' + clientId + '_Hidden').attr('data-date-framework');
        if (dType == JQueryUIF) {
            var format = dateHost.datepicker("option", "dateFormat");
            if (format == null) format = 'mm/dd/yy';

            dateHost.datepicker("setDate", $.datepicker.formatDate(format, newDate));
        }
        else if (dType == BootstrapF) dateHost.datepicker('update', newDate);
        else if (dType == JQueryMobileF) {
            dateHost.datebox('setTheDate', newDate);
            dateHost.trigger('datebox', { 'method': 'doset' });
        }

    }

    function DateTimeInput_UpdateFromCalendar(stringDate, clientId) {
        var dateHost = $('#' + clientId + "_Calendar");

        if (stringDate == null) return;
        var date = null;

        var dType = $('#' + clientId + '_Hidden').attr('data-date-framework');
        if (dType == JQueryUIF) {

            var format = dateHost.datepicker("option", "dateFormat");
            if (format == null) format = 'mm/dd/yy';

            try {
                date = $.datepicker.parseDate(format, stringDate);
            }
            catch (e) {
                date = new Date();
            }

            var stringDateMin = dateHost.datepicker("option", "minDate");
            var stringDateMax = dateHost.datepicker("option", "maxDate");

            var dateMin = null;
            var dateMax = null;

            if (stringDateMin != null) dateMin = $.datepicker.parseDate(format, stringDateMin);
            if (stringDateMax != null) dateMax = $.datepicker.parseDate(format, stringDateMax);

            if (dateMin != null && date < dateMin) {
                date = dateMin;
            }
            if (dateMax != null && date > dateMax) {
                date = dateMax;
            }
        }
        else {
            date = stringDate;
        }

        document.getElementById(clientId + "_Year").value = date.getFullYear();
        document.getElementById(clientId + "_Month").value = date.getMonth() + 1;
        document.getElementById(clientId + "_Day").value = date.getDate();

        DateInputChanged(null, clientId, true);



    }

    function DateTimeInput_UpdateCalendarMinMax(clientId, minDate, maxDate) {
        if (minDate) minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0);
        if (maxDate) maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 0, 0, 0, 0);
        var dateHost = $('#' + clientId + "_Calendar");
        var dType = $('#' + clientId + '_Hidden').attr('data-date-framework');
        if (dType == JQueryUIF) {
            var format = dateHost.datepicker("option", "dateFormat");
            if (format == null) format = 'mm/dd/yy';

            if (minDate != null) {
                dateHost.datepicker("option", "minDate", $.datepicker.formatDate(format, minDate));
            }
            else {
                dateHost.datepicker("option", "minDate", null);
            }
            if (maxDate != null) {
                dateHost.datepicker("option", "maxDate", $.datepicker.formatDate(format, maxDate));
            }
            else {
                dateHost.datepicker("option", "maxDate", null);
            }
        }
        else if (dType == BootstrapF) {
            dateHost.datepicker('setStartDate', minDate);
            dateHost.datepicker('setEndDate', maxDate);
        }
        else if (dType == JQueryMobileF) {
            var rightnow = new Date()
            var today = new Date(rightnow.getFullYear(), rightnow.getMonth(), rightnow.getDate(), 0, 0, 0, 0).getTime();
            dateHost.datebox({
                'maxDays': maxDate ? parseInt((maxDate.getTime() - today) / millisecondsInDay, 10) : null,
                'minDays': minDate ? -parseInt((minDate.getTime() - today) / millisecondsInDay, 10) : null
            });
        }
    }

    function DateInputChanged(evt, cid, update, force, init) {

        var clientID;
        if (cid == null) {


            evt = (evt) ? (evt) : ((window.event) ? (window.event) : null);
            if (evt == null) {

                return false;
            }

            var sorg = (evt.target) ? (evt.target) : ((event.srcElement) ? (event.srcElement) : null);
            if (sorg == null) {

                return false;
            }
            clientID = sorg.id.substring(0, sorg.id.lastIndexOf("_"));
        }
        else {
            clientID = cid;
        }
        var jHidden = $('#' + clientID + '_Hidden');
        if (jHidden.data('Recursive') == true && !force) return;
        jHidden.data('Recursive', true)

        var Nanno;
        var Nmese;
        var Ngiorno;
        var NHours;
        var NMinutes;
        var NSeconds;
        var CurrDate = jHidden.data('_Curr');
        var CurrDay = CurrDate.getDate();
        var CurrMonth = CurrDate.getMonth();
        var CurrYear = CurrDate.getFullYear();
        var CurrHours = CurrDate.getHours();
        var CurrMinutes = CurrDate.getMinutes();
        var CurrSeconds = CurrDate.getSeconds();
        var currMin = jHidden.data('_MinDate') || null;
        var currMax = jHidden.data('_MaxDate') || null;

        var dynamicMin = jHidden.data('_ClientDynamicMin') || null;
        if (dynamicMin) dynamicMin = dynamicMin();
        var dynamicMax = jHidden.data('_ClientDynamicMax') || null;
        if (dynamicMax) dynamicMax = dynamicMax();


        if (dynamicMin != null && (currMin == null || dynamicMin > currMin)) {
            if (currMax != null && dynamicMin > currMax)
                currMin = currMax;
            else
                currMin = dynamicMin;
        }
        if (dynamicMax != null && (currMax == null || dynamicMax < currMax)) {
            if (currMin != null && dynamicMax < currMin)
                currMax = currMin;
            else
                currMax = dynamicMax;
        }
        var yearControl = document.getElementById(clientID + "_Year");
        var monthControl = document.getElementById(clientID + "_Month");
        var dayControl = document.getElementById(clientID + "_Day");
        var hourControl = document.getElementById(clientID + "_Hours");
        var minuteControl = document.getElementById(clientID + "_Minutes");
        var secondControl = document.getElementById(clientID + "_Seconds");

        if (yearControl) {
            Nanno = yearControl.value;
        }
        else {
            Nanno = CurrYear;
        }

        if (monthControl)
            Nmese = monthControl.value;
        else
            Nmese = CurrMonth;

        if (dayControl)
            Ngiorno = dayControl.value;
        else
            Ngiorno = CurrDay;

        if (hourControl != null)
            NHours = hourControl.value;
        else
            NHours = CurrHours;

        if (minuteControl)
            NMinutes = minuteControl.value;
        else
            NMinutes = CurrMinutes;

        if (secondControl)
            NSeconds = secondControl.value;
        else
            NSeconds = CurrSeconds;

        var TempNewDate = new Date(Nanno, Nmese - 1, Ngiorno, NHours, NMinutes, NSeconds);

        if (currMax != null && currMax < TempNewDate) TempNewDate = currMax;
        if (currMin != null && currMin > TempNewDate) TempNewDate = currMin;

        Nanno = TempNewDate.getFullYear() + "";
        Nmese = (TempNewDate.getMonth() + 1) + "";
        Ngiorno = TempNewDate.getDate() + "";
        NHours = TempNewDate.getHours() + "";
        NMinutes = TempNewDate.getMinutes() + "";
        NSeconds = TempNewDate.getSeconds() + "";

        var NewYear;
        var NewMonth;
        var NewDay;
        var NewHours;
        var NewMinutes;
        var NewSeconds;
        var MaxYear;
        var MinYear;
        var MaxMonth;
        var MinMonth;
        var MinDay;
        var MaxDay;
        var MinHours;
        var MaxHours;
        var MinMinutes;
        var MaxMinutes;
        var MinSeconds;
        var MaxSeconds;
        jHidden.data('_Valid', true);

        //year processing
        NewYear = parseInt(Nanno);
        if (!isNaN(NewYear)) {
            if (currMax == null) {
                MaxYear = null;
            }
            else {
                MaxYear = currMax.getFullYear();
            }
            if (currMin == null) {
                MinYear = null;
            }
            else {
                MinYear = currMin.getFullYear();
            }
            if (MaxYear != null && MaxYear < NewYear) NewYear = MaxYear;
            if (MinYear != null && MinYear > NewYear) NewYear = MinYear;
            if (yearControl && !jHidden.data('_DateHidden') && !jHidden.data('_DateInCalendar'))
                DateTimeAdjustYears(document.getElementById(clientID + "_Year"), MinYear, MaxYear);

            if ((MaxYear == null || MaxYear >= NewYear) && (MinYear == null || MinYear <= NewYear)) {

                //Month Processing
                MaxMonth = 11;
                MinMonth = 0;
                if (MaxYear == NewYear) {
                    MaxMonth = currMax.getMonth();
                }
                if (MinYear == NewYear) {
                    MinMonth = currMin.getMonth();
                }
                NewMonth = parseInt(Nmese);
                if (!isNaN(NewMonth)) {
                    NewMonth = NewMonth - 1;
                    if (MinMonth > NewMonth) {
                        NewMonth = MinMonth;
                    }
                    if (MaxMonth < NewMonth) {
                        NewMonth = MaxMonth;
                    }
                    if (init || CurrYear == MinYear || CurrYear == MaxYear || NewYear == MinYear || NewYear == MaxYear)
                        if (monthControl && !jHidden.data('_DateHidden') && !jHidden.data('_DateInCalendar'))
                            DateTimeAdjustMonthes(monthControl, MinMonth, MaxMonth);
                    //day processing
                    MinDay = 1;
                    MaxDay = DateInputGetNumDays(NewMonth, NewYear);
                    if (MaxYear == NewYear && MaxMonth == NewMonth) {
                        MaxDay = currMax.getDate();

                    }
                    if (MinYear == NewYear && MinMonth == NewMonth) {
                        MinDay = currMin.getDate();
                    }
                    NewDay = parseInt(Ngiorno);
                    if (!isNaN(NewDay)) {
                        if (MinDay > NewDay) {
                            NewDay = MinDay;
                        }
                        if (MaxDay < NewDay) {
                            NewDay = MaxDay;
                        }
                        if (dayControl && !jHidden.data('_DateHidden') && !jHidden.data('_DateInCalendar'))
                            DateTimeAdjustDays(dayControl, MinDay, MaxDay);
                        // Hours Processing
                        MinHours = 0;
                        MaxHours = 23;
                        if (MaxYear == NewYear && MaxMonth == NewMonth && NewDay == MaxDay) {
                            MaxHours = currMax.getHours();
                        }
                        if (MinYear == NewYear && MinMonth == NewMonth && NewDay == MinDay) {
                            MinHours = currMin.getHours();
                        }
                        NewHours = parseInt(NHours);
                        if (!isNaN(NewHours)) {
                            if (MaxHours < NewHours) NewHours = MaxHours;
                            if (NewHours < MinHours) NewHours = MinHours;
                            if (hourControl)
                                DateTimeAdjustTimeElement(hourControl, MinHours, MaxHours);
                            // Minutes Processing
                            MinMinutes = 0;
                            MaxMinutes = 59;
                            if (MaxYear == NewYear && MaxMonth == NewMonth && NewDay == MaxDay && MaxHours == NewHours)
                                MaxMinutes = currMax.getMinutes();
                            if (MinYear == NewYear && MinMonth == NewMonth && NewDay == MinDay && MinHours == NewHours)
                                MinMinutes = currMin.getMinutes();
                            NewMinutes = parseInt(NMinutes);
                            if (!isNaN(NewMinutes)) {
                                if (MaxMinutes < NewMinutes) NewMinutes = MaxMinutes;
                                if (MinMinutes > NewMinutes) NewMinutes = MinMinutes;
                                if (minuteControl)
                                    DateTimeAdjustTimeElement(minuteControl, MinMinutes, MaxMinutes);
                                // Seconds Processing
                                MinSeconds = 0;
                                MaxSeconds = 59;
                                if (MaxYear == NewYear && MaxMonth == NewMonth && NewDay == MaxDay && MaxHours == NewHours && MaxMinutes == NewMinutes)
                                    MaxSeconds = currMax.getSeconds();
                                if (MinYear == NewYear && MinMonth == NewMonth && NewDay == MinDay && MinHours == NewHours && MinMinutes == NewMinutes)
                                    MinSeconds = currMin.getSeconds();
                                NewSeconds = parseInt(NSeconds);
                                if (!isNaN(NewSeconds)) {
                                    if (MaxSeconds < NewSeconds) NewSeconds = MaxSeconds;
                                    if (NewSeconds < MinSeconds) NewSeconds = MinSeconds;
                                    if (secondControl)
                                        DateTimeAdjustTimeElement(secondControl, MinSeconds, MaxSeconds);
                                }
                                else {
                                    jHidden.data('_Valid', false);
                                }
                            }

                            else {
                                jHidden.data('_Valid', false);
                            }
                        }
                        else {
                            jHidden.data('_Valid', false);
                        }
                    }
                    else {
                        jHidden.data('_Valid', false);
                    }
                }
                else {
                    jHidden.data('_Valid', false);
                }
            }
        }
        else {
            jHidden.data('_Valid', false);
        }
        if (jHidden.data('_DateInCalendar')) {
            DateTimeInput_UpdateCalendarMinMax(
            clientID,
            currMin,
            currMax);
        }
        var AChange = false;
        if (jHidden.data('_Valid')) {
            if (update == true || (!cid &&
                (CurrYear != NewYear || CurrMonth != NewMonth || CurrDay != NewDay ||
                 CurrHours != NewHours || CurrMinutes != NewMinutes || CurrSeconds != NewSeconds)))
                AChange = true;
            CurrYear = NewYear;
            CurrMonth = NewMonth;
            CurrDay = NewDay;
            CurrHours = NewHours;
            CurrMinutes = NewMinutes;
            CurrSeconds = NewSeconds;
        }
        if (!AChange) {
            jHidden.data('Recursive', false);
            return true;
        }

        jHidden.data('_Curr', new Date(CurrYear, CurrMonth, CurrDay, CurrHours, CurrMinutes, CurrSeconds));
        if (yearControl) {
            MvcControlsToolKit_SetDateElement(clientID + "_Year", CurrYear);

        }
        if (monthControl) {
            MvcControlsToolKit_SetDateElement(clientID + "_Month", CurrMonth + 1);
        }
        if (dayControl) {
            MvcControlsToolKit_SetDateElement(clientID + "_Day", CurrDay);
        }
        if (jHidden.data('_DateInCalendar')) {
            DateTimeInput_UpdateCalendar(clientID);
        }
        if (hourControl) {
            MvcControlsToolKit_SetDateElement(clientID + "_Hours", CurrHours);
        }
        if (minuteControl) {
            MvcControlsToolKit_SetDateElement(clientID + "_Minutes", CurrMinutes);
        }
        if (secondControl) {
            MvcControlsToolKit_SetDateElement(clientID + "_Seconds", CurrSeconds);
        }

        var currDate = jHidden.data('_Curr');
        RefreshDependencies(clientID);
        jHidden.data('_ClientDateChanged')(currDate.getTime());
        jHidden.trigger("DateTimeInput_Changed");
        jHidden.data('Recursive', false);
        return true;
    }
    function MvcControlsToolKit_SetDateElement(id, value) {
        var element = document.getElementById(id);
        if (element.tagName == 'SELECT') {
            value = parseInt(value);
            for (var i = element.options.length - 1; i >= 0; i--) {
                if (parseInt(element.options[i].value) <= value) {
                    element.selectedIndex = i;
                    return;
                }
            }
            element.selectedIndex = 0;
        } else {
            if ((value === null) || (value === undefined))
                value = "";
            element.value = value;
        }
    }
    function SetDateInput(id, value, cType) {
        var dHidden = $('#' + id + '_Hidden');
        if (!dHidden.data('_Curr')) return;
        var currDate = dHidden.data('_Curr');

        if (currDate == null) return;
        var currDateInMilliseconds = currDate.getTime();

        if (cType == 1 && value >= currDateInMilliseconds) {
            return;
        }
        if (cType == 2 && value <= currDateInMilliseconds) {
            return;
        }
        var DateInFormat = new Date(value);
        var currMin = dHidden.data('_MinDate');
        var currMax = dHidden.data('_MaxDate')
        if (currMin != null && DateInFormat < currMin) DateInFormat = currMin;
        if (currMax != null && DateInFormat > currMax) DateInFormat = currMax;
        var hoursInput = document.getElementById(id + "_Hours");
        if (hoursInput) {
            var minutesInput = document.getElementById(id + "_Minutes");
            var secondsInput = document.getElementById(id + "_Seconds");
            if (document.getElementById(id + "_Year")) {
                MvcControlsToolKit_SetDateElement(id + "_Year", DateInFormat.getFullYear());
                DateInputChanged(null, id, false, true);
            }
            if (document.getElementById(id + "_Month")) {
                MvcControlsToolKit_SetDateElement(id + "_Month", DateInFormat.getMonth() + 1);
                DateInputChanged(null, id, false, true);
            }
            if (document.getElementById(id + "_Day")) {
                MvcControlsToolKit_SetDateElement(id + "_Day", DateInFormat.getDate());
                DateInputChanged(null, id, false, true);
            }
            if (hoursInput) {
                MvcControlsToolKit_SetDateElement(id + "_Hours", DateInFormat.getHours());
                DateInputChanged(null, id, !minutesInput, true);
            }
            if (minutesInput) {
                MvcControlsToolKit_SetDateElement(id + "_Minutes", DateInFormat.getMinutes());
                DateInputChanged(null, id, !secondsInput, true);
            }
            if (secondsInput) {
                MvcControlsToolKit_SetDateElement(id + "_Seconds", DateInFormat.getSeconds());
                DateInputChanged(null, id, true, true);
            }
        }
        else {
            if (document.getElementById(id + "_Year")) {
                MvcControlsToolKit_SetDateElement(id + "_Year", DateInFormat.getFullYear());
                DateInputChanged(null, id, false, true);
            }
            if (document.getElementById(id + "_Month")) {
                MvcControlsToolKit_SetDateElement(id + "_Month", DateInFormat.getMonth() + 1);
                DateInputChanged(null, id, false, true);
            }
            if (document.getElementById(id + "_Day")) {
                MvcControlsToolKit_SetDateElement(id + "_Day", DateInFormat.getDate());
                DateInputChanged(null, id, true, true);
            }
        }
        if (dHidden.data('_DateInCalendar')) {
            DateTimeInput_UpdateCalendar(id);
        }

    }

    function GetDateInput(id) {
        return $('#' + id + '_Hidden').data('_Curr');
    }

    var dateTimeInput = mvcct.widgets.DateTimeInput = {};
    dateTimeInput.setString = function (sorg, value) {
        clientID = sorg.id.substring(0, sorg.id.lastIndexOf("_"));
        var ob = null;
        if (value == null || value == "") {
            ob = new Date();
        }
        else {
            ob = mvcct.globalize.parse(value, MvcControlsToolkit_DataType_DateTime);
        }
        SetDateInput(clientID, ob.getTime(), 3);
    }

    dateTimeInput.set = function (sorg, value, format, valueType) {
        clientID = sorg.id.substring(0, sorg.id.lastIndexOf("_"));
        if ($('#' + sorg.id).length == 0 || (!$('#' + clientID + '_Hidden').data('_Curr')) || (!($('#' + clientID + '_Hidden').data('ready') || false))) {
            var retry = function () { dateTimeInput.set(sorg, value, format, valueType); };
            setTimeout(retry, 0);
            return;
        }
        if (value == null || value == "") value = new Date();
        SetDateInput(clientID, value.getTime(), 3);
    }
    dateTimeInput.setById = function (id, value, format, valueType) {
        if (value == null || value == "") value = new Date();
        SetDateInput(id + '__', value.getTime(), 3);
    }
    dateTimeInput.get = function (sorg, valueType) {
        clientID = sorg.id.substring(0, sorg.id.lastIndexOf("_"));
        if (!$('#' + clientID + '_Hidden').data('_Curr')) return null;
        if (!($('#' + clientID + '_Hidden').data('ready') || false)) return null;
        return $('#' + clientID + '_Hidden').data('_Curr');
    }
    dateTimeInput.getById = function (id, valueType) {
        return $('#' + id + '___Hidden').data('_Curr');
    }
    dateTimeInput.bindChange = function (id, handler) {
        $("#" + id + "___Hidden").bind("DateTimeInput_Changed", handler);
    }
    dateTimeInput.unbindChange = function (id, handler) {
        $("#" + id + "___Hidden").unbind("DateTimeInput_Changed", handler);
    }
    dateTimeInput.getString = function (sorg) {
        clientID = sorg.id.substring(0, sorg.id.lastIndexOf("_"));
        return mvcct.globalize.format(GetDateInput(clientID), 's', MvcControlsToolkit_DataType_DateTime, '', '');
    }

    function AddToUpdateList(id, toAdd) {
        if (id == null || toAdd == null) return;
        var updateLisT = $('#' + id + '_Hidden').data('_UpdateList');
        if (!updateLisT) {
            updateLisT = [];
            $('#' + id + '_Hidden').data('_UpdateList', updateLisT);
        }
        updateLisT.push(toAdd);
    }

    function RefreshDependencies(id) {
        var updateLisT = $('#' + id + '_Hidden').data('_UpdateList');
        if (!updateLisT || updateLisT.length == 0) return;
        for (var i = 0; i < updateLisT.length; i++) {
            DateInputChanged(null, updateLisT[i], true);
        }
    }
    mvcct = window['mvcct'] || {};
    mvcct.basicControls = mvcct.basicControls || {};
    mvcct.basicControls.dateInputInitialize = DateInput_Prepare;
    mvcct.basicControls.calendarInitialize = Calendar_Prepare;
    mvcct.basicControls.dateTimeInputUpdateFromCalendar = DateTimeInput_UpdateFromCalendar;
    mvcct.basicControls.setDateInput = SetDateInput;
    mvcct.basicControls.addToUpdateList = AddToUpdateList;
})(jQuery);