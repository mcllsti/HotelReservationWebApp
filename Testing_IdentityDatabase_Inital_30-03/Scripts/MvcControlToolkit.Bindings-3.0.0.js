/* ****************************************************************************
*  MvcControlToolkit.Bindings-3.0.0.js
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
///////////////////////ClientViewModel Methods definition//////////
(function($){
    var mvcct = window["mvcct"] = window["mvcct"] || {};
    var ko = window.ko;
    mvcct.utils = mvcct["utils"] || {};
    mvcct.core = mvcct["core"] || {};
    mvcct.basicKo = mvcct["basicKo"] || {};
    var widgets = mvcct.widgets;
    var MvcControlsToolkit_DataType_String = mvcct.globalize.stringType;
    var MvcControlsToolkit_DataType_Float = mvcct.globalize.floatType;
    var MvcControlsToolkit_DataType_DateTime = mvcct.globalize.dateTimeType;
    var MvcControlsToolkit_Parse = mvcct.globalize.parse;
    (function () {
        var results = [];
        var stack = [];
        var mNames = {};
        mvcct.core.resetModuleResults = function (names) {
            stack.push({ results: results, mNames: mNames });
            results = [];
            mNames = {};
            if (names) {
                for (var i = 0; i < names.length; i++) mNames[names[i]] = i;
            }
        };
        mvcct.core.moduleResult = function (x) {
            results.push(x);
        };
        mvcct.core.withIncludedModules = function (x) {
            var myParams = results;
            var myNames = mNames;
            if (myParams) myParams.push(myNames);
            var res = stack.pop();
            results = res.results;
            mNames = res.mNames;
            if (mvcct.utils.isFunction(x)) {
                return x.apply(this, myParams);
            }
        };
        mvcct.core.defaultModuleRouting = function (vm, viewname, args) {
            if (!args) return null;
            var names = args[args.length - 1];
            if (names) {
                var context = mvcct.ko.dynamicTemplates.getContext(vm);
                vprefix = context ? context.vprefix : '';
                if (vprefix) vprefix = vprefix.replace(/\//g, '_') + '_';
                var index = names[(vprefix || '') + viewname];
                if (index === 0 || index) {
                    var res = args[index];
                    if (mvcct.utils.isFunction(res)) return res(vm);
                    else return res;
                }
                else return null;
            }
        };
    })();
    (function () {
        var baseTemplate = "RS_23459_86745_ZU";
        var counter = 0;
        var dictionary = {};
        mvcct.utils.uniqueTags = {};
        mvcct.utils.uniqueTags.reset = function () {
            counter = 0;
            dictionary = {};
        };

        mvcct.utils.uniqueTags.newTag = function (path) {
            var res = 0;
            if (path) {
                res = dictionary[path] || 0;
                dictionary[path] = res + 1;
            }
            else {
                res = counter;
                counter++;
            }
            return res;
        };
        mvcct.utils.uniqueTags.adjustId = function (id, data, verify) {
            if (!id) return id;
            if (id.indexOf(baseTemplate) != 0) {
                //var ind = verify.lastIndexOf("_");
                //if (ind < 0) return id;
                //var start = verify.substring(0, ind + 1);
                //if (id.indexOf(start) != 0) return id;
                //id = id.substring(ind+3);
                return id;
            }
            else {
                id = id.substring(baseTemplate.length);
                var ind = id.indexOf("_A");
                if (ind < 0) return id;
                id = id.substring(ind + 2);
            }
            var att = MvcControlsToolkit_TemplateId({ ItemPrefix: '' }, data);
            if (verify.indexOf(att) != 0) att = MvcControlsToolkit_TemplateId({ SingleD: true, ItemPrefix: '' }, data);
            return att + id;
        };

        var delayedExecutionTop = null;
        var oldReady = null;
        mvcct.utils.handleTimingOpen = function () {
            delayedExecutionTop = [];
            var newReady = function (x) {
                delayedExecutionTop.push(x);
            };
            var oldReady = jQuery.fn.ready;
            jQuery.fn.ready = newReady;
        }
        mvcct.utils.handleTimingClose = function () {
            if (oldReady) jQuery.fn.ready = oldReady;
            if (delayedExecutionTop) for (var i = 0; i < delayedExecutionTop.length; i++) delayedExecutionTop[i]();
        }
    })();
    function MvcControlsToolkit_ClientViewModel_Init(viewModel, jsonHiddenId, validationType) {
        viewModel.save = function () {
            document.getElementById(jsonHiddenId).value = mvcct.utils.stringify(ko.mapping.toJS(this));
        };
        viewModel.validateAndSave = function () {
            if (mvcct.unobtrusive.formIsValid(jsonHiddenId, validationType)) {
                document.getElementById(jsonHiddenId).value = ko.mapping.toJSON(this);
                return true;
            }
            return false;
        }
        viewModel.saveAndSubmit = function () {
            if (this.validateAndSave()) {
                $('#' + jsonHiddenId).parents('form').submit();
            }
        };
        viewModel.saveAndSubmitAlone = function (formId) {
            if (mvcct.unobtrusive.formIsValid(formId, validationType)) {
                this.save();
                $('#' + jsonHiddenId).parents('form').submit();
            }
        }
        $(document).ready(function () {
            $('#' + jsonHiddenId).parents('form').submit(function () {
                if (mvcct.unobtrusive.formIsValid(jsonHiddenId, validationType)) {
                    if (mvcct["clientsubmit"]) {
                        mvcct.clientsubmit.execute();
                    }
                    viewModel.save();
                }
                return true;
            });
        });
    }
    ///////////////////////Template Names//////////////////////////////


    function MvcControlsToolkit_NewTemplateName(item, data, direct) {
        var canOverride = !data.ModelPrefix || (!data._cachedView_ && (!data._oldValue_ || !data._oldValue_().up));
        if (canOverride) {
            data.ModelId = item.ModelId;
            data.ModelPrefix = item.ModelPrefix;
            data._tag = undefined;
        }
        data.ModelId = ko.utils.unwrapObservable(data.ModelId);
        data.ModelPrefix = ko.utils.unwrapObservable(data.ModelPrefix);
        if (item.Single) data._tag = (data._tag === undefined) ? -1 : data._tag;
        else {
            if (data._tag === undefined) {
                data._tag = mvcct.utils.uniqueTags.newTag(direct ? null : data.ModelId);
            }
        }
        data._tag = ko.utils.unwrapObservable(data._tag);
        if (!data._inserted) data._inserted = ko.observable(false);
        if (!data._modified) data._modified = ko.observable(false);
        return "";
    }
    function MvcControlsToolkit_TemplateName(item, data) {
        return data._tag < 0 && !item.SingleD ?
                data.ModelPrefix :
                (item.SingleD ? (data._tag > -1 ? data.ModelPrefix + "_detail[" + data._tag + "]" : data.ModelPrefix + "_detail") :
                 data.ModelPrefix + "[" + data._tag + "]" + item.ItemPrefix);
    }
    function MvcControlsToolkit_TemplateId(item, data) {
        return data._tag < 0 && !item.SingleD ?
                 data.ModelId :
                (item.SingleD ? (data._tag > -1 ? data.ModelId + "_detail_" + data._tag + "_" : data.ModelId + "_detail") :
                data.ModelId + "_" + data._tag + "_" + item.ItemPrefix);
    }
    ///////////////////////////Templates/////////////////////////////
    function MvcControlsToolkit_InitializeCreatedNodes(elements, unobtrusiveValidation, noJavaScript, applyValidation, func) {
        if (elements == null || noJavaScript) return;
        for (var i = 0; i < elements.length; i++) {
            var currEl = elements[i];
            if (currEl.nodeType == 1 &&
                (!$(currEl).data('isCached')) &&
                unobtrusiveValidation &&
                applyValidation) jQuery.validator.unobtrusive.parseExt(currEl);
        }
        if (func) func();
    }

    MvcControlsToolkit_ServerErrors_Last = null;
    mvcct.basicKo.serverErrorsLast = null;
    mvcct.utils.keepServerErrors = true;
    function MvcControlsToolkit_ServerErrors(elements, detailname, newprefix) {
        MvcControlsToolkit_ServerErrors_Last = mvcct.basicKo.serverErrorsLast;
        if (!elements) elements = MvcControlsToolkit_ServerErrors_Last;
        if (!elements) return;
        MvcControlsToolkit_ServerErrors_Last = [];
        if (!newprefix && detailname) newprefix = detailname + "_detail"
        var ToApply = function () {
            for (var i = 0; i < elements.length; i++) {
                var currElement = elements[i];
                if (currElement == '') continue;
                var currId = currElement.id;
                var currName = currElement.name;
                if (detailname) {
                    if (currName.length > detailname.length && currName.charAt(detailname.length) == '[') {
                        currName = currName.slice(detailname.length);
                        currName = newprefix + currName;
                    }
                    else {
                        currName = currName.slice(detailname.length);
                        currName = newprefix + currName;
                    }
                    currId = mvcct.utils.idFromName(currName)
                }
                var currDom = $('#' + currId);
                if (currDom.length == 0 || mvcct.utils.keepServerErrors) {
                    MvcControlsToolkit_ServerErrors_Last.push(currElement);
                    if (currDom.length == 0) continue;
                }
                if (detailname) {
                    currElement.detailId = currId;
                    currElement.detailName = currName;
                }
                var currForm = currDom.parents('form').first();
                if (currForm.length == 0) continue;

                if (!currDom.hasClass('input-validation-error'))
                    currDom.addClass('input-validation-error');
                var attr = currDom.attr('data-companionpostfix');
                if (typeof attr !== 'undefined' && attr !== false) {
                    var companion = $('#' + currId + attr);
                    if (companion.length > 0 && !companion.hasClass('input-validation-error'))
                        companion.addClass('input-validation-error');
                }
                else if (currDom.attr("data-element-type") == "TypedEditDisplay") {
                    $('#' + currId + "_display").hide();
                    $('#' + currId).show();
                }
                else if (!mvcct.utils.keepServerErrors && currDom.attr("type") == "hidden") MvcControlsToolkit_ServerErrors_Last.push(currElement);
                var currDisplay = $(currForm).find("[data-valmsg-for='" + currName + "']");
                if (currDisplay.length > 0) {
                    currDisplay.removeClass("field-validation-valid").addClass("field-validation-error");
                    var replace = $.parseJSON(currDisplay.attr("data-valmsg-replace")) !== false;
                    if (replace) {
                        currDisplay.empty();
                        $(currElement.errors[0]).appendTo(currDisplay);
                    }
                }
            }
            mvcct.basicKo.serverErrorsLast = MvcControlsToolkit_ServerErrors_Last;
        };
        setTimeout(ToApply, 0);
    }

    (function () {
        var mappingProperty = "__ko_mapping__";
        var defaultOptions;
        var _defaultOptions = {
            include: ["_destroy"],
            ignore: [],
            copy: []
        };
        function fillOptions(options, otherOptions) {
            options = options || {};

            // Is there only a root-level mapping present?
            if ((options.create instanceof Function) || (options.update instanceof Function) || (options.key instanceof Function) || (options.arrayChanged instanceof Function)) {
                options = {
                    "": options
                };
            }

            if (otherOptions) {
                options.ignore = mergeArrays(otherOptions.ignore, options.ignore);
                options.include = mergeArrays(otherOptions.include, options.include);
                options.copy = mergeArrays(otherOptions.copy, options.copy);
            }
            options.ignore = mergeArrays(options.ignore, defaultOptions.ignore);
            options.include = mergeArrays(options.include, defaultOptions.include);
            options.copy = mergeArrays(options.copy, defaultOptions.copy);

            options.mappedProperties = options.mappedProperties || {};
            return options;
        }

        function mergeArrays(a, b) {
            if (!(a instanceof Array)) {
                if (typeof a === "undefined") a = [];
                else a = [a];
            }
            if (!(b instanceof Array)) {
                if (typeof b === "undefined") b = [];
                else b = [b];
            }
            return a.concat(b);
        }
        ko.mapping.toJS = function (rootObject, options) {
            defaultOptions = ko.mapping.defaultOptions();
            if (!defaultOptions) ko.mapping.defaultOptions(
                {
                    include: _defaultOptions.include.slice(0),
                    ignore: _defaultOptions.ignore.slice(0),
                    copy: _defaultOptions.copy.slice(0)
                }
            );

            if (arguments.length == 0) throw new Error("When calling ko.mapping.toJS, pass the object you want to convert.");
            if (!(defaultOptions.ignore instanceof Array)) throw new Error("ko.mapping.defaultOptions().ignore should be an array.");
            if (!(defaultOptions.include instanceof Array)) throw new Error("ko.mapping.defaultOptions().include should be an array.");
            if (!(defaultOptions.copy instanceof Array)) throw new Error("ko.mapping.defaultOptions().copy should be an array.");

            // Merge in the options used in fromJS
            options = fillOptions(options, rootObject[mappingProperty]);

            // We just unwrap everything at every level in the object graph
            return ko.mapping.visitModel(rootObject, function (x) {
                var res = ko.utils.unwrapObservable(x);
                if (Object.prototype.toString.call(res) === '[object Date]')
                    res = '\\/Date(' + res.getTime() + ')\\/';
                return res;
            }, options);
        };
    })();
    ko.utils.arrayBestIndexOf = function (array, item, isFloat) {
        if (!isFloat) return ko.utils.arrayIndexOf(array, item);
        var j = array.length;
        if (j == 0) return -1;
        if (item === undefined) return 0;
        var besterror = Math.abs(array[0] - item);
        var bestIndex = 0;
        if (array[0] === undefined) {
            if (array.length <= 1) return -1;
            besterror = Math.abs(array[1] - item);
            bestIndex = 1;
        }
        var currError;
        for (var i = 1; i < j; i++) {
            currError = Math.abs(array[i] - item);
            if (currError < besterror) {
                bestIndex = i;
                besterror = currError;
            }
        }
        return bestIndex;
    };

    ko.bindingHandlers.value = {

        'init': function (element, valueAccessor, allBindingsAccessor) {
            function stringStartsWith(string, startsWith) {
                string = string || "";
                if (startsWith.length > string.length)
                    return false;
                return string.substring(0, startsWith.length) === startsWith;
            }
            var valueType = allBindingsAccessor()["valueType"] || MvcControlsToolkit_DataType_String;
            var elementType = $(element).attr("data-element-type") || "";
            var eventForced = $(element).attr("data-sync-event") || "";
            var eventsToCatch = ["change"];
            var requestedEventsToCatch = allBindingsAccessor()["valueUpdate"];
            if (eventForced) eventsToCatch = [eventForced];
            else if (elementType != "")
                eventsToCatch = [elementType + "_Changed"];
            if (requestedEventsToCatch) {
                if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                    requestedEventsToCatch = [requestedEventsToCatch];
                ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
                eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
            }
            eventsToCatch.push("changedByCode");
            ko.utils.arrayForEach(eventsToCatch, function (eventName) {
                // The syntax "after<eventname>" means "run the handler asynchronously after the event"
                // This is useful, for example, to catch "keydown" events after the browser has updated the control
                // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
                var handleEventAsynchronously = false;
                if (elementType == "" && eventName.length > 7 && stringStartsWith(eventName, "after")) {
                    handleEventAsynchronously = true;
                    eventName = eventName.substring("after".length);
                }
                var runEventHandler = handleEventAsynchronously ? function (handler) { setTimeout(handler, 0); }
                                                            : function (handler) { handler(); };

                ko.utils.registerEventHandler(element, eventName, function () {
                    runEventHandler(function () {
                        var modelValue = valueAccessor();
                        var elementValue = null;
                        if (elementType != "") {
                            elementValue = widgets[elementType].get(element, valueType);
                        }
                        else {
                            elementValue = MvcControlsToolkit_Parse(
                            ko.selectExtensions.readValue(element),
                            valueType);
                        }
                        var origValue = $(element).data("mvcct-oldvalue");

                        if (isNaN(elementValue) && elementType == "") elementValue = ko.selectExtensions.readValue(element);
                        if (valueType == MvcControlsToolkit_DataType_DateTime && elementValue && origValue && $(element).attr("data-date-only") == "true" && mvcct.utils.isDate(origValue)) {
                            elementValue = new Date(elementValue.getFullYear(), elementValue.getMonth(), elementValue.getDate(),
                                origValue.getHours(), origValue.getMinutes(), origValue.getSeconds(), origValue.getMilliseconds());
                        }
                        if (ko.isWriteableObservable(modelValue))
                            modelValue(elementValue);
                        else {
                            var allBindings = allBindingsAccessor();
                            if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers']['value'])
                                allBindings['_ko_property_writers']['value'](elementValue);
                        }
                    });
                });
            });
        },
        'update': function (element, valueAccessor, allBindingsAccessor) {
            var valueType = allBindingsAccessor()["valueType"] || MvcControlsToolkit_DataType_String;
            var formatString = allBindingsAccessor()["formatString"] || '';
            var elementType = $(element).attr("data-element-type") || "";
            if (elementType != "") eventName = elementType + "_changed";

            var newValue = ko.utils.unwrapObservable(valueAccessor());

            var elementValue = null;
            if (elementType != "") {
                try {
                    elementValue = widgets[elementType].get(element, valueType);
                }
                catch (ex) { }
            }
            else {
                elementValue = MvcControlsToolkit_Parse(
                        ko.selectExtensions.readValue(element),
                        valueType);
            }
            if (isNaN(elementValue) && elementType == "") elementValue = ko.selectExtensions.readValue(element);
            if (valueType == MvcControlsToolkit_DataType_DateTime && elementValue && newValue && $(element).attr("data-date-only") == "true" && mvcct.utils.isDate(newValue)) {
                elementValue = new Date(elementValue.getFullYear(), elementValue.getMonth(), elementValue.getDate(),
                                newValue.getHours(), newValue.getMinutes(), newValue.getSeconds(), newValue.getMilliseconds());
            }
            var valueHasChanged = (newValue != elementValue);
            if (valueType == MvcControlsToolkit_DataType_DateTime && newValue && elementValue) valueHasChanged = (newValue.getTime() != elementValue.getTime());
            if (valueHasChanged)
                if (elementValue instanceof Array) {
                    if (newValue instanceof Array) {
                        if (newValue.length != elementValue.length) valueHasChanged = true;
                        else {
                            valueHasChanged = false;
                            for (var i = 0, j = newValue.length; i < j; i++) {
                                if (newValue[i] != elementValue[i]) {
                                    valueHasChanged = true;
                                    break;
                                }
                            }
                        }
                    }
                    else valueHasChanged = true;
                }
                    // JavaScript's 0 == "" behavious is unfortunate here as it prevents writing 0 to an empty text box (loose equality suggests the values are the same). 
                    // We don't want to do a strict equality comparison as that is more confusing for developers in certain cases, so we specifically special case 0 != "" here.
                else if ((newValue === 0) && (elementValue !== 0) && (elementValue !== "0"))
                    valueHasChanged = true;

            if (valueHasChanged) {
                $(element).data("mvcct-oldvalue", newValue);
                var convertedValue = null;
                var applyValueAction = null;
                if (elementType != "") {
                    applyValueAction = function () {
                        widgets[elementType].set(element, newValue, formatString, valueType);
                        mvcct.basicControls.refreshWidget(element);
                    };
                }
                else {
                    convertedValue = mvcct.globalize.tostring(newValue, formatString, valueType);
                    applyValueAction = function () {
                        if (element.tagName == 'SELECT' && valueType == MvcControlsToolkit_DataType_Float) {
                            if (element.options.length > 0) {
                                var besterror = Math.abs(MvcControlsToolkit_Parse(ko.selectExtensions.readValue(element.options[0]), valueType) - newValue);
                                var bestIndex = 0;
                                for (var i = element.options.length - 1; i >= 0; i--) {
                                    var currError = Math.abs(MvcControlsToolkit_Parse(ko.selectExtensions.readValue(element.options[i]), valueType) - newValue);
                                    if (currError < besterror) {
                                        besterror = currError;
                                        bestIndex = i;
                                    }
                                }
                                element.selectedIndex = bestIndex;
                            }
                        }
                        else
                            ko.selectExtensions.writeValue(element, convertedValue);
                        mvcct.basicControls.refreshWidget(element);

                    };
                }
                ko.utils.triggerEvent(element, "modelChanged");
                applyValueAction();

                // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
                // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
                // to apply the value as well.
                var alsoApplyAsynchronously = element.tagName == "SELECT";
                if (alsoApplyAsynchronously)
                    setTimeout(applyValueAction, 0);
            }

            // For SELECT nodes, you're not allowed to have a model value that disagrees with the UI selection, so if there is a
            // difference, treat it as a change that should be written back to the model

            if (element.tagName == "SELECT") {
                if (elementType != "") {
                    elementValue = widgets[elementType].get(element, valueType);
                }
                else {
                    elementValue = MvcControlsToolkit_Parse(
                        ko.selectExtensions.readValue(element),
                        valueType);
                }
                if (elementValue !== newValue)
                    ko.utils.triggerEvent(element, "change");
            }

        }
    };
    ko.bindingHandlers.selectedOptions = {
        getSelectedValuesFromSelectNode: function (selectNode, valueType, all) {
            var result = [];
            var nodes = selectNode.childNodes;
            for (var i = 0, j = nodes.length; i < j; i++) {
                var node = nodes[i];
                if (node.tagName == "OPTGROUP") {
                    var opts = node.childNodes;
                    for (var n = 0, l = opts.length; n < l; n++) {
                        var opt = opts[n];
                        if ((opt.tagName == "OPTION") && (opt.selected || all != null))
                            result.push(MvcControlsToolkit_Parse(ko.selectExtensions.readValue(opt), valueType));
                    }
                }
                else if ((node.tagName == "OPTION") && (node.selected || all != null))
                    result.push(MvcControlsToolkit_Parse(ko.selectExtensions.readValue(node), valueType));
            }
            return result;
        },
        'init': function (element, valueAccessor, allBindingsAccessor) {
            var valueType = allBindingsAccessor()["valueType"] || MvcControlsToolkit_DataType_String;
            var eventHandler = function () {
                var value = valueAccessor();
                var newValue = ko.bindingHandlers.selectedOptions.getSelectedValuesFromSelectNode(this, valueType);
                if (ko.isWriteableObservable(value))
                    value(newValue);
                else {
                    var allBindings = allBindingsAccessor();
                    if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers']['value'])
                        allBindings['_ko_property_writers']['value'](newValue);
                }
            };
            ko.utils.registerEventHandler(element, "change", eventHandler);
            ko.utils.registerEventHandler(element, "changedByCode", eventHandler);
        },
        'update': function (element, valueAccessor, allBindingsAccessor) {
            if (element.tagName != "SELECT")
                throw new Error("values binding applies only to SELECT elements");
            var valueType = allBindingsAccessor()["valueType"] || MvcControlsToolkit_DataType_String;
            var newValue = ko.utils.unwrapObservable(valueAccessor());
            if (newValue && typeof newValue.length == "number") {
                var allElements = ko.bindingHandlers.selectedOptions.getSelectedValuesFromSelectNode(element, valueType, true);
                var chosenIdexes = [];
                for (var i = 0, j = newValue.length; i < j; i++) chosenIdexes.push(ko.utils.arrayBestIndexOf(allElements, newValue[i], (valueType == MvcControlsToolkit_DataType_Float)));
                var nodes = element.childNodes;
                var opCount = 0;
                for (var i = 0, j = nodes.length; i < j; i++) {
                    var node = nodes[i];
                    if (node.tagName == "OPTGROUP") {
                        var opts = node.childNodes;
                        for (var n = 0, l = opts.length; n < l; n++) {
                            var opt = opts[n];
                            if (opt.tagName == "OPTION") {

                                opt.selected = ko.utils.arrayBestIndexOf(chosenIdexes, opCount, false) >= 0;
                                opCount++;
                            }
                        }
                    }
                    else if (node.tagName == "OPTION") {

                        node.selected = ko.utils.arrayBestIndexOf(chosenIdexes, opCount, false) >= 0;
                        opCount++;
                    }
                }
            }
            ko.utils.triggerEvent(element, "modelChanged");
            mvcct.basicControls.refreshWidget(element);
        }
    };
    ko.bindingHandlers.checked = {
        'init': function (element, valueAccessor, allBindingsAccessor) {
            var valueType = allBindingsAccessor()["valueType"] || MvcControlsToolkit_DataType_String;
            var updateHandler = function () {
                var valueToWrite;
                if (element.type == "checkbox") {
                    valueToWrite = element.checked;
                } else if ((element.type == "radio") && (element.checked)) {
                    valueToWrite = MvcControlsToolkit_Parse(element.value, valueType);
                } else {
                    return; // "checked" binding only responds to checkboxes and selected radio buttons
                }

                var modelValue = valueAccessor();
                if ((element.type == "checkbox") && (ko.utils.unwrapObservable(modelValue) instanceof Array)) {
                    // For checkboxes bound to an array, we add/remove the checkbox value to that array
                    // This works for both observable and non-observable arrays
                    var elementValue = MvcControlsToolkit_Parse(element.value, valueType);
                    var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.unwrapObservable(modelValue), MvcControlsToolkit_Parse(elementValue, valueType));
                    if (element.checked && (existingEntryIndex < 0))
                        modelValue.push(elementValue);
                    else if ((!element.checked) && (existingEntryIndex >= 0))
                        modelValue.splice(existingEntryIndex, 1);
                } else if (ko.isWriteableObservable(modelValue)) {
                    if (modelValue() !== valueToWrite) { // Suppress repeated events when there's nothing new to notify (some browsers raise them)
                        modelValue(valueToWrite);
                    }
                } else {
                    var allBindings = allBindingsAccessor();
                    if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers']['checked']) {
                        allBindings['_ko_property_writers']['checked'](valueToWrite);
                    }
                }
                return true;
            };
            ko.utils.registerEventHandler(element, "click", updateHandler);
            ko.utils.registerEventHandler(element, "changedByCode", updateHandler);

            // IE 6 won't allow radio buttons to be selected unless they have a name
            if ((element.type == "radio") && !element.name)
                ko.bindingHandlers['uniqueName']['init'](element, function () { return true });
        },
        'update': function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var valueType = allBindingsAccessor()["valueType"] || MvcControlsToolkit_DataType_String;
            if (element.type == "checkbox") {
                if (value instanceof Array) {
                    // When bound to an array, the checkbox being checked represents its value being present in that array
                    element.checked = ko.utils.arrayIndexOf(value, MvcControlsToolkit_Parse(element.value, valueType)) >= 0;
                } else {
                    // When bound to anything other value (not an array), the checkbox being checked represents the value being trueish
                    element.checked = value;
                }

                // Workaround for IE 6 bug - it fails to apply checked state to dynamically-created checkboxes if you merely say "element.checked = true"
                if (value && ko.utils.isIe6)
                    element.mergeAttributes(document.createElement("<input type='checkbox' checked='checked' />"), false);
            } else if (element.type == "radio") {
                var nodeValue = MvcControlsToolkit_Parse(element.value, valueType);
                element.checked = (nodeValue == value);

                // Workaround for IE 6/7 bug - it fails to apply checked state to dynamically-created radio buttons if you merely say "element.checked = true"
                if ((nodeValue == value) && (ko.utils.isIe6 || ko.utils.isIe7))
                    element.mergeAttributes(document.createElement("<input type='radio' checked='checked' />"), false);
            }
            ko.utils.triggerEvent(element, "modelChanged");
            mvcct.basicControls.refreshWidget(element);
        }
    };
    ko['bindingHandlers']['_javascript'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());

            if (mvcct.utils.isFunction(value)) {
                var delayedExecution = [];
                var newReady = function (x) {
                    delayedExecution.push(x);
                };
                var oldReady = jQuery.fn.ready;
                jQuery.fn.ready = newReady;
                try {
                    value(mvcct, ko, jQuery, viewModel, bindingContext);
                }
                finally {
                    jQuery.fn.ready = oldReady;
                }
                for (var i = 0; i < delayedExecution.length; i++) delayedExecution[i]();

            }
        }
    };
    ko['bindingHandlers']['_initTemplate'] = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var func = function () { ko['bindingHandlers']['_javascript']['init'](element, valueAccessor, allBindingsAccessor, viewModel, bindingContext); };
            var ctx = bindingContext.$parentContext;
            if (ctx && ctx.beforeBind) {
                var nodes = [];
                for (var curr = ko.virtualElements.nextSibling(element) ; curr; curr = ko.virtualElements.nextSibling(curr))
                    nodes.push(curr);
                ctx.beforeBind(nodes, bindingContext.$data, func);
            }
            else func();
        }
    };
    ko.virtualElements.allowedBindings._javascript = true;
    ko.virtualElements.allowedBindings._initTemplate = true;
    ko.bindingHandlers.allowBindings = {
        init: function (elem, valueAccessor) {
            // Let bindings proceed as normal *only if* my value is false
            var shouldAllowBindings = ko.utils.unwrapObservable(valueAccessor());
            return { controlsDescendantBindings: !shouldAllowBindings };
        }
    };
    ko.virtualElements.allowedBindings.allowBindings = true;
    ko.bindingHandlers.notAllowBindings = {
        init: function (elem, valueAccessor) {
            // Let bindings proceed as normal *only if* my value is false
            var shouldAllowBindings = ko.utils.unwrapObservable(valueAccessor());
            return { controlsDescendantBindings: shouldAllowBindings };
        }
    };
    ko.virtualElements.allowedBindings.notAllowBindings = true;
    function MvcControlsToolkit_GetArrayString(value, arrayName, isNullable) {
        var allValues = eval(arrayName);
        if (value === null || value === undefined) return allValues[0];
        var index = 0;
        if (value === false) index = 0;
        else if (value === true) index = 1;
        else index = value;
        if (isNullable) index++;
        return allValues[index];
    }
    (function () {
        ko.bindingHandlers['template']["getCachedNodes"] = function (value) { return null; };
        var cexpando = "__mvcct__c" + (new Date).getTime();
        var isCachedExpando = cexpando + "_";
        mvcct.core.preventDisposal = function (node, on) {
            if (mvcct.utils.isArray(node)) {
                for (var i = 0; i < node.length; i++) {
                    var curr = node[i];
                    if (curr.nodeType == 1 || curr.nodeType == 8) curr[isCachedExpando] = on;;
                }
            }
            else node[isCachedExpando] = on;
        };
        var oldCleanNode = ko.cleanNode;
        var newCleanNode = function (x) {
            if ((x.nodeType == 1 || x.nodeType == 8) && x[isCachedExpando]) return x;
            return oldCleanNode(x);
        };
        for (var prop in ko) {
            if (ko[prop] == oldCleanNode)
                ko[prop] = newCleanNode;
        }

        ko.bindingHandlers['template']["getCachedNodes"] = function (value) { return null; };

        function handleCachedNodes(cachedNodes) {
            var res = [];
            var header = document.createComment(" ko allowBindings: false ");
            header[cexpando] = true;
            var footer = document.createComment(" /ko ");
            res.push(header);
            for (var i = 0; i < cachedNodes.length; i++) {
                res.push(cachedNodes[i]);
            }
            res.push(footer);
            mvcct.core.preventDisposal(res, true);
            return res;
        }
        ///////////////native engine modifications///////////////////////
        (function () {
            var classesWrittenByBindingKey = '__ko__cssValue';
            ko.bindingHandlers['css'] = {
                'update': function (element, valueAccessor) {
                    var value = ko.utils.unwrapObservable(valueAccessor());
                    if (typeof value == "object") {
                        for (var className in value) {
                            var shouldHaveClass = ko.utils.unwrapObservable(value[className]);
                            ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
                        }
                    } else {
                        value = String(value || ''); // Make sure we don't try to store or set a non-string value
                        ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
                        element[classesWrittenByBindingKey] = value;
                        ko.utils.toggleDomNodeCssClass(element, value, true);
                    }
                }
            };
            ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options) {
                var data = bindingContext['$data'];
                var cachedNodes = ko.bindingHandlers['template']['getCachedNodes'](data);
                if (cachedNodes != null) return handleCachedNodes(cachedNodes);
                var templateText = templateSource.text();
                if (options.templateOptions && (options.templateOptions.ModelPrefix || options.templateOptions.ModelPrefix === '')) {
                    MvcControlsToolkit_NewTemplateName(options.templateOptions, data);
                    var itemName = MvcControlsToolkit_TemplateName(options.templateOptions, data);
                    var itemId = MvcControlsToolkit_TemplateId(options.templateOptions, data);
                    var tsn = itemName ?
                        new RegExp(options.templateOptions['templateSymbol'] + "\\.A", "g") :
                        new RegExp(options.templateOptions['templateSymbol'] + "\\.A\\.", "g");
                    var tsi = itemId ?
                        new RegExp(options.templateOptions['templateSymbol'] + "_A", "g") :
                        new RegExp(options.templateOptions['templateSymbol'] + "_A_", "g");
                    templateText = templateText
                    .replace(tsn, itemName)
                    .replace(tsi, itemId);
                }
                return jQuery.parseHTML ? jQuery.parseHTML(templateText, null) : ko.utils.parseHtmlFragment(templateText);
            };

            ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
            ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

        })();
        //////////////////////////////////////////////////////////
        //////////// jquery plugin template engine extended//////////////////
        ko.jqueryTmplTemplateEngineExt = function () {
            // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl 
            // doesn't expose a version number, so we have to infer it.
            // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
            // which KO internally refers to as version "2", so older versions are no longer detected.
            var jQueryTmplVersion = this.jQueryTmplVersion = (function () {
                if ((typeof (jQuery) == "undefined") || !(jQuery['tmpl']))
                    return 0;
                // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
                try {
                    if (jQuery['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
                        // Since 1.0.0pre, custom tags should append markup to an array called "__"
                        return 2; // Final version of jquery.tmpl
                    }
                } catch (ex) { /* Apparently not the version we were looking for */ }

                return 1; // Any older version that we don't support
            })();

            function ensureHasReferencedJQueryTemplates() {
                if (jQueryTmplVersion < 2)
                    throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
            }

            function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
                return jQuery['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
            }
            this['allowTemplateRewriting'] = false;
            this['renderTemplateSource'] = function (templateSource, bindingContext, options) {
                options = options || {};
                var data = bindingContext['$data'];
                var cachedNodes = ko.bindingHandlers['template']['getCachedNodes'](data);
                if (cachedNodes != null) return handleCachedNodes(cachedNodes);
                ensureHasReferencedJQueryTemplates();

                // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
                var precompiled = templateSource['data']('precompiled');
                if (!precompiled) {
                    var templateText = templateSource.text() || "";
                    var tsn = new RegExp(options.templateOptions['templateSymbol'] + "\\.A", "g");
                    var tsi = new RegExp(options.templateOptions['templateSymbol'] + "_A", "g");
                    templateText = templateText
                    .replace(tsn, "${mvcct.basicKo.templateName($item, $data)}")
                    .replace(tsi, "${mvcct.basicKo.templateId($item, $data)}");
                    // Wrap in "with($whatever.koBindingContext) { ... }"
                    templateText = "{{ko_with $item.koBindingContext}} ${mvcct.basicKo.newTemplateName($item, $data) }" + templateText + "{{/ko_with}}";

                    precompiled = jQuery['template'](null, templateText);
                    templateSource['data']('precompiled', precompiled);
                }

                var data = [data]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
                var jQueryTemplateOptions = jQuery['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

                var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
                resultNodes['appendTo'](document.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work
                jQuery['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
                return resultNodes;
            };

            this['createJavaScriptEvaluatorBlock'] = function (script) {
                return "{{ko_code ((function() { return " + script + " })()) }}";
            };

            this['addTemplate'] = function (templateName, templateMarkup) {
                document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "</script>");
            };

            if (jQueryTmplVersion > 0) {
                jQuery['tmpl']['tag']['ko_code'] = {
                    open: "__.push($1 || '');"
                };
                jQuery['tmpl']['tag']['ko_with'] = {
                    open: "with($1) {",
                    close: "} "
                };
            }
        };
        (function () {
            ko.jqueryTmplTemplateEngineExt.prototype = new ko.templateEngine();
            // Use this one by default *only if jquery.tmpl is referenced*
            ko.jqueryTmplTemplateEngineExt.instance = new ko.jqueryTmplTemplateEngineExt();
            if (ko.jqueryTmplTemplateEngineExt.instance.jQueryTmplVersion > 0)
                ko.setTemplateEngine(ko.jqueryTmplTemplateEngineExt.instance);
        })();


        //////////

        //////////////////////////////////////////////////////////
        //////////// undescore.js plugin template engine extended//////////////////
        ko.underscoreTemplateEngineExt = function () { }
        ko.underscoreTemplateEngineExt.prototype = ko.utils.extend(new ko.templateEngine(), {
            allowTemplateRewriting: false,
            renderTemplateSource: function (templateSource, bindingContext, options) {
                var data = bindingContext['$data'];
                var cachedNodes = ko.bindingHandlers['template']['getCachedNodes'](data);
                if (cachedNodes != null) return handleCachedNodes(cachedNodes);
                // Precompile and cache the templates for efficiency
                var precompiled = templateSource['data']('precompiled');
                if (!precompiled) {
                    var tsn = new RegExp(options.templateOptions['templateSymbol'] + "\\.A", "g");
                    var tsi = new RegExp(options.templateOptions['templateSymbol'] + "_A", "g");
                    var templateText = templateSource.text() || "";
                    templateText = templateText
                    .replace(tsn, "<%= mvcct.basicKo.templateName($options, $data) %>")
                    .replace(tsi, "<%= mvcct.basicKo.templateId($options, $data) %>");
                    precompiled = _.template("<% mvcct.basicKo.newTemplateName($options, $data) %> <% with($data) { %> " + templateText + " <% } %>");
                    templateSource['data']('precompiled', precompiled);
                }
                var context = ko.utils.extend(ko.utils.extend({ $options: options["templateOptions"] || {} }, bindingContext), options["templateOptions"] || {});
                // Run the template and parse its output into an array of DOM elements
                var renderedMarkup = precompiled(context).replace(/\s+/g, " ");
                return jQuery.parseHTML ? jQuery.parseHTML(renderedMarkup, null) : ko.utils.parseHtmlFragment(renderedMarkup);
            },
            createJavaScriptEvaluatorBlock: function (script) {
                return "<%= " + script + " %>";
            }
        });
        (function () {
            if ((typeof _ != "undefined") && _["template"]) {
                ko.underscoreTemplateEngineExt.instance = new ko.underscoreTemplateEngineExt();
                ko.setTemplateEngine(ko.underscoreTemplateEngineExt.instance);
            }
        })();
        /////////////////////////////////////////////////////
        (function () {
            function objectName(data, isArrayElement) {
                return isArrayElement ?
                        (data["_tag"] > -1 ? data.ModelPrefix + "[" + data._tag + "]" : null) :
                        data.ModelPrefix;
            }
            function triggerAdd(el, nodes, data, isArray, isDetail, dynamicTemplate, bindingObservable, bindingContext) {
                var jNode = null;
                var jFather = $(el);
                var alreadyFrozen = false;
                if (mvcct.ko && mvcct.ko.isFrozen) alreadyFrozen = mvcct.ko.isFrozen(data);
                if (mvcct.ko && mvcct.ko.isCachingViews && mvcct.ko.isCachingViews(data) && !data._inError) {
                    mvcct.ko.freeze(data, nodes);
                }

                var namePrefix = objectName(data, isArray);
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].nodeType == 1) {
                        jNode = $(nodes[i]);
                        jNode.addClass("mvcct-container-root");
                        if (!isArray) jNode.addClass("mvcct-template-isSingle");
                        if (isDetail) jNode.addClass("mvcct-template-isDetail");
                        jNode.attr("data-name-prefix", namePrefix);
                        jNode.data("mvcct-template-source", data);
                        jNode.trigger("itemChange", new mvcct.events.changeData(jNode, "ItemToRefresh", 0));
                    }
                }
                if (dynamicTemplate && dynamicTemplate.afterRender && mvcct.ko && mvcct.ko.isFrozen && !alreadyFrozen)
                    dynamicTemplate.afterRender(nodes, data, bindingContext);
                if (mvcct.ko && mvcct.ko.dynamicTemplates && mvcct.ko.dynamicTemplates.isBaseViewModel(data) && data.processInput)
                    data.processInput(nodes, data, bindingContext);
            }
            function handleErrors(x) {
                if (x.nodeType != 1) return;
                jx = $(x);
                if (!jx.hasClass("prevent-full-validation") && !$.validator.preventFullValidation && !MvcControlsToolkit_ServerErrors_Last) {
                    jx.find(".mvcct-container-root").addBack().each(function () {
                        var jGo = $(this);
                        var prefix = jGo.attr("data-name-prefix");
                        var child = jGo.data("mvcct-template-source");
                        if (prefix && child) {
                            $.validator.testEntity(child, this);
                        }
                    });
                }
            }
            ko.bindingHandlers['template']['originalUpdate'] = ko.bindingHandlers['template']['update'];
            ko.bindingHandlers['template']['update'] = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var bindingObservable = valueAccessor();
                var bindingValue = ko.utils.unwrapObservable(bindingObservable);
                bindingObservable = bindingValue.data;
                var oldAfterRender = bindingValue["afterRender"];
                var dynamicTemplate = bindingContext.dynamicTemplate;
                var isForeach = bindingValue["foreach"];
                var processingOptions = bindingValue["processingOptions"] || {};
                var templateOptions = bindingValue["templateOptions"] || {};
                var noCache = processingOptions['forceNoCache'];
                var isDetail = templateOptions['SingleD'];
                var oldBeforeRemove = bindingValue['beforeRemove'];
                bindingContext.$element = element;
                var fc = ko.virtualElements.firstChild(element);
                var tElement = fc && fc[cexpando] ? fc : element;
                bindingContext.$referenceModel = (bindingContext.$parentContext ? bindingContext.$parentContext.$referenceModel : null)
                    || bindingContext.$root;
                if (!bindingContext.recall && oldBeforeRemove && !isForeach) {
                    var allchilds = [];
                    for (var x = ko.virtualElements.firstChild(tElement) ; x; x = ko.virtualElements.nextSibling(x)) allchilds.push(x);
                    oldBeforeRemove(allchilds, element, ko.utils.unwrapObservable(bindingValue.data),
                        function (x) {
                            bindingContext.dynamicTemplate = x;
                            bindingContext.recall = true;
                            ko.bindingHandlers.template.update(element, function () { return bindingValue; }, allBindingsAccessor, viewModel, bindingContext);
                            bindingContext.recall = false;
                            bindingContext.dynamicTemplate = null;
                        },
                        bindingValue.name,
                        bindingContext
                        );
                    return;

                }
                else {
                    bindingContext.dynamicTemplate = null;
                    bindingContext.recall = false;
                }
                if (isDetail) {
                    var jElement = $(element);
                    var oldRecord = jElement.data('_last_detail_');
                    var obs = bindingValue.data;
                    var it = ko.utils.unwrapObservable(obs);
                    jElement.data('_last_detail_', it);
                    if (oldRecord) delete oldRecord['_last_detail_'];
                    if (it) it._last_detail_ = function () { return obs };
                    if ($.validator && $.validator.testEntity && !$.validator.preventFullValidation && !MvcControlsToolkit_ServerErrors_Last) {
                        for (var x = ko.virtualElements.firstChild(tElement) ; x; x = ko.virtualElements.nextSibling(x))
                            handleErrors(x);
                    }
                }
                else if (!isForeach) {
                    var toClear = [];
                    for (var x = ko.virtualElements.firstChild(tElement) ; x; x = ko.virtualElements.nextSibling(x)) {
                        if (x.nodeType != 1 && x.nodeType != 8) continue;
                        if (x[isCachedExpando]) toClear.push(x);
                        if (x.nodeType == 1 && $.validator && $.validator.testEntity) handleErrors(x);
                    }
                    var currentData = ko.utils.unwrapObservable(bindingObservable);
                    var previousData = bindingObservable ? bindingObservable._previousData : null;
                    if (previousData) previousData = previousData();
                    if (bindingObservable && ko.isObservable(bindingObservable)) bindingObservable._previousData = function () { return currentData; }
                    var newFather = null;
                    if (previousData && mvcct.ko && mvcct.ko.dynamicTemplates && mvcct.ko.dynamicTemplates.isBaseViewModel(previousData) && previousData.beforeRemove) previousData.beforeRemove();
                    if (previousData && previousData._cachedView_) {
                        newFather = previousData._cachedView_();
                    }
                    for (var i = 0; i < toClear.length; i++) {
                        var cEl = toClear[i];
                        if (newFather) newFather[0].appendChild(cEl);
                        else if (cEl.parentNode) cEl.parentNode.removeChild(cEl);
                    }
                    if (mvcct.ko.mustRefresh && mvcct.ko.mustRefresh(currentData)) {
                        mvcct.ko.refreshFreeze(currentData, true);
                        mvcct.ko.unfreeze(currentData, false, false, true);
                    }
                    if (dynamicTemplate && dynamicTemplate.script && mvcct.ko && mvcct.ko.isFrozen && !mvcct.ko.isFrozen(currentData)) {
                        var res = dynamicTemplate.script;
                        if (mvcct.utils.isFunction(res)) {
                            var view = (mvcct.utils.isFunction(bindingValue.name) && currentData) ? bindingValue.name(currentData, bindingContext, false, true) : null;
                            res = res(currentData, view);
                        }
                        if (res) {
                            dynamicTemplate.afterRender = res.afterRender;
                            dynamicTemplate.beforeBind = res.beforeBind;
                            if (res.isReference !== false) bindingContext.$referenceModel = currentData;
                        }
                        else {
                            dynamicTemplate.afterRender = null;
                            dynamicTemplate.beforeBind = null;
                            bindingContext.$referenceModel = currentData;
                        }
                        if (res && dynamicTemplate.property) mvcct.utils.propertySet(currentData, dynamicTemplate.property, res);
                    }
                    if (mvcct.ko && mvcct.ko.dynamicTemplates && mvcct.ko.dynamicTemplates.isBaseViewModel(currentData)) {
                        currentData._host = bindingObservable;
                        if (currentData._onPageLoaded) currentData._onPageLoaded();
                    }
                }

                var defaultOptions =
            {
                unobtrusiveClient: true,
                fastNoInput: false,
                fastNoJavaScript: false,
                applyClientValidation: true
            };
                ko.utils.extend(
                defaultOptions,
                processingOptions);
                processingOptions = defaultOptions;

                if (oldBeforeRemove) {
                    bindingValue["beforeRemove"] = function (el, y, z) {
                        if (el.nodeType != 1) return;
                        oldBeforeRemove(el, y, z,
                            function () {
                                var access = z['_last_detail_'];
                                if (access) access()(null);
                                if (el.parentNode && $.validator && $.validator.testEntity) handleErrors(el);
                                if (!mvcct['annotations'] || !mvcct.annotations.get(z, "__cachedNode__")) ko.cleanNode(el);
                                if (el.parentNode) el.parentNode.removeChild(el);
                            });
                    };
                }
                else {
                    bindingValue["beforeRemove"] = function (el, y, z) {
                        if (el.nodeType != 1) return;
                        var access = z['_last_detail_'];
                        if (access) access()(null);
                        if (el.parentNode && $.validator && $.validator.testEntity) handleErrors(el);
                        if (!mvcct['annotations'] || !mvcct.annotations.get(z, "__cachedNode__")) ko.cleanNode(el);
                        if (el.parentNode) el.parentNode.removeChild(el);
                    };
                }

                if (oldAfterRender) {
                    bindingValue["afterRender"] = function (x, y) {
                        mvcct.utils.currentModel = y;
                        //if (!mvcct.ko || !mvcct.ko.observableTracking) MvcControlsToolkit_InitializeCreatedNodes(x, processingOptions.unobtrusiveClient, processingOptions.fastNoJavaScript, processingOptions.applyClientValidation);
                        triggerAdd(element, x, y, isForeach, isDetail, dynamicTemplate, bindingObservable, bindingContext);
                        oldAfterRender(x, y);
                        if (isDetail && mvcct.ko && mvcct.ko.detailErrors) mvcct.ko.detailErrors(x, y);
                        mvcct.utils.currentModel = null;

                    };
                }
                else {
                    bindingValue["afterRender"] = function (x, y) {
                        mvcct.utils.currentModel = y;
                        //if (!mvcct.ko || !mvcct.ko.observableTracking) MvcControlsToolkit_InitializeCreatedNodes(x, processingOptions.unobtrusiveClient, processingOptions.fastNoJavaScript, processingOptions.applyClientValidation);
                        triggerAdd(element, x, y, isForeach, isDetail, dynamicTemplate, bindingObservable, bindingContext);
                        if (isDetail && mvcct.ko && mvcct.ko.detailErrors) mvcct.ko.detailErrors(x, y);
                        mvcct.utils.currentModel = null;
                    };
                }
                bindingContext.beforeBind = function (x, y, func) {

                    mvcct.utils.currentModel = y;
                    MvcControlsToolkit_InitializeCreatedNodes(x, processingOptions.unobtrusiveClient, processingOptions.fastNoJavaScript, processingOptions.applyClientValidation, func);
                    if (dynamicTemplate && dynamicTemplate.beforeBind && mvcct.ko && mvcct.ko.isFrozen && !mvcct.ko.isFrozen(y))
                        dynamicTemplate.beforeBind(x, y);
                    mvcct.utils.currentModel = null;
                    return false;
                };
                var oldCachingProcessor = null;
                if (noCache) {
                    oldCachingProcessor = ko.bindingHandlers['template']['getCachedNodes'];
                    ko.bindingHandlers['template']['getCachedNodes'] = function (data) {
                        return null;
                    };
                }
                var templateName = null;
                if (!isForeach && mvcct.utils.isFunction(bindingValue.name)) {
                    templateName = bindingValue.name;
                    bindingValue.name = bindingValue.name(ko.utils.unwrapObservable(bindingValue.data), bindingContext);
                }
                ko.bindingHandlers['template']['originalUpdate'](element, function () { return bindingValue; }, allBindingsAccessor, viewModel, bindingContext);
                if (templateName && !isForeach) {
                    bindingValue.name = templateName;
                }
                if (noCache) {
                    ko.bindingHandlers['template']['getCachedNodes'] = oldCachingProcessor;
                }
                var oldDO = $(element).data("__mvcct_template_afterRender__") || null;
                if (oldDO != null && (typeof (oldDO.dispose) == 'function')) oldDO.dispose();
                $(element).data("__mvcct_template_afterRender__", null);
                if (typeof bindingValue['afterAllRender'] == 'function') {
                    var dependentObservable = new ko.dependentObservable(
                    function () {
                        mvcct.utils.currentModel = bindingContext.$data;
                        var unwrappedArray = ko.utils.unwrapObservable(bindingValue['foreach']);
                        bindingValue['afterAllRender'](element, viewModel);
                        mvcct.utils.currentModel = null;
                    },
                    null,
                    { 'disposeWhenNodeIsRemoved': element });
                    $(element).data("__mvcct_template_afterRender__", dependentObservable)
                }

            }
        })();
    })();
    mvcct.basicKo.newTemplateName = MvcControlsToolkit_NewTemplateName;
    mvcct.basicKo.templateName = MvcControlsToolkit_TemplateName;
    mvcct.basicKo.templateId = MvcControlsToolkit_TemplateId;
    mvcct.basicKo.viemodelInit = MvcControlsToolkit_ClientViewModel_Init;
    mvcct.basicKo.serverErrors = MvcControlsToolkit_ServerErrors;
    mvcct.basicKo.getArrayString = MvcControlsToolkit_GetArrayString;
    mvcct.basicKo.serverErrors = MvcControlsToolkit_ServerErrors;
})(jQuery);