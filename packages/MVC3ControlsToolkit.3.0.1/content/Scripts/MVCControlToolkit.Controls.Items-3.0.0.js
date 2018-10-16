/* ****************************************************************************
* MVCControlToolkit.Controls.Items-2.4.0.js
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

////////////////////////////////////SORTABLE and PERMUTATIONS////////////////////////////////
(function($){
    var SortableList_PermutationUpdateRootPrefix = '_PermutationUpdateRoot';
    var SortableList_CanSortPrefix = '_CanSort';
    var SortableList_ElementsNumberPrefix = '_ElementsNumber';
    var SortableList_TemplateSymbolPrefix = '_TemplateSymbol';
    var SortableList_TemplateSriptPrefix = '_TemplateSript';
    var SortableList_TemplateHtmlPrefix = '_TemplateHtml';
    var SortableList_PermutationPrefix = '_Permutation';
    var SortableList_PermutationNamePrefix = '.Permutation';
    var SortableList_UpdateModelPrefix = '___';
    var SortableList_UpdateModelNamePrefix = '.$$';
    var SortableList_UpdateModelFieldsPrefix = '_f_ields';
    var SortableList_UpdateModelFieldsNamePrefix = '.f$ields';
    var SortableList_ItemsContainerPrefix = '_ItemsContainer';
    var SortableList_OriginalElementsNumber = '_OriginalElementsNumber';
    var SortableList_TemplateHiddenPrefix = '_TemplateHidden';
    var SortableList_TemplateHiddenHtmlPrefix = '_TemplateHiddenHtml';
    var SortableList_NamePrefixPrefix = '_NamePrefix';
    var SortableList_CssPostFix = "_Css";
    var SortableList_AltCssPostFix = "_AltCss";

    var mvcct = window.mvcct;
    var pstatus = mvcct.pageStatus = mvcct.pageStatus || {};
    var basic = mvcct.basicControls = mvcct.basicControls || {};
    mvcct.html = mvcct["html"] || {};
    var sortableList = mvcct.html.sortableList = {};

    function MvcControlsToolkit_SortableList_ItemName(item) {
        return item.id;
    }

    function MvcControlsToolkit_SortableList_PrepareTemplate(root, templateId) {
        MvcControlsToolkit_SortableList_PrepareTemplates(root, [templateId]);
    }
    function MvcControlsToolkit_SortableList_PrepareTemplates(root, templatesId) {
        var scripts = pstatus[root + SortableList_TemplateSriptPrefix] = new Array();
        pstatus[root + SortableList_TemplateHtmlPrefix] = new Array();
        pstatus[root + SortableList_TemplateHiddenHtmlPrefix] = new Array();
        for (var i = 0; i < templatesId.length; i++) {
            var templateId = templatesId[i];
            var templateElement = $('#' + templateId);

            var allJavascript = mvcct.text.collectAllScriptsInelement(templateId);
            scripts[i] = allJavascript;

            $('#' + templateId).find('script').remove();
            var temp = null;
            if (templateElement.hasClass("MVCCT_EncodedTemplate")) {
                temp = templateElement.text();
            }
            else {
                temp = $('<div>').append(templateElement.clone()).remove().html();
            }
            pstatus[root + SortableList_TemplateHtmlPrefix][i] = temp;

            var hidden = pstatus[root + SortableList_TemplateHiddenPrefix];
            if (hidden.constructor == Array) {
                hidden = hidden[i];
            }

            temp = $('<div>').append($('#' + hidden).clone()).remove().html();
            pstatus[root + SortableList_TemplateHiddenHtmlPrefix][i] = temp;

            $('#' + templateId).remove();
        }

        var canSort = pstatus[root + SortableList_CanSortPrefix];
        if (canSort) {
            var elementNumber = pstatus[root + SortableList_ElementsNumberPrefix];

            var updateModel = document.getElementById(root + SortableList_UpdateModelPrefix + elementNumber);
            updateModel.setAttribute('id', updateModel.id + '_');


            var updateModelFields = document.getElementById(root + SortableList_UpdateModelPrefix + elementNumber + SortableList_UpdateModelFieldsPrefix);
            updateModelFields.setAttribute('id', updateModelFields.id + '_');
        }

    }
    function MvcControlsToolkit_SortableList_AddNew(root, item, after, replace, prepend) {
        if (typeof (root) != 'string') {
            root = root.id;
            var end_prefix = root.lastIndexOf("_");
            root = root.substring(0, end_prefix);
        }
        MvcControlsToolkit_SortableList_AddNewChoice(root, 0, item, after, replace, prepend);
    }
    function MvcControlsToolkit_SortableList_AddNewChoice(root, choice, item, after, replace, prepend) {
        if (typeof  pstatus[root + SortableList_ElementsNumberPrefix]  === 'undefined') return;
        var rootElement = $('#' + root + SortableList_ItemsContainerPrefix);
        var changeData = new mvcct.events.changeData(null, 'ItemCreating', choice);
        rootElement.trigger('itemChange', changeData);
        if (changeData.Cancel == true) return;
        var elementNumber = pstatus[root + SortableList_ElementsNumberPrefix];
        var originalElementNumber = pstatus[root + SortableList_OriginalElementsNumber];
        var templateSymbol = pstatus[root + SortableList_TemplateSymbolPrefix];
        if (templateSymbol.constructor == Array) {
            templateSymbol = templateSymbol[choice];
        }
        var hidden = pstatus[root + SortableList_TemplateHiddenPrefix];
        if (hidden.constructor == Array) {
            hidden = hidden[choice];
        }
        var allJavascript = pstatus[root + SortableList_TemplateSriptPrefix][choice].replace(templateSymbol, elementNumber + '');
        var allHtml = pstatus[root + SortableList_TemplateHtmlPrefix][choice].replace(templateSymbol, elementNumber + '');
        var hiddenElementFather = $('#' + hidden).parent();
        var hiddenElement = pstatus[root + SortableList_TemplateHiddenHtmlPrefix][choice].replace(templateSymbol, elementNumber + '');
        var canSort = pstatus[root + SortableList_CanSortPrefix];
        var namePrefix = pstatus[root + SortableList_NamePrefixPrefix];

        elementNumber++;
        pstatus[root + SortableList_ElementsNumberPrefix] = elementNumber;

        if (canSort) {
            var permutation = document.getElementById(root + SortableList_PermutationPrefix);
            permutation.setAttribute('name', namePrefix + SortableList_UpdateModelNamePrefix + elementNumber + ".$" + SortableList_PermutationNamePrefix);

            var updateModel = document.getElementById(root + SortableList_UpdateModelPrefix + originalElementNumber + '_');
            updateModel.setAttribute('name', namePrefix + SortableList_UpdateModelNamePrefix + elementNumber);


            var updateModelFields = document.getElementById(root + SortableList_UpdateModelPrefix + originalElementNumber + SortableList_UpdateModelFieldsPrefix + '_');
            updateModelFields.setAttribute('name', namePrefix + SortableList_UpdateModelNamePrefix + elementNumber + SortableList_UpdateModelFieldsNamePrefix);
        }

        hiddenElementFather.append(hiddenElement);
        var result;
        if (item == null) {
            if (prepend) {
                result = $(allHtml).prependTo(rootElement);
            }
            else {
                var hasFooter = false;
                var lastChild = $('#' + root + "_Footer");
                if (lastChild.length > 0) {
                    hasFooter = true;
                }
                if (hasFooter) {
                    result = $(allHtml).insertBefore(lastChild);
                }
                else {
                    result = $(allHtml).appendTo(rootElement);
                }
            }
        }
        else {
            if (after != true) result = $(allHtml).insertBefore(item);
            else result = $(allHtml).insertAfter(item);
            if (replace) {
                mvcct.databind.bind(item, result[0]);
                $(item).remove();
            }
        }

        if (typeof $ !== 'undefined' && $ !== null && typeof $.validator !== 'undefined' && $.validator !== null && typeof $.validator.unobtrusive !== 'undefined' && $.validator.unobtrusive !== null) {
            jQuery.validator.unobtrusive.parseExt('#' + result[0].id)
        }

        jQuery.globalEval(allJavascript);
        result.data("ScriptsRemoved", true);
        Update_Permutations_Root(root);
        if (canSort) {

            $('#' + root + SortableList_ItemsContainerPrefix).sortable("refresh");
        }
        changeData = new mvcct.events.changeData(result, 'ItemCreated', choice);
        rootElement.trigger('itemChange', changeData);
        changeData = new mvcct.events.changeData(result, 'NewHtmlCreated', 0);
        rootElement.trigger('itemChange', changeData);
        return result;
    }
    function MvcControlsToolkit_SortableList_ComputeRoot(itemName) {
        var place = itemName.lastIndexOf("___");
        if (place < 0) return null;
        var rootName = itemName.substring(0, place);
        place = rootName.lastIndexOf("___");
        rootName = rootName.substring(0, place);
        if (place < 0) return null;
        return rootName;
    }
    function MvcControlsToolkit_SortableListUpdate(item, senderId) {
        if (senderId != item.parent().attr('id')) return;
        var nodeName = item.attr('id');
        if (nodeName == null) return;
        var rootName = MvcControlsToolkit_SortableList_ComputeRoot(nodeName);
        Update_Permutations_Root(rootName);
        var rootElement = $('#' + rootName + '_ItemsContainer');
        var changeData = new mvcct.events.changeData(item, 'ItemMoved', 0);
        rootElement.trigger('itemChange', changeData);
    }
    function Update_Permutations(itemName) {

        return Update_Permutations_Root(MvcControlsToolkit_SortableList_ComputeRoot(itemName));
    }

    function Update_Permutations_Root(rootName) {
        if (rootName == null) return;
        var root = document.getElementById(rootName + '_ItemsContainer');
        if (root == null) return;
        if (root.childNodes.length > 0 &&
            root.childNodes[root.childNodes.length - 1].nodeType == 1 &&
            root.childNodes[root.childNodes.length - 1].outerHTML != "" &&
            root.childNodes[root.childNodes.length - 1].id == "") {
            root = root.childNodes[root.childNodes.length - 1];
        }
        var field = document.getElementById(rootName + '_Permutation');
        var alt = false;
        var css = pstatus[rootName + SortableList_CssPostFix];
        var altCss = pstatus[rootName + SortableList_AltCssPostFix];
        for (i = 0; i < root.childNodes.length; i++) {
            var currNode = root.childNodes[i];
            var jCurrNode = $(currNode);
            if (jCurrNode.data("ScriptsRemoved") !== true) {
                mvcct.text.collectScriptAndDestroy(currNode);
                jCurrNode.data("ScriptsRemoved", true);
            }
            var nodeId = root.childNodes[i].getAttribute('id');
            if (nodeId == null) continue;
            var end_prefix = nodeId.lastIndexOf("_");
            if (end_prefix < 0) continue;
            var ending = nodeId.substring(end_prefix + 1);
            if (ending == 'Header' || ending == 'Footer') continue;
            if (alt) {
                if (css != '') $(root.childNodes[i]).removeClass(css);
                if (altCss != '') $(root.childNodes[i]).addClass(altCss);
            }
            else {
                if (altCss != '') $(root.childNodes[i]).removeClass(altCss);
                if (css != '') $(root.childNodes[i]).addClass(css);
            }
            alt = !alt;
        }
        if (field == null) {

            return;
        }

        var res = '';
        for (i = 0; i < root.childNodes.length; i++) {

            var nodeId = root.childNodes[i].getAttribute('id');
            var end = nodeId.lastIndexOf("___");
            var order = nodeId.substring(0, end);
            var start = order.lastIndexOf("_") + 1;
            order = order.substring(start);
            if (i > 0) res = res + ',';
            res = res + order;
        }
        field.value = res;
    }

    function MvcControlsToolkit_SortableList_Click(target, dataButtonType, noEvents) {
        if (typeof (target) != 'string') target = target.id;
        if (dataButtonType == mvcct.widgets.manipulationButton.custom) {
            eval(target);
            return;
        }
        var rootName = MvcControlsToolkit_SortableList_ComputeRoot(target);
        var rootElement = $('#' + rootName + SortableList_ItemsContainerPrefix);
        if (dataButtonType == mvcct.widgets.manipulationButton.remove) {
            var item = $('#' + target);
            var changeData = new mvcct.events.changeData(item, 'ItemDeleting', 0);
            if (noEvents == null) rootElement.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;
            item.remove();
            Update_Permutations_Root(rootName);
            changeData = new mvcct.events.changeData(item, 'ItemDeleted', 0);
            if (noEvents == null) rootElement.trigger('itemChange', changeData);
        }
    }

    function MvcControlsToolkit_SortableList_Move(item, target, after) {
        if (after != true) $(item).insertBefore(target);
        else $(item).insertAfter(target);
        var rootName = MvcControlsToolkit_SortableList_ComputeRoot(item.id);
        Update_Permutations_Root(rootName);
        var rootElement = $('#' + rootName + '_ItemsContainer');
        var changeData = new mvcct.events.changeData(item, 'ItemMoved', 0);
        rootElement.trigger('itemChange', changeData);
    }

    basic.sortableListItemsContainerPrefix = SortableList_ItemsContainerPrefix;
    basic.sortableListPrepareTemplates = MvcControlsToolkit_SortableList_PrepareTemplates;
    basic.sortableListUpdate = MvcControlsToolkit_SortableListUpdate;
    basic.updatePermutationsRoot = Update_Permutations_Root;

    sortableList.addNew = MvcControlsToolkit_SortableList_AddNew;
    sortableList.addNewChoice = MvcControlsToolkit_SortableList_AddNewChoice;
    sortableList.click = MvcControlsToolkit_SortableList_Click;
    sortableList.move = MvcControlsToolkit_SortableList_Move;
})(jQuery);