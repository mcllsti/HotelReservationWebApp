/* ****************************************************************************
* MVCControlToolkit.Controls.Core-3.0.0.js
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
    var mvcct = window['mvcct'] = window['mvcct'] || {};
    mvcct.basicControls = mvcct.basicControls || {};
    mvcct.events = {};
    var textf = mvcct.text = {};
    var globalizef = mvcct.globalize = {};
    var unobtrusivef = mvcct.unobtrusive = {};
    var pstatus = mvcct.pageStatus = mvcct.pageStatus || {};
    var basic = mvcct.basicControls = mvcct.basicControls || {};
    mvcct.html = mvcct["html"] || {};
    var widgets = mvcct.widgets = {};
    var manipulationButton = mvcct.widgets.manipulationButton = {};
    var dualselect = mvcct.widgets.DualSelect = {};
    mvcct.basicControls.replace = function (container, val) {
        var oldVar = mvcct.pageStatus[container];
        if (oldVar && oldVar.remove) oldVar.remove();
        mvcct.pageStatus[container] = val;
    };
    //utilities
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
    function MvcControlsToolkit_Trim(stringToTrim) {
        return stringToTrim.replace(/^\s+|\s+$/g, "");
    }
    function MvcControlsToolkit_DateTimeToDate(date) {
        if (!date) return date;
        if (date.getTime() > new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 59, 59, 999).getTime()) date.setDate(date.getDate() + 1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    
    function GlobalEvalScriptAndDestroy(element) {
        var allScriptText = CollectScriptAndDestroy(element);
        jQuery.globalEval(allScriptText);

    }
    function CollectScriptAndDestroy(element) {
        var allScriptText = "";
        if (element.tagName == "SCRIPT") {
            allScriptText = element.text;
            $(element).remove();
        }
        else {
            var scripts = $(element).find("script");
            for (var i = 0; i < scripts.length; i++) {
                allScriptText += scripts[i].text;
            }
            scripts.remove();
        }
        return allScriptText;

    }

    

    function CollectAllScriptsInelement(id) {
        var scripts = $("#" + id).find("script");
        var allScriptText = "";
        for (var i = 0; i < scripts.length; i++) {
            allScriptText += scripts[i].text;
        }
        return allScriptText;
    }
    ///////////////////Json serialization/////////////////////////////
    (function ($) {

        // JSON RegExp
        var rvalidchars = /^[\],:{}\s]*$/;
        var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
        var dateISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(Z|(?:[-+]\d+)?)/i;
        var dateNet = /\/Date\((\d+)(?:[-+]\d+)?\)\//i;

        // replacer RegExp
        var replaceISO = /"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:[.,](\d+))?(Z|(?:[-+]\d+)?)"/i;
        var replaceNet = /"\\\/Date\((\d+)(?:[-+]\d+)?\)\\\/"/i;

        // determine JSON native support
        var nativeJSON = (window.JSON && window.JSON.parse) ? true : false;
        var extendedJSON = nativeJSON && window.JSON.parse('{"x":9}', function (k, v) { return "Y"; }) === "Y";

        var jsonDateConverter = function (key, value) {
            if (typeof (value) === "string") {
                if (dateISO.test(value)) {
                    var res = new Date(value);
                    if (isNaN(res)) {
                        if (value.charAt(value.length - 1) == 'Z')
                            return new Date(value.substring(0, value.length - 1));
                        else
                            return new Date(value + 'Z');
                    }
                    else return res;
                }
                if (dateNet.test(value)) {
                    return new Date(parseInt(dateNet.exec(value)[1], 10));
                }
            }
            return value;
        };

        $.extend({
            parseJSON: function (data) {
                /// <summary>Takes a well-formed JSON string and returns the resulting JavaScript object.</summary>
                /// <param name="data" type="String">The JSON string to parse.</param>
                /// <param name="convertDates" optional="true" type="Boolean">Set to true when you want ISO/Asp.net dates to be auto-converted to dates.</param>
                var convertDates = true;
                if (typeof data !== "string" || !data) {
                    return null;
                }

                // Make sure leading/trailing whitespace is removed (IE can't handle it)
                data = $.trim(data);

                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js

                if (rvalidchars.test(data
                    .replace(rvalidescape, "@")
                    .replace(rvalidtokens, "]")
                    .replace(rvalidbraces, ""))) {
                    // Try to use the native JSON parser
                    if (extendedJSON || (nativeJSON && convertDates !== true)) {
                        return window.JSON.parse(data, convertDates === true ? jsonDateConverter : undefined);
                    }
                    else {
                        data = convertDates === true ?
                            data.replace(replaceISO, "new Date(parseInt('$1',10),parseInt('$2',10)-1,parseInt('$3',10),parseInt('$4',10),parseInt('$5',10),parseInt('$6',10),(function(s){return parseInt(s,10)||0;})('$7'))")
                                .replace(replaceNet, "new Date($1)") :
                            data;
                        return (new Function("return " + data))();
                    }
                } else {
                    $.error("Invalid JSON: " + data);
                }
            }
        });
    })(jQuery);

    //Refreshing
    function MvcControlsToolkit_RefreshWidget(element) {
        jElement = $(element);
        var dataRefresh = jElement.attr("data-refresh") || "";
        if (dataRefresh == '') return;
        try {
            $(element)[dataRefresh]("refresh");
        }
        catch (e) {
        }
    }

    //Generic validation functions
    var ValidationType_StandardClient = "StandardClient";
    var ValidationType_UnobtrusiveClient = "UnobtrusiveClient";
    var ValidationType_Server = "Server";

    //validate single field return value of true if valid
    function MvcControlsToolkit_Validate(fieldName, validationType) {
        if (validationType == ValidationType_UnobtrusiveClient) {
            var selector = '#' + fieldName;
            var res = true;
            try {
                res = $(selector).parents('form').validate().element(selector);
            }
            catch (e) {
            }
            return res;
        }
        return true;
    }
    //validate whole form with return value of true if valid
    function MvcControlsToolkit_FormIsValid(elementField, validationType) {
        if (validationType == ValidationType_UnobtrusiveClient) {
            return $('#' + elementField).parents('form').validate().form();
        }
        else {
            return true;
        }
    }

    ///////// UNOBTRUSIVE VALIDATION//////////////////////////////////



    if (typeof $ !== 'undefined' && $ !== null && typeof $.validator !== 'undefined' && $.validator !== null && typeof $.validator.unobtrusive !== 'undefined' && $.validator.unobtrusive !== null) {


        (function ($) {
            ///////Support function for rules involving other fields(I call them client dynamic/////////////////////
            var $jQval = $.validator;
            $jQval.prototype._originalFormValidation = $jQval.prototype._oldFormValidation || $jQval.prototype.form;
            var newFormValidation = function () {
                var boxes = $(this.currentForm).find("input[data-element-type='TypedTextBox']");
                boxes.data("_was_hit_", true);
                var res = this._originalFormValidation();
                boxes.trigger('pblur');
                return res;
            };
            if ($jQval.prototype._oldFormValidation) $jQval.prototype._oldFormValidation = newFormValidation;
            else $jQval.prototype.form = newFormValidation;

            $.validator.takeDynamicValue = function (fieldToVerify, fieldName) {

                if (fieldToVerify == null) return null;

                var name = fieldToVerify.name;
                var index = name.lastIndexOf('.');
                if (index >= 0) {
                    var toCut = name.substring(index + 1);
                    var thisId = fieldToVerify.id;
                    thisId = thisId.substring(0, thisId.lastIndexOf(toCut));
                    fieldName = thisId + fieldName;
                }
                var element = document.getElementById(fieldName);
                if (element == null) return null;
                var toInsert = false;
                var _dependsOn = jQuery.data(fieldToVerify, "_dependsOn");
                if (typeof _dependsOn == 'undefined' || _dependsOn == null) {
                    _dependsOn = new Array();
                    _dependsOn[fieldName] = element;
                    jQuery.data(fieldToVerify, "_dependsOn", _dependsOn);
                    toInsert = true;
                }
                else {
                    if (typeof _dependsOn[fieldName] === 'undefined') {
                        _dependsOn[fieldName] = element;
                        toInsert = true;
                    }
                }
                if (toInsert) {
                    var jField = $(fieldToVerify);
                    var callback = function () {
                        if (jField.attr('data-elementispart')) {
                            var jCompanion = $('#' + fieldToVerify.id + '_hidden');
                            if (jCompanion.data('_vstack')) return;
                            jField.trigger('pfocus');
                            jField.trigger('pblur');
                            jCompanion.trigger('pfocus');
                            jCompanion.data('_vstack', true);
                            jCompanion.trigger('pblur');
                            jCompanion.removeData('_vstack');
                        }
                        else
                            jField.parents('form').first().validate().element(fieldToVerify);
                    };
                    $(element).blur(callback);
                    $(element).bind('vblur', callback);
                }
                if ($(element).attr('data-element-type') == 'Native') return widgets.Native.getString(element, true);
                return element.value;
            };
            //////////////parsing input elements parsing functions ///////////////////////////
            $.validator.unobtrusive.clearAndParse = function (selector) {
                var form = $(selector).parents("form");
                if (form.length != 0) {
                    form.removeData("validator");
                }
                else {
                    $(selector).removeData("validator");
                }
                $.validator.unobtrusive.parse(selector);
            }
            $.validator.unobtrusive.reParse = function (selector) {
                $.validator.unobtrusive.clearAndParse(selector);
                MvcControlsToolkit_ParseRegister.parse(selector);
            }
            $.validator.unobtrusive.parseExt = function (selector) {

                $.validator.unobtrusive.parse(selector);


                var form = $(selector).first().closest('form');


                var unobtrusiveValidation = form.data('unobtrusiveValidation');
                if (!unobtrusiveValidation) return;
                var validator = form.validate();

                $.each(unobtrusiveValidation.options.rules, function (elname, elrules) {
                    if (validator.settings.rules[elname] == undefined) {
                        var args = {};
                        $.extend(args, elrules);
                        args.messages = unobtrusiveValidation.options.messages[elname];
                        $('[name= "' + elname + '"]').rules("add", args);
                    } else {
                        $.each(elrules, function (rulename, data) {
                            if (validator.settings.rules[elname][rulename] == undefined) {
                                var args = {};
                                args[rulename] = data;
                                args.messages = unobtrusiveValidation.options.messages[elname][rulename];
                                $('[name= "' + elname + '"]').rules("add", args);
                            }
                        });
                    }
                });
                MvcControlsToolkit_ParseRegister.parse(selector);
            }
        })($);

        /// mandatory attribute
        $.validator.unobtrusive.adapters.addBool("mandatory", "required");
        /////Multy field rules handling

        ///Dynamic Range rule////
        $.validator.addMethod(
            "dynamicrange",
            function (value, element, param) {

                var minValue = param[0]; if (minValue == '') minValue = null;
                var maxValue = param[1]; if (maxValue == '') maxValue = null;


                if ((!value || !value.length) && this.optional(element)) return true; /*success*/
                if ($(element).attr('data-element-type') == 'Native') value = widgets.Native.getString(element, true);
                var convertedValue = null;
                if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                    convertedValue = jQuery.global.parseFloat(value);
                }
                else {
                    convertedValue = parseFloat(value);
                }
                if (!isNaN(convertedValue) &&
                (minValue == null || minValue <= convertedValue) &&
                (maxValue == null || convertedValue <= maxValue)) {
                    return true; /* success */
                }
                return false;
            },
        "value is not in the required range");
        jQuery.validator.unobtrusive.adapters.add("dynamicrange", ["min", "max"], function (options) {
            var min = options.params.min,
                    max = options.params.max;

            options.rules["dynamicrange"] = [min, max];
            if (options.message) {
                options.messages["dynamicrange"] = options.message;
            }
        });
        ///Client Dynamic Range rule////
        $.validator.addMethod(
            "clientdynamirange",
            function (value, element, param) {

                var nminValue = param[0]; if (nminValue == '') nminValue = null;
                var nmaxValue = param[2]; if (nmaxValue == '') nmaxValue = null;

                var minDelay = param[1]; if (minDelay == '') minDelay = null;
                var maxDelay = param[3]; if (maxDelay == '') maxDelay = null;
                var minValue = null;
                var maxValue = null;
                if (minDelay != null) minDelay = parseFloat(minDelay);
                if (maxDelay != null) maxDelay = parseFloat(maxDelay);


                if ((!value || !value.length) && this.optional(element)) return true; /*success*/
                if ($(element).attr('data-element-type') == 'Native') value = widgets.Native.getString(element, true);
                var convertedValue = null;
                if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                    convertedValue = jQuery.global.parseFloat(value);
                }
                else {
                    convertedValue = parseFloat(value);
                }


                if (nminValue != null) {
                    var sminValue = $.validator.takeDynamicValue(element, nminValue);
                    if (sminValue != null) {
                        minValue = null;
                        if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                            minValue = jQuery.global.parseFloat(sminValue);
                        }
                        else {
                            minValue = parseFloat(sminValue);
                        }
                        if (isNaN(minValue)) {
                            minValue = null;
                        }
                        else if (minDelay != null) {
                            minValue = minValue + minDelay;
                        }
                    }

                }

                if (nmaxValue != null) {
                    var smaxValue = $.validator.takeDynamicValue(element, nmaxValue);
                    if (smaxValue != null) {
                        maxValue = null;
                        if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                            maxValue = jQuery.global.parseFloat(smaxValue);
                        }
                        else {
                            maxValue = parseFloat(smaxValue);
                        }
                        if (isNaN(maxValue)) {
                            maxValue = null;
                        }
                        else if (maxDelay != null) {
                            maxValue = maxValue + maxDelay;
                        }
                    }

                }

                if (!isNaN(convertedValue) &&
                (minValue == null || minValue <= convertedValue) &&
                (maxValue == null || convertedValue <= maxValue)) {
                    return true; /* success */
                }
                return false;

            },
            "value is not in the required range");
        jQuery.validator.unobtrusive.adapters.add("clientdynamirange", ["min", "mindelay", "max", "maxdelay"], function (options) {
            var min = options.params.min,
                    mindelay = options.params.mindelay;
            max = options.params.max,
                    maxdelay = options.params.maxdelay;

            options.rules["clientdynamirange"] = [min, mindelay, max, maxdelay];
            if (options.message) {
                options.messages["clientdynamirange"] = options.message;
            }
        });


        //////Date validation///////////////
        $.validator.addMethod(
                "globalizeddate",
                function (value, element, param) {

                    if ((!value || !value.length) && this.optional(element)) return true; /*success*/
                    if ($(element).attr('data-element-type') == 'Native') value = widgets.Native.getString(element, true);
                    var convertedValue = null;
                    if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                        convertedValue = new Date(value);
                        convertedValue = jQuery.global.parseDate(value);
                    }
                    else {
                        convertedValue = new Date(value);
                    }
                    return !isNaN(convertedValue) && convertedValue != null;
                },
                "field must be a date/time"
            );
        $.validator.addMethod(
    "daterange",
    function (value, element, param) {

        var minValue = param[0]; if (minValue == '') minValue = null;
        var maxValue = param[1]; if (maxValue == '') maxValue = null;

        if (minValue != null) minValue = (minValue + '').charAt(0) == "/" ? eval("new " + minValue.substring(1, minValue.length - 1)) : new Date(minValue);
        if (maxValue != null) maxValue = (maxValue + '').charAt(0) == "/" ? eval("new " + maxValue.substring(1, maxValue.length - 1)) : new Date(maxValue);

        if ((!value || !value.length) && this.optional(element)) return true; /*success*/
        if ($(element).attr('data-element-type') == 'Native') value = widgets.Native.getString(element, true);
        var convertedValue = null;
        if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
            convertedValue = new Date(value);
            convertedValue = jQuery.global.parseDate(value);
        }
        else {
            convertedValue = new Date(value);
        }
        if (!isNaN(convertedValue) &&
        (minValue == null || minValue <= convertedValue) &&
        (maxValue == null || convertedValue <= maxValue)) {
            return true; /* success */
        }
        return false;
    },
    "date is not in the required range");
        jQuery.validator.unobtrusive.adapters.add("daterange", ["min", "max"], function (options) {
            var min = options.params.min,
            max = options.params.max;
            options.rules["daterange"] = [min, max];
            if (options.message) {
                options.messages["daterange"] = options.message;
            }
        });

        $.validator.addMethod(
            "clientdynamicdaterange",
            function (value, element, param) {
                var nminValue = param[0]; if (nminValue == '') nminValue = null;
                var nmaxValue = param[2]; if (nmaxValue == '') nmaxValue = null;

                var minDelay = param[1]; if (minDelay == '') minDelay = null;
                var maxDelay = param[3]; if (maxDelay == '') maxDelay = null;
                var minValue = null;
                var maxValue = null;
                if (minDelay != null) minDelay = parseInt(minDelay);
                if (maxDelay != null) maxDelay = parseInt(maxDelay);


                if ((!value || !value.length) && this.optional(element)) return true; /*success*/
                if ($(element).attr('data-element-type') == 'Native') value = widgets.Native.getString(element, true);
                var convertedValue = null;
                if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                    convertedValue = jQuery.global.parseDate(value);
                }
                else {
                    convertedValue = parseDate(value);
                }


                if (nminValue != null) {
                    var sminValue = $.validator.takeDynamicValue(element, nminValue);
                    if (sminValue != null) {
                        minValue = null;
                        if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                            minValue = jQuery.global.parseDate(sminValue);
                        }
                        else {
                            minValue = parseDate(sminValue);
                        }
                        if (isNaN(minValue)) {
                            minValue = null;
                        }
                        else if (minDelay != null) {
                            minValue = new Date(minValue.getTime() + minDelay);
                        }
                    }

                }

                if (nmaxValue != null) {
                    var smaxValue = $.validator.takeDynamicValue(element, nmaxValue);
                    if (smaxValue != null) {
                        maxValue = null;
                        if (typeof jQuery.global !== 'undefined' && typeof jQuery.global.parseFloat === 'function') {
                            maxValue = jQuery.global.parseDate(smaxValue);
                        }
                        else {
                            maxValue = parseDate(smaxValue);
                        }
                        if (isNaN(maxValue)) {
                            maxValue = null;
                        }
                        else if (maxDelay != null) {
                            maxValue = new Date(maxValue.getTime() + maxDelay);
                        }
                    }

                }

                if (!isNaN(convertedValue) &&
                (minValue == null || minValue <= convertedValue) &&
                (maxValue == null || convertedValue <= maxValue)) {
                    return true; /* success */
                }
                return false;

            },
            "date is not in the required range");

        jQuery.validator.unobtrusive.adapters.add("clientdynamicdaterange", ["min", "mindelay", "max", "maxdelay"], function (options) {
            var min = options.params.min,
                    mindelay = options.params.mindelay;
            max = options.params.max,
                    maxdelay = options.params.maxdelay;

            options.rules["clientdynamicdaterange"] = [min, mindelay, max, maxdelay];
            if (options.message) {
                options.messages["clientdynamicdaterange"] = options.message;
            }
        });
        jQuery.validator.unobtrusive.adapters.add("globalizeddate", [], function (options) {
            options.rules["globalizeddate"] = [];
            if (options.message) {
                options.messages["globalizeddate"] = options.message;
            }
        });

    }

    ////////// END UNOBTRUSIVE VALIDATION //////////////////
    /////////////////////AJAX FORMS VALIDATION////////////////
    function Setup_Ajax_ClientValidation(formId) {
        if (typeof $ !== 'undefined' && $ !== null && typeof $.validator !== 'undefined'
            && $.validator !== null && typeof $.validator.unobtrusive !== 'undefined'
            && $.validator.unobtrusive !== null) {

            $.validator.unobtrusive.clearAndParse('#' + formId);
        }
        MvcControlsToolkit_ParseRegister.parse('#' + formId);
    }
    /////////////////////////////////////////////////////////

    // DUAL SELECT

    var DualSelect_Separator = ";;;";
    var DualSelect_SelectAvial = "_AvialSelect";
    var DualSelect_SelectSelected = "_SelSelect";
    var DualSelect_HiddenSelectedItemsVal = "";
    var DualSelect_Postfix = "___PackedValue";
    var DualSelect_AvailableFilter = "_AvailableFilter";
    var DualSelect_SelectedFilter = "_SelectedFilter";

    var DualSelect_TempObjSource, DualSelect_TempObjDestination;


    function MvcControlsToolkit_SubstringRating(toSearch, destination) {
        toSearch = toSearch.toLowerCase();
        destination = destination.toLowerCase();
        var firstMatch = -true;
        var penalties = 0;
        var matchCount = 0;
        for (var j = 0; j < toSearch.length; j++) {
            if (destination == '') return [matchCount, penalties];
            var currChar = toSearch.charAt(j);
            var index = destination.indexOf(currChar);
            if (index == -1) continue;
            matchCount++;
            if (firstMatch) {
                penalties += index;
                firstMatch = false;
            }
            else penalties += index * 1000;

            if (index + 1 < destination.length)
                destination = destination.substr(index + 1)
            else
                destination = '';
        }
        return [matchCount, penalties];
    }

    function DualSelect_FilterInit(controlId, selected) {
        $('#' + controlId + (selected ? DualSelect_SelectedFilter : DualSelect_AvailableFilter)).keydown(function () {
            var self = this;
            var prev = MvcControlsToolkit_Trim($(self).val());
            setTimeout(function () {
                var target = document.getElementById(controlId + (selected ? DualSelect_SelectSelected : DualSelect_SelectAvial));
                var searchTerm = MvcControlsToolkit_Trim($(self).val());
                if (prev == searchTerm) return;
                prev = searchTerm;
                if (searchTerm == '') return;
                var toOrder = [];

                for (var i = 0; i < target.length; i++) {
                    toOrder.push({
                        rating: MvcControlsToolkit_SubstringRating(searchTerm, $(target[i]).text()),
                        item: target[i]
                    });
                }
                toOrder.sort(function (a, b) {
                    if (a.rating[0] > b.rating[0]) return -1;
                    if (b.rating[0] > a.rating[0]) return 1;
                    if (a.rating[1] < b.rating[1]) return -1;
                    if (b.rating[1] < a.rating[1]) return 1;
                    return 0;
                });
                target.options.length = 0;
                for (var i = 0; i < toOrder.length; i++) {
                    target.options.add(toOrder[i].item);
                }
                if (selected) DualSelect_SaveSelection(controlId);
            });
        });
    }

    function DualSelect_SetObjects(dualSelectId, bDoSelected) {
        if (bDoSelected) {
            DualSelect_TempObjSource =
                document.getElementById(dualSelectId + DualSelect_SelectAvial);
            DualSelect_TempObjDestination =
                document.getElementById(dualSelectId + DualSelect_SelectSelected);
        }
        else {
            DualSelect_TempObjSource =
                document.getElementById(dualSelectId + DualSelect_SelectSelected);
            DualSelect_TempObjDestination =
                document.getElementById(dualSelectId + DualSelect_SelectAvial);
        }
    }



    function DualSelect_GetIndexForInsert(oSelect, oNode) {
        if (oSelect.autosort == "false")
            return oSelect.length + 1;

        if (oSelect.length == 0) return 0;

        for (var i = 0; i < oSelect.length; i++)
            if (oSelect[i].text > oNode.text)
                return i;
        return oSelect.length;
    }



    function DualSelect_MoveElement(dualSelectId, bDoSelected) {
        DualSelect_SetObjects(dualSelectId, bDoSelected);
        var rootElement = $('#' + dualSelectId.substring(0, dualSelectId.lastIndexOf("___")));

        if (DualSelect_TempObjSource.length == 0) return;

        iLast = 0;

        for (var i = 0; i < DualSelect_TempObjSource.length; i++) {
            if (DualSelect_TempObjSource[i].selected) {
                iLast = i;
                var oNode = DualSelect_TempObjSource[i];
                var changeData = new MvcControlsToolkit_changeData(oNode, bDoSelected ? 'ItemCreating' : 'ItemDeleting', 0);
                rootElement.trigger('itemChange', changeData);
                if (changeData.Cancel == true) continue;
                DualSelect_TempObjSource.remove(i);
                nPos = (DualSelect_TempObjDestination.length + 1);
                DualSelect_TempObjDestination.options.add(oNode,
                    DualSelect_GetIndexForInsert(DualSelect_TempObjDestination, oNode));
                changeData = new MvcControlsToolkit_changeData(oNode, bDoSelected ? 'ItemCreated' : 'ItemDeleted', 0);
                rootElement.trigger('itemChange', changeData);
                i--;
            }
        }

        DualSelect_SaveSelection(dualSelectId);

        if (DualSelect_TempObjSource.length > 0 && iLast == 0)
            DualSelect_TempObjSource.selectedIndex = 0;
        else if (DualSelect_TempObjSource.length - 1 >= iLast)
            DualSelect_TempObjSource.selectedIndex = iLast;
        else if (DualSelect_TempObjSource.length >= 1)
            DualSelect_TempObjSource.selectedIndex = iLast - 1;

        DualSelect_ClearSelection(DualSelect_TempObjSource);
        DualSelect_TempObjSource.focus();
        rootElement.trigger('DualSelect_Changed');
    }

    function DualSelect_Move_Up(dualSelectId, bDoSelected) {
        DualSelect_SetObjects(dualSelectId, bDoSelected);
        var rootElement = $('#' + dualSelectId.substring(0, dualSelectId.lastIndexOf("___")));
        if (DualSelect_TempObjSource.length == 0) return;
        if (DualSelect_TempObjSource[0].selected) return;
        for (var i = 1; i < DualSelect_TempObjSource.length; i++) {
            if (DualSelect_TempObjSource[i].selected) {
                var tempValue = DualSelect_TempObjSource[i];
                var changeData = new MvcControlsToolkit_changeData(tempValue, 'ItemMoving', 1);
                rootElement.trigger('itemChange', changeData);
                if (changeData.Cancel == true) continue;
                var tempValue1 = DualSelect_TempObjSource[i - 1];
                DualSelect_TempObjSource.remove(i);
                DualSelect_TempObjSource.remove(i - 1);
                DualSelect_TempObjSource.options.add(tempValue, i - 1);
                DualSelect_TempObjSource.options.add(tempValue1, i);
                changeData = new MvcControlsToolkit_changeData(tempValue, 'ItemMoved', 1);
                rootElement.trigger('itemChange', changeData);
                i--;
            }
        }

        DualSelect_SaveSelection(dualSelectId);
        rootElement.trigger('DualSelect_Changed');
    }

    function DualSelect_Move_Down(dualSelectId, bDoSelected) {
        DualSelect_SetObjects(dualSelectId, bDoSelected);
        var rootElement = $('#' + dualSelectId.substring(0, dualSelectId.lastIndexOf("___")));
        if (DualSelect_TempObjSource.length == 0) return;
        if (DualSelect_TempObjSource[DualSelect_TempObjSource.length - 1].selected) return;
        for (var i = DualSelect_TempObjSource.length - 2; i > -1; i--) {
            if (DualSelect_TempObjSource[i].selected) {
                var tempValue = DualSelect_TempObjSource[i];
                var changeData = new MvcControlsToolkit_changeData(tempValue, 'ItemMoving', -1);
                rootElement.trigger('itemChange', changeData);
                if (changeData.Cancel == true) continue;
                var tempValue1 = DualSelect_TempObjSource[i + 1];
                DualSelect_TempObjSource.remove(i + 1);
                DualSelect_TempObjSource.remove(i);
                DualSelect_TempObjSource.options.add(tempValue1, i);
                DualSelect_TempObjSource.options.add(tempValue, i + 1);
                changeData = new MvcControlsToolkit_changeData(tempValue, 'ItemMoved', -1);
                rootElement.trigger('itemChange', changeData);
                i++;
            }
        }

        DualSelect_SaveSelection(dualSelectId);
        rootElement.trigger('DualSelect_Changed');
    }

    function DualSelect_MoveAll(dualSelectId, bDoSelected, noEvents) {
        DualSelect_SetObjects(dualSelectId, bDoSelected);
        var rootElement = $('#' + dualSelectId.substring(0, dualSelectId.lastIndexOf("___")));
        var first = 0;
        while (DualSelect_TempObjSource.length > first) {
            oNode = DualSelect_TempObjSource[first];
            if (noEvents != true) {
                var changeData = new MvcControlsToolkit_changeData(oNode, bDoSelected ? 'ItemCreating' : 'ItemDeleting', 0);
                rootElement.trigger('itemChange', changeData);
                if (changeData.Cancel == true) { first++; continue; }
            }
            DualSelect_TempObjSource.remove(oNode);
            DualSelect_TempObjDestination.options.add(oNode,
                DualSelect_GetIndexForInsert(DualSelect_TempObjDestination, oNode));
            if (noEvents != true) {
                var changeData = new MvcControlsToolkit_changeData(oNode, bDoSelected ? 'ItemCreated' : 'ItemDeleted', 0);
                rootElement.trigger('itemChange', changeData);
            }
        }

        DualSelect_SaveSelection(dualSelectId);
        if (noEvents != true) rootElement.trigger('DualSelect_Changed');
    }



    function DualSelect_ClearSelection(oSelect) {
        for (var i = 0; i < oSelect.length; i++)
            oSelect[i].selected = false;
    }



    function DualSelect_SaveSelection(dualSelectId) {
        var oSelect = document.getElementById(
            dualSelectId + DualSelect_SelectSelected);
        var sValues = "";
        var sTexts = "";

        for (var i = 0; i < oSelect.length; i++) {
            sValues += oSelect[i].value + DualSelect_Separator;

        }

        document.getElementById(
            dualSelectId + DualSelect_HiddenSelectedItemsVal).value = sValues;

    }

    
    /////////////////////////Change Handlers/////////////////////////////////////////
    function MvcControlsToolkit_changeData(itemChanged, changeType, data) {
        this.ItemChanged = itemChanged;
        this.ChangeType = changeType;
        this.Data = data;
    }
    MvcControlsToolkit_changeData.prototype = {
        ItemChanged: null,
        ChangeType: null,
        Data: null,
        Cancel: false
    }
    ///////////////////////////////////MANIPULATION BUTTONS/////////////////////////

    var ManipulationButtonRemove = "ManipulationButtonRemove";
    var ManipulationButtonHide = "ManipulationButtonHide";
    var ManipulationButtonShow = "ManipulationButtonShow";
    var ManipulationButtonResetGrid = "ManipulationButtonResetGrid";
    var ManipulationButtonCustom = "ManipulationButtonCustom";

    function ManipulationButton_Click(target, dataButtonType) {
        if (dataButtonType == ManipulationButtonCustom) {
            if (typeof target === "string") eval(target);
            else target();
            return;
        }

        if (dataButtonType == ManipulationButtonRemove) {
            $('#' + target).remove();
        }
        else if (dataButtonType == ManipulationButtonHide) {

            $('#' + target).css('visibility', 'hidden');

        }
        else if (dataButtonType == ManipulationButtonShow) {

            $('#' + target).css('visibility', 'visible');
        }
        else if (dataButtonType == ManipulationButtonResetGrid)
            mvcct.basicControls.resetAllGrid(target);
    }


    ///////////////////////////////PAGER///////////////////////////////////



    function PageButton_Click(pageField, pageValue, pageUrl, targetId, validationType) {
        if (pageUrl == '') {
            if (!MvcControlsToolkit_FormIsValid(pageField, validationType)) return;

            var field = document.getElementById(pageField);
            field.value = pageValue;
            $('#' + pageField).parents('form').submit();
        }
        else if (targetId != '') {
            $.ajax({
                type: 'GET',
                url: pageUrl,
                success: function (data) {
                    $('#' + targetId).html(data);
                }
            });
        }
        else {
            window.location.href = pageUrl;
        }
    }
    function MvcControlsToolkit_RefreshPager(pagerId) {
        var enabled = function (jButton, yes) {
            if (!yes || yes == 'curr') {
                if (yes == "curr") {
                    jButton.attr("data-selected-page", "selected");
                }
                else {
                    jButton.attr("disabled", "disabled");
                    if (jButton[0].tagName.toLowerCase() == 'img') {
                        var enabledUrl = jButton.attr('data-enabled-src') || '';
                        if (enabledUrl != '') jButton.attr('src', enabledUrl);
                    }
                }
                jButton.attr('data-no-click', true);
            }
            else {
                jButton.removeAttr("disabled");
                jButton.removeAttr("data-selected-page");
                if (jButton[0].tagName.toLowerCase() == 'img') {
                    var disabledUrl = jButton.attr('data-disabled-src') || '';
                    if (disabledUrl != '') jButton.attr('src', disabledUrl);
                }
                jButton.removeAttr('data-no-click');
            }
        };
        var pager = $("#" + pagerId);
        var currPage = parseInt(pager.val());
        var totPages = pager.attr("data-total-pages") || '';
        if (totPages != '') totPages = parseInt(totPages);
        if (currPage < 1) currPage = 1;
        var prefix = pager.attr('data-page-prefix') || '';
        var postfix = pager.attr('data-page-postfix') || '';
        typedTextBox.setById(pagerId + "_goto", currPage, null, 1);
        $("." + pagerId + "_class").each(function () {
            var jThis = $(this);
            var type = jThis.attr("data-pager-button");
            if (type == "PageButtonFirst" || type == "PageButtonPrevious") {
                if (currPage == 1) {
                    enabled(jThis, false);
                }
                else enabled(jThis, true);
            }
            else if (type == "PageButtonNext") {
                if (totPages != '' && currPage >= totPages) enabled(jThis, false);
                else enabled(jThis, true);
            }
            else if (type == "PageButtonLast") {
                if (totPages == '' || currPage >= totPages) enabled(jThis, false);
                else enabled(jThis, true);
            }
            else if (type == "PageButtonPage") {
                var index = parseInt(jThis.attr("data-pager-index"));
                if (currPage + index < 1 || (totPages != '' && currPage + index > totPages)) jThis.parent().hide();
                else {
                    jThis.text(prefix + (currPage + index) + postfix);
                    jThis.parent().show();
                    if (index == 0) enabled(jThis, 'curr');
                    else enabled(jThis, true);
                }
            }
            pager.trigger("pagerRefreshed");
        });
    }

    function MvcControlsToolkit_InitJsonPager(pagerId) {
        $(document).ready(function () {
            var pager = $("#" + pagerId);
            var causeSubmit = (pager.attr('data-cause-submit') || '') != '';
            var validationType = pager.attr('data-validation-type') || '';
            $("." + pagerId + "_class").click(function () {
                var jThis = $(this);
                if ((jThis.attr('data-no-click') || false)) return false;
                var type = jThis.attr("data-pager-button");
                var prevPage = pager.val();
                if (!causeSubmit || MvcControlsToolkit_FormIsValid(pagerId, validationType))
                    if (type == "PageButtonFirst") {
                        pager.val(1);
                        pager.trigger("ClientPager_Changed");
                    }
                    else if (type == "PageButtonPrevious") {
                        var currPage = parseInt(pager.val());
                        pager.val(currPage - 1);
                        pager.trigger("ClientPager_Changed");
                    }
                    else if (type == "PageButtonNext") {
                        var currPage = parseInt(pager.val());
                        pager.val(currPage + 1);
                        pager.trigger("ClientPager_Changed");
                    }
                    else if (type == "PageButtonLast") {
                        var totPages = pager.attr("data-total-pages") || '';
                        if (totPages != '') {
                            pager.val(parseInt(totPages));
                            pager.trigger("ClientPager_Changed");
                        }
                    }
                    else if (type == "PageButtonPage") {
                        var currPage = parseInt(pager.val());
                        var index = parseInt(jThis.attr("data-pager-index"));
                        pager.val(currPage + index);
                        pager.trigger("ClientPager_Changed");
                    }
                    else if (type == "PageButtonGoTo") {
                        var totPages = pager.attr("data-total-pages") || '';
                        if (totPages != '') totPages = parseInt(totPages);
                        var targetPage = typedTextBox.getById(pagerId + "_goto", 1);
                        if (targetPage < 1) targetPage = 1;
                        else if (totPages != '' && targetPage > totPages) targetPage = totPages;
                        pager.val(targetPage);
                        pager.trigger("ClientPager_Changed");
                    }
                MvcControlsToolkit_RefreshPager(pagerId);
                var totPages = pager.attr("data-total-pages") || '';
                if (totPages != '') totPages = parseInt(totPages);
                var data = {
                    type: "page",
                    submit: causeSubmit,
                    page: parseInt(pager.val()),
                    pager: pager,
                    previousPage: parseInt(prevPage),
                    totalPages: totPages
                };
                var clientModel = pager.attr('data-client-model') || '';
                var pageSizeName = pager.attr('data-page-size') || '';
                var pageSizeId = pager.attr('data-page-size-id');
                if (clientModel != '' && pageSizeName != '') {
                    data.pageSizeObservable = mvcct.utils.property(ko.dataFor(pager[0]), pageSizeName); //eval(clientModel + "." + pageSizeName);
                    data.itemsPerPage = ko.utils.unwrapObservable(data.pageSizeObservable);
                }
                else if (pageSizeId) {
                    data.itemsPerPage = typedTextBox.getById(pageSizeId, MvcControlsToolkit_DataType_Int);
                    if (isNaN(data.itemsPerPage)) data.itemsPerPage = null;
                }
                pager.trigger("queryChanged", data);
                if (data.submit) pager.parents('form').first().submit();
            });
            var clientModel = pager.attr('data-client-model') || '';
            var totalPageName = pager.attr('data-total-pages-name') || '';
            if (clientModel != '' && totalPageName != '') {
                var dependentObservable = new ko.dependentObservable(
                function () {
                    var pages = ko.utils.unwrapObservable(mvcct.utils.property(ko.dataFor(pager[0]), totalPageName)); //ko.utils.unwrapObservable(eval(clientModel + "." + totalPageName));
                    var page = parseInt(pager.val());
                    if (page > pages) {
                        page = pages;
                        if (page == 0) page = 1;
                        pager.val(page);
                        pager.trigger("ClientPager_Changed");
                    }
                    pager.attr('data-total-pages', pages + '');
                    MvcControlsToolkit_RefreshPager(pagerId);
                },
                null,
                { 'disposeWhenNodeIsRemoved': pager[0] });
                pager.data("__mvcct_totalpagesDependency__", dependentObservable);
            }
            MvcControlsToolkit_RefreshPager(pagerId);
        });
    }

    function MvcControlsToolkit_NewPage(pagerId, newPage, newTotalPages) {
        var pager = $('#' + pagerId);
        pager.val(newPage);
        pager.attr("data-total-pages", newTotalPages);
        MvcControlsToolkit_RefreshPager(pagerId);
    }

    

    ///////////////////////////////SORTING///////////////////////////////////

    function _inner_Sort_Handler(field, buttonName, initialize, causePostback, clientOrderChanged, sortField, pageField, cssNoSort, cssAscending, cssDescending, validationType, oneColumnSorting) {
        if (!initialize && causePostback && !MvcControlsToolkit_FormIsValid(sortField, validationType)) return;
        var order = $('#' + sortField).val();
        var hasAscending = order.indexOf(' ' + field + '#+;');
        var hasDescending = order.indexOf(' ' + field + '#-;');
        var prevOrder = '';
        var actualOrder = '';
        if (!initialize) {
            if (hasDescending >= 0) {
                if (oneColumnSorting)
                    order = order.replace(' ' + field + '#-;', ' ' + field + '#+;');
                else
                    order = order.replace(' ' + field + '#-;', '');
                $('#' + sortField).val(order);
                $('#' + buttonName).removeClass(cssDescending);
                if (oneColumnSorting)
                    $('#' + buttonName).addClass(cssAscending);
                else
                    $('#' + buttonName).addClass(cssNoSort);
                prevOrder = '-';
            }
            else if (hasAscending >= 0) {
                order = order.replace(' ' + field + '#+;', ' ' + field + '#-;');
                $('#' + sortField).val(order);
                $('#' + buttonName).removeClass(cssAscending);
                $('#' + buttonName).addClass(cssDescending);
                prevOrder = '+';
                actualOrder = '-';
            }
            else {
                if (oneColumnSorting) order = ' ' + field + '#+;';
                else order = order + ' ' + field + '#+;';
                $('#' + sortField).val(order);
                $('#' + buttonName).removeClass(cssNoSort);
                $('#' + buttonName).addClass(cssAscending);
                actualOrder = '+';
                if (oneColumnSorting) {
                    var prevButton = $('#' + sortField).data('_prevbutton_');
                    if (prevButton != '' && prevButton != buttonName) {
                        $('#' + prevButton).removeClass(cssDescending).removeClass(cssAscending).addClass(cssNoSort);
                    }
                    $('#' + sortField).data('_prevbutton_', buttonName);
                }
            }
            if (pageField != null) $('#' + pageField).val('1');
            if (clientOrderChanged != null) eval(clientOrderChanged + "('" + field + "', '" + prevOrder + "', '" + actualOrder + "')");
            if (causePostback) $('#' + sortField).parents('form').submit();
        }
        else {
            if (hasDescending >= 0) {
                $('#' + buttonName).removeClass(cssDescending + " " + cssAscending + " " + cssNoSort).addClass(cssDescending);
                if (oneColumnSorting) $('#' + sortField).data('_prevbutton_', buttonName);
            }
            else if (hasAscending >= 0) {
                $('#' + buttonName).removeClass(cssDescending + " " + cssAscending + " " + cssNoSort).addClass(cssAscending);
                if (oneColumnSorting) $('#' + sortField).data('_prevbutton_', buttonName);
            }
            else {
                $('#' + buttonName).removeClass(cssDescending + " " + cssAscending + " " + cssNoSort).addClass(cssNoSort);
            }
        }
    }
    function Sort_Handler(field, buttonName, initialize, causePostback, clientOrderChanged, sortField, pageField, cssNoSort, cssAscending, cssDescending, validationType, oneColumnSorting, sorter) {
        var sortFieldOb = $('#' + sortField);
        if (!initialize && causePostback && !MvcControlsToolkit_FormIsValid(sortField, validationType)) return;
        _inner_Sort_Handler(field, buttonName, initialize, false, clientOrderChanged, sortField, pageField, cssNoSort, cssAscending, cssDescending, validationType, oneColumnSorting);
        if (!initialize) {
            var data = {
                type: "sort",
                sortString: sortFieldOb.val(),
                submit: causePostback,
                sorterInfos: {
                    func: sorter,
                    container: sortField,
                    value: $('#' + sortField).val()
                },
                page: 1

            };
            if (pageField != null) {
                var pager = $('#' + pageField);
                MvcControlsToolkit_RefreshPager(pageField);
                pager.trigger("ClientPager_Changed");
                var totPages = pager.attr("data-total-pages") || '';
                if (totPages != '') totPages = parseInt(totPages);
                data["pageSize"] = totPages;
            }
            $('#' + buttonName).trigger("queryChanged", data);
            if (data.submit) sortFieldOb.parents('form').first().submit();
        }


    };
    ////////////////////////////////ViewList and ViewsOnOff///////////////////////////////////////////////
    function viewListInitialize(p0, p1, p2, p3, p4) {
        $('.' + p0).hide();
        $(document).ready(function () {
            setTimeout(function () {
                $('.' + p0).show();
                var w = pstatus[p0 + '_ViewList'];
                if (w && w.Release) w.Release();
                w = pstatus[p0 + '_ViewList'] = new basic.viewListClient(p0, p1, p3, p4);
                w.Select(p2);
            });
        });
    }
    function viewOnOffInitialize(p0, p1, p2) {
        $('.' + p0).hide();
        $(document).ready(function () {
            setTimeout(function () {
                $('.' + p0).show();
                ViewsOnOff_Client_Initialize(p0, p1, p2);
            });
        });
    }
    function ViewList_Client(groupName, hiddenField, cssSelected, prefix) {
        this.CssSelected = cssSelected;
        this.GroupName = groupName;
        this.HiddenField = hiddenField;
        this.Prefix = prefix;
        var allViews = $('.' + groupName);
        var This = this;
        allViews.each(function (i) {
            var name = this.id + "_placeholder";
            var thisId = this.id;
            $('#' + thisId).before("<span style='display:none;' id='" + name + "'></span>");

            $('.' + thisId + "_checkbox").click(function () {
                if ($("." + thisId + "_checkbox")[0].checked)
                    This.Select(thisId, true);
                else
                    This.Select('', true);
            });

        });
        this.SelectionSet =  allViews.detach();
        this.SelectionSet.find('script').remove();
    }

    ViewList_Client.prototype = {
        HiddenField: null,
        GroupName: null,
        CssSelected: null,
        SelectionSet: null,
        Prefix: null,
        Release: function () {
            if (this.SelectionSet && this.SelectionSet.remove) this.SelectionSet.remove();
        },
        Select: function (target, internal) {
            $('.' + this.GroupName + '_button').removeClass(this.CssSelected);
            $('.' + this.GroupName + '_checkbox').each(function (i) { this.checked = false });
            $('.' + this.GroupName).detach();

            if (target == '') {
                document.getElementById(this.HiddenField).value = '';
                return;
            }
            document.getElementById(this.HiddenField).value = target;
            if (internal == null) target = this.Prefix + target;
            this.SelectionSet.filter('#' + target).insertBefore('#' + target + '_placeholder');

            $('.' + target + '_button').addClass(this.CssSelected);

            $('.' + target + '_checkbox').each(function (i) { this.checked = true });
        }
    }

    function ViewsOnOff_Client_Switch(groupName, on, hidden) {
        if (on) {
            $('.' + groupName + '_checkbox').each(function (i) { this.checked = true });
            var toAttach = pstatus[groupName + "_ViewsOnOff"];
            toAttach.each(function (i) {
                var currId = this.id;
                $(this).insertBefore('#' + currId + "_placeholder");
            });
            document.getElementById(hidden).value = "True";
        }
        else {
            $('.' + groupName + '_checkbox').each(function (i) { this.checked = false });
            $('.' + groupName).detach();
            document.getElementById(hidden).value = "False";
        }
    }

    function ViewsOnOff_Client_Initialize(groupName, initial_on, hidden) {
        var allViews = $('.' + groupName);
        allViews.each(function (i) {
            var prova = this.id;
            if (this.id == null || this.id == '') this.id = groupName + "_el" + i;
            var name = this.id + "_placeholder";
            var thisId = this.id;
            $('#' + this.id).before("<span style='display:none;' id='" + name + "'></span>");

            $('.' + groupName + "_checkbox").click(function (event) {
                ViewsOnOff_Client_Switch(groupName, event.target.checked, hidden);
            });
        });
        var selectionSet = allViews.detach();
        selectionSet.find('script').remove();
        var oldSet = pstatus[groupName + "_ViewsOnOff"];
        if (oldSet && oldSet.remove) oldSet.remove();
        pstatus[groupName + "_ViewsOnOff"] = selectionSet;
        if (initial_on) {
            $('.' + groupName + '_checkbox').each(function (i) { this.checked = true });
            selectionSet.each(function (i) {
                var currId = this.id;
                $(this).insertBefore('#' + currId + "_placeholder");
            });
        }
        else {
            $('.' + groupName + '_checkbox').each(function (i) { this.checked = false });
        }

    }
    ////////////Typed TextBox ////////////////
    var MvcControlsToolkit_DataType_String = 0;
    var MvcControlsToolkit_DataType_UInt = 1;
    var MvcControlsToolkit_DataType_Int = 2;
    var MvcControlsToolkit_DataType_Float = 3;
    var MvcControlsToolkit_DataType_DateTime = 4;

    function MvcControlsToolkit_Format(value, format, dataType, prefix, postfix) {
        if (dataType < 0)
            return value;
        if (value == null || value === undefined) return '';
        if (!prefix) prefix = '';
        if (!postfix) postfix = '';
        return prefix + MvcControlsToolkit_ToString(value, format, dataType) + postfix;
    }
    function MvcControlsToolkit_FormatDisplay(value, format, dataType, prefix, postfix, nullString) {
        if (dataType < 0)
            return value;
        if (value == null || value === '' || value === undefined) return nullString;
        return prefix + MvcControlsToolkit_ToString(value, format, dataType) + postfix;
    }
    function MvcControlsToolkit_ToString(value, format, dataType) {
        if (value === undefined) return undefined;
        if (dataType == MvcControlsToolkit_DataType_String || dataType < 0) {
            if (value === true) return "True";
            if (value === false) return "False";
            return value;
        }
        if (value == null) return '';
        if (format === '' || format === null || format === undefined) {
            if (dataType == MvcControlsToolkit_DataType_DateTime) {
                format = 'd';
            }
            else if (dataType == MvcControlsToolkit_DataType_Int ||
                dataType == MvcControlsToolkit_DataType_UInt) {
                format = 'd';
            }
            else if (dataType == MvcControlsToolkit_DataType_Float) {
                format = 'n';
            }
            else {
                return value;
            }

        }
        if ((typeof jQuery !== 'undefined') && (typeof jQuery.global !== 'undefined') && (typeof jQuery.global.parseInt === 'function')) {
            if (dataType == MvcControlsToolkit_DataType_DateTime && format == 's') format = 'S';
            return jQuery.global.format(value, format);
        }
        else if ((typeof Number !== 'undefined') && (typeof Number.parseLocale === 'function')) {
            if (dataType == MvcControlsToolkit_DataType_DateTime && format == 'S') format = 's';
            return value.localeFormat(format);
        }
        else {
            return value + '';
        }
    }
    function MvcControlsToolkit_Parse(value, dataType, formats) {
        if (dataType == MvcControlsToolkit_DataType_String) return value;
        if (value === undefined) return undefined;
        if (value == '') return null;
        if (dataType == MvcControlsToolkit_DataType_Float) {
            if ((typeof jQuery !== 'undefined') && (typeof jQuery.global !== 'undefined') && (typeof jQuery.global.parseFloat == 'function')) {
                return jQuery.global.parseFloat(value);
            }
            else if ((typeof Number !== 'undefined') && (typeof Number.parseLocale == 'function')) {
                return Number.parseLocale(value);
            }
            else {
                return parseFloat(value);
            }
        }
        else if (dataType == MvcControlsToolkit_DataType_DateTime) {
            if ((typeof jQuery !== 'undefined') && (typeof jQuery.global !== 'undefined') && (typeof jQuery.global.parseDate == 'function')) {
                return jQuery.global.parseDate(value, formats);
            }
            else if ((typeof Date !== 'undefined') && (typeof Date.parseLocale == 'function')) {
                return Date.parseLocale(value);
            }
            else {
                return new Date(value);
            }
        }
        else {
            if ((typeof jQuery !== 'undefined') && (typeof jQuery.global !== 'undefined') && (typeof jQuery.parseInt == 'function')) {
                return jQuery.global.parseInt(value);
            }
            else if (typeof Number.parseLocale == 'function') {
                var tFloat = Number.parseLocale(value);
                if (isNaN(tFloat)) return tFloat;
                return parseInt(tFloat + '');
            }
            else {
                return parseInt(value, 10);
            }
        }
    }

    function MvcControlsToolkit_TypedTextBox_Input(charCode, fieldId, companionId, dataType, decimalSeparator, digitSeparator, plus, minus) {

        if (dataType == MvcControlsToolkit_DataType_String || dataType == MvcControlsToolkit_DataType_DateTime ||
        charCode == 0 || charCode == 13 || charCode == 9 || charCode == 8 || charCode == digitSeparator.charCodeAt(0)
        || (charCode >= 48 && charCode <= 57)) return true;
        if ((dataType == MvcControlsToolkit_DataType_Int || dataType == MvcControlsToolkit_DataType_Float)
        && (charCode == plus.charCodeAt(0) || charCode == minus.charCodeAt(0))) {
            var value = document.getElementById(fieldId).value;
            return value.indexOf(plus) < 0 && value.indexOf(minus) < 0;
        }
        if (dataType == MvcControlsToolkit_DataType_Float && charCode == decimalSeparator.charCodeAt(0)) {
            var value = document.getElementById(fieldId).value;

            return value.indexOf(decimalSeparator) < 0;
        }
        return false;
    }
    function MvcControlsToolkit_FocusAtEnd(fieldId) {
        var el = document.getElementById(fieldId);
        if (el.setSelectionRange) /* DOM */ {

            el.setSelectionRange(el.value.length, el.value.length);

        }
        else if (this.createTextRange) /* IE */ {
            r = el.createTextRange();
            r.collapse(false);
            r.select();
        }
    }

    function MvcControlsToolkit_TypedTextBox_Focus(fieldId, companionId, watermarkCss) {
        var el = document.getElementById(fieldId);
        document.getElementById(fieldId).value = document.getElementById(companionId).value || '';
        $(el).data("_was_focused_", true);
        if (watermarkCss != '') $('#' + fieldId).removeClass(watermarkCss);
    }
    function MvcControlsToolkit_DisplayEdit_DbClick(fieldId, companionId) {
        $('#' + companionId).hide();
        $('#' + fieldId).show().focus();
    }
    var MvcControlsToolkit_TypedTextBox_Init, MvcControlsToolkit_DisplayEdit_Init;
    (function () {
        var JQueryMobileF = 'JQueryMobile';
        var JQueryUIF = 'JQueryUI';
        var BootstrapF = 'Bootstrap';
        function computeDefaultFramework() {
            var desk = jQuery.fn.datepicker;
            if (!desk) return jQuery.fn.datebox ? JQueryMobileF : 'none';
            return ($.datepicker && $.datepicker.parseDate) ? JQueryUIF : BootstrapF;
        }
        var defaultFramework = computeDefaultFramework();
        function setTextValue(date, field, dataType, format) {
            var value = '';
            if (date) {
                value = MvcControlsToolkit_Format(date, format, dataType);
            }
            field.trigger('pfocus');
            field.val(value);
            field.trigger('pblur');
        }
        function createPicker(jel, options, dataType, format, bootstrapFormat, dateboxFormat) {
            var dType = jel.attr('data-date-framework');
            if (!dType) {
                dType = defaultFramework;
                jel.attr('data-date-framework', dType);
            }
            if (dType == JQueryUIF) jel.datepicker(options);
            else if (dType == BootstrapF) {
                jel.attr('data-date-format', bootstrapFormat);
                jel.datepicker().on('changeDate', function (e) {
                    setTextValue(e.date, jel, dataType, format);
                })
                .on('hide', function (e) {
                    jel.trigger('pblur');
                })
                .on('show', function () {
                    jel.trigger('pfocus');
                    var val = MvcControlsToolkit_Parse(jel.val(), 4);
                    if (val && (val.getTime() != (jel.datepicker('getDate')).getTime())) jel.datepicker('setDate', val);
                });
            }
            else if (dType == JQueryMobileF) {
                var options = jel.attr('data-options');
                if (options) { jel.removeAttr('data-options'); options = $.parseJSON(options) }
                else options = {};
                if (!options.mode) options.mode = 'calbox';
                options.overrideDateFormat = dateboxFormat;
                options.closeCallback = function (date) {
                    jel.trigger('pblur');
                };
                options.openCallback = function () {
                    jel.trigger('pfocus');
                };
                jel.datebox(options);
                return false;
            }
            return true;
        }
        MvcControlsToolkit_TypedTextBox_Init = function(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {

            $(document).ready(function () {
                var tTb = $('#' + p0);

                tTb.bind('pblur', function () {
                    MvcControlsToolkit_TypedTextBox_Blur(p0, p1, p3, p8, p9, p10, p6, p7, p4, p5,
                               p11, p2, p12); return false;
                });
                tTb.bind('pfocus', function () {
                    MvcControlsToolkit_TypedTextBox_Focus(p0, p1, p2);
                    return false;
                });

                try {
                    tTb.trigger('pfocus');
                    MvcControlsToolkit_TypedTextBox_Blur(p0, p1, p3, p8, p9, p10, p6, p7, p4, p5,
                               p11, p2, p12, true);
                }
                catch (ex) { }
                if (p13 != null) createPicker(tTb, p13, p3, p10, p14, p15);


                tTb.focus(function () { tTb.trigger('pfocus'); MvcControlsToolkit_FocusAtEnd(p0); return true; });
                var blurActive = true;
                if (p13 != null) blurActive = createPicker(tTb, p13, p3, p10, p14, p15);
                //if (p13 != null) tTb.datepicker();
                if (blurActive) {
                    tTb.blur(function () {
                        tTb.trigger('pblur');
                        return true;
                    });
                }


                tTb.keypress(function (event) {
                    return MvcControlsToolkit_TypedTextBox_Input(event.which, p0, p1, p3, p4, p5, p6, p7);
                });

            });
        }
        MvcControlsToolkit_DisplayEdit_Init = function(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17) {
            $(document).ready(function () {
                var tTb = $('#' + p0);
                if (tTb.data('data-c-processed')) return;
                else tTb.data('data-c-processed', true);
                var blurActive = true;
                if (p13 != null) blurActive = createPicker(tTb, p13, p2, p9, p16, p17);
                tTb.bind('pblur', function (e, data) {
                    var res = MvcControlsToolkit_DisplayEdit_Blur(p0, p1, p2, p7, p8, p9, p5, p6, p3, p4,
                               p10, p12, p14, !p11 && !data, p15);
                    if (data) data["goneDisplay"] = res;
                    return false;
                });
                try {
                    tTb.trigger('pblur');
                }
                catch (ex) { }
                if (blurActive) tTb.blur(function () { tTb.trigger('pblur'); return true; });
                if (p11 == 'click') {
                    $('#' + p1).click(function () {
                        MvcControlsToolkit_DisplayEdit_DbClick(p0, p1);
                        return true;
                    });
                }
                else if (p11 == 'dblclick') {

                    $('#' + p1).dblclick(function () {
                        MvcControlsToolkit_DisplayEdit_DbClick(p0, p1);
                        return true;
                    });
                }
                $('#' + p1).bind("pedit", function () {
                    MvcControlsToolkit_DisplayEdit_DbClick(p0, p1);
                    return true;
                });
                tTb.keypress(function (event) {
                    return MvcControlsToolkit_TypedTextBox_Input(event.which, p0, p1, p2, p3, p4, p5, p6);
                });

            });
        }
        
    })();
    function MvcControlsToolkit_TypedTextBox_Blur(
    fieldId, companionId, dataType,
    pre, post, format, plus, minus, decimalSeparator, digitSeparator,
    watermark, watermarkCss, validationType, jumpValidation) {
        var fieldElement = document.getElementById(fieldId);
        if (fieldElement == null) return;
        var jFieldElement = $(fieldElement);
        if (!jFieldElement.data("_was_focused_")) jFieldElement.trigger('pfocus');
        jFieldElement.removeData("_was_focused_");
        var value = fieldElement.value;

        var innerValue = value;
        if (dataType != MvcControlsToolkit_DataType_String && dataType != MvcControlsToolkit_DataType_DateTime) {
            value = MvcControlsToolkit_Trim(value);
            innerValue = value;
            var tValue = value;
            tValue = tValue.replace(digitSeparator, '');
            tvalue = tValue.replace(plus, '');
            negative = tValue.indexOf(minus);
            tValue = tValue.replace(minus, '');
            var toBuild = '';
            var charCode = '';
            for (var i = 0; i < tValue.length; i++) {
                charCode = tValue.charCodeAt(i);
                if ((charCode >= 48 && charCode <= 57) || charCode == decimalSeparator.charCodeAt(0)) {
                    toBuild = toBuild + tValue.charAt(i);
                }
            }
            tValue = toBuild;
            if (value != '') {
                var nValue = 0;
                try {
                    nValue = MvcControlsToolkit_Parse(tValue, dataType);
                    if (negative >= 0) nValue = nValue * -1;
                    if (!isNaN(nValue)) {
                        value = MvcControlsToolkit_Format(nValue, format, dataType);
                        if (dataType == MvcControlsToolkit_DataType_Float) {
                            if (negative >= 0) innerValue = minus + tValue;
                            else innerValue = tValue;
                        }
                        else
                            innerValue = MvcControlsToolkit_Format(nValue, 'n0', dataType);
                    }
                }
                catch (e) {
                }

            }
        }
        if (dataType == MvcControlsToolkit_DataType_DateTime) {
            innerValue = innerValue ? MvcControlsToolkit_Format(MvcControlsToolkit_Parse(innerValue, dataType) || MvcControlsToolkit_Parse(innerValue, dataType, [format || 'd']), format, dataType)
                : '';
            value = innerValue;
        }
        document.getElementById(companionId).value = innerValue;
        if (innerValue) $("#" + fieldId).data("_was_hit_", true);
        if (jumpValidation == null && $('#' + fieldId).data("_was_hit_")) {
            MvcControlsToolkit_Validate(companionId, validationType);
            $('#' + companionId).trigger('vblur');
        }

        $('#' + fieldId).removeClass('input-validation-error');
        if ($('#' + companionId).hasClass('input-validation-error')) {
            $('#' + fieldId).addClass('input-validation-error');
        }

        if (value == '') {
            if (watermarkCss != '') $('#' + fieldId).addClass(watermarkCss);
            document.getElementById(fieldId).value = watermark;
        }
        else {
            document.getElementById(fieldId).value = pre + value + post;
        }

        $('#' + fieldId).trigger('TypedTextBox_Changed');

    }

    function MvcControlsToolkit_DisplayEdit_Blur(
    fieldId, companionId, dataType,
    pre, post, format, plus, minus,
    decimalSeparator, digitSeparator, validationType, nullDisplayText, inputType, noBack, dynamicTitle) {
        var fieldElement = document.getElementById(fieldId);
        if (fieldElement == null) return;
        var value = fieldElement.value;
        if (inputType == "select") {
            value = $(fieldElement).find('option:selected').text();
        }
        var innerValue = value;
        if (dataType != MvcControlsToolkit_DataType_String && dataType != MvcControlsToolkit_DataType_DateTime) {
            value = MvcControlsToolkit_Trim(value);
            innerValue = value;
            var tValue = value;
            tValue = tValue.replace(digitSeparator, '');
            tvalue = tValue.replace(plus, '');
            negative = tValue.indexOf(minus);
            tValue = tValue.replace(minus, '');
            var toBuild = '';
            var charCode = '';
            for (var i = 0; i < tValue.length; i++) {
                charCode = tValue.charCodeAt(i);
                if ((charCode >= 48 && charCode <= 57) || charCode == decimalSeparator.charCodeAt(0)) {
                    toBuild = toBuild + tValue.charAt(i);
                }
            }
            tValue = toBuild;
            if (value != '') {
                var nValue = 0;
                try {
                    nValue = MvcControlsToolkit_Parse(tValue, dataType);
                    if (negative >= 0) nValue = nValue * -1;
                    if (!isNaN(nValue)) {
                        value = MvcControlsToolkit_Format(nValue, format, dataType);
                        if (dataType == MvcControlsToolkit_DataType_Float) {
                            if (negative >= 0) innerValue = minus + tValue;
                            else innerValue = tValue;
                        }
                        else
                            innerValue = MvcControlsToolkit_Format(nValue, 'n0', dataType);
                    }
                }
                catch (e) {
                }

            }
        }
        if (dataType == MvcControlsToolkit_DataType_DateTime) {
            innerValue = innerValue ? MvcControlsToolkit_Format(MvcControlsToolkit_Parse(innerValue, dataType) || MvcControlsToolkit_Parse(innerValue, dataType, [format || 'd']), format, dataType)
                : '';
            value = innerValue;
        }
        if (inputType == "select") {
        }
        else {
            fieldElement.value = innerValue;
        }

        if (MvcControlsToolkit_Validate(fieldId, validationType) && !noBack) {
            $('#' + fieldId).hide();
            $('#' + companionId).show();

            if (value == '') {
                if (nullDisplayText == '')
                    $('#' + companionId).html('&nbsp;&nbsp;&nbsp;');
                else
                    $('#' + companionId).text(nullDisplayText);
                if (dynamicTitle) $('#' + companionId).attr('title', '');
            }
            else {
                $('#' + companionId).text(pre + value + post);
                if (dynamicTitle) $('#' + companionId).attr('title', pre + value + post);
            }
            $('#' + fieldId).trigger('TypedEditDisplay_Changed');
            return true;
        }
        else {
            $('#' + fieldId).show();
            $('#' + companionId).hide();
            $('#' + fieldId).trigger('TypedEditDisplay_Changed');
            return false;
        }

    }

    function MvcControlsToolkit_EditDisplayButton(idButton, containersSelector, goToDisplayText, goToEditText, changeStateCallback) {
        var jMe = $(idButton);
        var state = jMe.data("_editDisplayState_") || { display: false, jElements: jMe.parents(containersSelector).first().find('[data-element-type=TypedEditDisplay]') };
        var me = jMe[0];
        function goToDisplay(elements) {
            var ok = true;
            elements.each(function () {
                var res = { goneDisplay: false };
                $(this).trigger('pblur', res);
                if (!res.goneDisplay) ok = false;
            });
            return ok;
        }
        function setButton(bt, txt) {

            var tag = bt.tagName.toLowerCase();
            if (tag == 'a') {
                $(bt).text(txt);
            }
            else if (tag == 'img') {
                $(bt).attr('src', txt);
            }
            else {
                $(bt).val(txt);
            }

        }
        function goToEdit(elements) {
            elements.each(function () {
                $('#' + $(this).attr('id') + '_display').trigger('pedit');
            });
        }
        function applyCallback(elements, state, callback) {
            if (!callback) return;
            elements.each(function () {
                callback(this, state);
            });
        }
        if (state.display) {
            goToEdit(state.jElements);
            setButton(me, goToDisplayText);
            state.display = false;
            applyCallback(state.jElements, 'goneEdit', changeStateCallback);
        }
        else {
            res = goToDisplay(state.jElements);
            if (res) {
                setButton(me, goToEditText);
                state.display = true;
                applyCallback(state.jElements, 'goneDisplay', changeStateCallback);
            }
            else {
                goToEdit(state.jElements);
                applyCallback(state.jElements, 'failedGoneEdit', changeStateCallback);
            }
        }
        $(me).data("_editDisplayState_", state);

    }
    function MvcControlsToolkit_TypedInput_Load(value, field) {
        var field = $(field);
        field.trigger('pfocus');
        field.val(value);
        field.trigger('pblur');
    }



    //////////////////////////Timer/////////////////////
    function MvcControlsToolkit_AjaxLink(url, targetId, mode, afterSuccess) {
        $.ajax({
            type: 'GET',
            url: url,
            success: function (data) {
                if (mode == 0) $('#' + targetId).html(data);
                else if (mode == -1) $('#' + targetId).before(data);
                else if (mode == 1) $('#' + targetId).after(data);
                if (afterSuccess) afterSuccess($('#' + targetId));
            }
        });
    }
    function MvcControlsToolkit_AjaxSubmit(validationType, elementId) {
        if (!MvcControlsToolkit_FormIsValid(elementId, validationType)) return;

        $('#' + elementId).parents('form').submit();
    }
    /////////////////////////DropDowns/////////////////////////////
    function MvcControlsToolkit_UpdateDropDownOptions(url, jTarget, prompt, optionsCss, optGroupsCss, callBack) {
        $.getJSON(url, function (data) {
            var items = [];
            var createOption = function (val, text) {
                var currCss = null;
                if (typeof (optionsCss) == "function") currCss = optionsCss(val);
                else currCss = optionsCss;
                items.push("<option value ='" + val + "' " + (currCss == null ? "" : "class = '" + currCss + "' ") + ">" + text + "</option>");
            };
            var createOptgroup = function (label, options, val) {
                var currOptCss = null;
                if (typeof (optGroupsCss) == "function") currOptCss = optGroupsCss(val);
                else currOptCss = optGroupsCss;
                items.push("<optgroup label ='" + label + "' " + (currOptCss == null ? "" : "class = '" + currOptCss + "' ") + ">");
                for (var i = 0; i < options.length; i++) {
                    createOption(options[i].Value, options[i].Text);
                }
                items.push("</optgroup>");
            };
            if (prompt != null) createOption('', prompt);
            $.each(data, function (index, item) {
                if ("Group" in item) {
                    if ("Value" in item) createOptgroup(item.Text, item.Group, item.Value);
                    else createOptgroup(item.Text, item.Group, item.Text);
                }
                else createOption(item.Value, item.Text);
            });
            jTarget.html(items.join(''));
            if (callBack != null && typeof (callBack) == "function") callBack(jTarget);
        });
    }
    /////////////////////////Hover menu/////////////////////////////
    $(document).ready(function () {
        $(document).on('mouseover', '.MvcControlsToolkit-Hover', function (e) {
            $(this).addClass('MvcControlsToolkit-Hover-On');
        });
        $(document).on('mouseleave', '.MvcControlsToolkit-Hover', function (e) {
            // Do not close if going over to a select element
            if (e.target.tagName.toLowerCase() == 'select') return;
            $(this).removeClass('MvcControlsToolkit-Hover-On');
            $(this).find('select').trigger('blur');
        });

    });
    //////////////Unobtrusive Parsing///////////////////////////
    var MvcControlsToolkit_ParseRegister = (function () {
        var allParsers = [];
        var needInit = false;
        return {
            add: function (parser, initialize) {
                allParsers.push({ f: parser, i: initialize });
                if (initialize) needInit = true;
            },
            parse: function (selector) {
                for (i = 0; i < allParsers.length; i++) {
                    allParsers[i].f(selector);
                }
            },
            init: function () {
                if (needInit) {
                    for (i = 0; i < allParsers.length; i++) {
                        if (allParsers[i].i) allParsers[i].f();
                    }
                }
            }
        };

    })();
    //////
    dualselect.set = function (element, newValue, formatString, valueType) {
        var node = document.getElementById(element.id + DualSelect_Postfix + DualSelect_SelectAvial);
        var dnode = document.getElementById(element.id + DualSelect_Postfix + DualSelect_SelectSelected);
        if (node == null || dnode == null) {
            setTimeout(function () { dualselect.set(element, newValue, formatString, valueType); }, 0);
            return;
        }
        var dType = $(element).attr('data-item-type');
        if (dType) dType = parseInt(dType);
        valueType = dType || valueType;
        DualSelect_MoveAll(element.id + DualSelect_Postfix, false, true);
        if (newValue instanceof Array && node.options.length > 0) {
            var typedArray = new Array();
            for (var i = 0, j = node.length; i < j; i++) {
                typedArray.push(MvcControlsToolkit_Parse(node.options[i].value, valueType));
                node.options[i].selected = false;
            }
            for (var i = 0, n = newValue.length; i < n; i++) {

                if (valueType == MvcControlsToolkit_DataType_Float) {
                    var selectedIndex = 0;
                    var bestError = Math.abs(newValue[i] - typedArray[0]);
                    for (var j = 1, l = typedArray.length; j < l; j++) {
                        if (Math.abs(typedArray[j] - newValue[i]) < bestError) {
                            selectedIndex = j;
                            bestError = Math.abs(typedArray[j] - newValue[i]);
                        }
                    }
                    if (selectedIndex >= 0) {
                        var onode = node.options[selectedIndex];
                        node.options.remove(selectedIndex);
                        typedArray.remove(selectedIndex);
                        dnode.options.add(onode);
                    }
                }
                else {
                    for (var j = 0, l = typedArray.length; j < l; j++) {
                        if (typedArray[j] === newValue[i]) {
                            var onode = node.options[j];
                            node.options.remove(j);
                            typedArray.remove(j);
                            dnode.options.add(onode);
                            break;
                        }
                    }
                }
            }
            DualSelect_SaveSelection(element.id + DualSelect_Postfix);

        }
    };

    dualselect.setString = function (element, newValue) {
        dualselect.set(element, newValue, null, MvcControlsToolkit_DataType_String);
    };
    dualselect.get = function (element, valueType) {
        var dType = $(element).attr('data-item-type');
        if (dType) dType = parseInt(dType);
        valueType = dType || valueType;
        var node = document.getElementById(element.id + DualSelect_Postfix + DualSelect_SelectSelected);
        if (node == null) {
            setTimeout(function () { dualselect.get(element, valueType); }, 0);
            return;
        }
        var typedArray = new Array();
        for (var i = 0, j = node.length; i < j; i++) {
            typedArray.push(MvcControlsToolkit_Parse(node.options[i].value, valueType));
        }
        return typedArray;
    };
    dualselect.getString = function (cnode) {
        return dualselect.get(cnode, MvcControlsToolkit_DataType_String);
    };

    var clientPager = mvcct.widgets.ClientPager = {};

    clientPager.get = function (source, valueType) {
        return parseInt($(source).val());
    };
    clientPager.getString = function (source) {
        return $(source).val();
    };
    clientPager.getById = function (id, valueType) {
        return parseInt($('#' + id).val());
    };
    clientPager.set = function (source, value, format, valueType) {
        $(source).val(value);
        MvcControlsToolkit_RefreshPager(source.id);
    };
    clientPager.setById = function (id, value, format, valueType) {
        $('#' + id).val(value);
        MvcControlsToolkit_RefreshPager(id);
    };
    clientPager.setString = function (source, value) {
        $(source).val(value);
        MvcControlsToolkit_RefreshPager(source.id);
    };
    clientPager.bindChange = function (id, handler) {
        $("#" + id).bind("ClientPager_Changed", handler);
    };
    clientPager.unbindChange = function (id, handler) {
        $("#" + id).unbind("ClientPager_Changed", handler);
    };
    var typedTextBox = mvcct.widgets.TypedTextBox = {};
    var typedEditDisplay = mvcct.widgets.TypedEditDisplay = {};
    typedTextBox.bindChange = function (id, handler) {
        $("#" + id + "_hidden").bind("TypedTextBox_Changed", handler);
    };
    typedTextBox.unbindChange = function (id, handler) {
        $("#" + id + "_hidden").unbind("TypedTextBox_Changed", handler);
    };
    typedEditDisplay.bindChange = function (id, handler) {
        $("#" + id).bind("TypedEditDisplay_Changed", handler);
    };
    typedEditDisplay.unbindChange = function (id, handler) {
        $("#" + id).unbind("TypedEditDisplay_Changed", handler);
    };
    typedTextBox.setString = function (field, value) {
        var field = $(field);
        field.trigger('pfocus');
        field.val(value);
        field.trigger('pblur');
    };
    typedTextBox.getString = function (source) {
        var companionId = source.id.substring(0, source.id.lastIndexOf("_"));
        return $('#' + companionId).val();
    };
    typedTextBox.set = function (source, value, format, valueType) {
        var field = $(source);
        if (!valueType) valueType = parseInt(field.attr("data-client-type"));
        var companionId = source.id.substring(0, source.id.lastIndexOf("_"));
        var companion = $('#' + companionId);
        if (companion.length == 0) {
            var retry = function () { typedTextBox.set(source, value, format, valueType); };
            setTimeout(retry, 0);
            return;
        }
        var value = MvcControlsToolkit_Format(value, format, valueType, '', '');
        companion.val(value);
        field.val(value);
        field.trigger('pfocus');
        field.trigger('pblur');

    };
    typedTextBox.setById = function (id, value, format, valueType) {
        var field = $('#' + id + '_hidden');
        if (!valueType) valueType = parseInt(field.attr("data-client-type"));
        var companion = $('#' + id);
        var value = MvcControlsToolkit_Format(value, format, valueType, '', '');
        companion.val(value);
        field.val(value);
        field.trigger('pfocus');
        field.trigger('pblur');
    };
    typedTextBox.get = function (source, valueType) {
        var companionId = source.id.substring(0, source.id.lastIndexOf("_"));
        return MvcControlsToolkit_Parse($('#' + companionId).val(), valueType);
    };
    typedTextBox.getById = function (id, valueType) {
        return MvcControlsToolkit_Parse($('#' + id).val(), valueType);
    };
    typedEditDisplay.setString = function (field, value) {
        var field = $(field);
        field.val(value);
        field.trigger('pblur');
    };
    typedEditDisplay.getString = function (source) {
        return $(source).val();
    };
    typedEditDisplay.set = function (source, value, format, valueType) {
        var field = $(source);
        if (!valueType) valueType = parseInt(field.attr("data-client-type"));
        $(source).val(MvcControlsToolkit_Format(value, format, valueType, '', ''));
        field.trigger('pblur');

    };
    typedEditDisplay.setById = function (id, value, format, valueType) {
        var field = $('#' + id);
        if (!valueType) valueType = parseInt(field.attr("data-client-type"));
        field.val(MvcControlsToolkit_Format(value, format, valueType, '', ''));
        field.trigger('pblur');

    };
    typedEditDisplay.get = function (source, valueType) {
        return MvcControlsToolkit_Parse($(source).val(), valueType);
    };
    typedEditDisplay.getById = function (id, valueType) {
        return MvcControlsToolkit_Parse($('#' + id).val(), valueType);
    };
    //////////////////////////Display Field ////////////
    var displayField = mvcct.widgets.DisplayField = {};
    displayField.setString = function (field, value) {
        return;
    };
    displayField.getString = function (field) {
        return $('#' + field.id).data('_True');
    }
    //////
    basic.refreshWidget = MvcControlsToolkit_RefreshWidget;
    basic.pageButtonClick = PageButton_Click;
    basic.initJsonPager = MvcControlsToolkit_InitJsonPager;
    basic.sortHandler = Sort_Handler;
    basic.viewListClient = ViewList_Client;
    basic.viewsOnOffClientInitialize = ViewsOnOff_Client_Initialize;
    basic.viewListInitialize = viewListInitialize;
    basic.viewOnOffInitialize = viewOnOffInitialize;
    basic.typedTextBoxInit = MvcControlsToolkit_TypedTextBox_Init;
    basic.displayEditInit = MvcControlsToolkit_DisplayEdit_Init;
    basic.typedInputLoad = MvcControlsToolkit_TypedInput_Load;
    basic.editDisplayButton = MvcControlsToolkit_EditDisplayButton;
    basic.timerLink = MvcControlsToolkit_AjaxLink;
    basic.timerSubmit = MvcControlsToolkit_AjaxSubmit;

    mvcct.widgets.ajaxDropDown = {};
    mvcct.widgets.ajaxDropDown.update = MvcControlsToolkit_UpdateDropDownOptions;

    dualselect.filterInit = DualSelect_FilterInit;
    dualselect.moveElement = DualSelect_MoveElement;
    dualselect.moveUp = DualSelect_Move_Up;
    dualselect.moveDown = DualSelect_Move_Down;
    dualselect.moveAll = DualSelect_MoveAll;

    manipulationButton.remove = ManipulationButtonRemove;
    manipulationButton.hide = ManipulationButtonHide;
    manipulationButton.show = ManipulationButtonShow;
    manipulationButton.custom = ManipulationButtonCustom;
    manipulationButton.resetGrid = ManipulationButtonResetGrid;
    manipulationButton.click = ManipulationButton_Click;

    mvcct.events.changeData = MvcControlsToolkit_changeData;

    textf.trim = MvcControlsToolkit_Trim;
    textf.globalEvalScriptAndDestroy = GlobalEvalScriptAndDestroy;
    textf.collectScriptAndDestroy = CollectScriptAndDestroy;
    textf.collectAllScriptsInelement = CollectAllScriptsInelement;

    unobtrusivef.validate = MvcControlsToolkit_Validate;
    unobtrusivef.formIsValid = MvcControlsToolkit_FormIsValid;
    unobtrusivef.prepareAjaxFormClientValidation = Setup_Ajax_ClientValidation;
    unobtrusivef.parseRegister = MvcControlsToolkit_ParseRegister;

    globalizef.dateTimeToDate = MvcControlsToolkit_DateTimeToDate;
    globalizef.stringType = MvcControlsToolkit_DataType_String;
    globalizef.intType = MvcControlsToolkit_DataType_Int;
    globalizef.uintType = MvcControlsToolkit_DataType_UInt;
    globalizef.floatType = MvcControlsToolkit_DataType_Float;
    globalizef.dateTimeType = MvcControlsToolkit_DataType_DateTime;
    globalizef.tostring = MvcControlsToolkit_ToString;
    globalizef.format = MvcControlsToolkit_Format;
    globalizef.formatDisplay = MvcControlsToolkit_FormatDisplay;
    globalizef.parse = MvcControlsToolkit_Parse;

    mvcct.widgets.updateDropDownOptions = MvcControlsToolkit_UpdateDropDownOptions;

    $(document).ready(function () {
        MvcControlsToolkit_ParseRegister.init();
    });
})(jQuery);

