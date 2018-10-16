/* ****************************************************************************
* MVCControlToolkit.Controls.Grid-2.4.5.js
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
    //////////////////////// DATAGRID /////////////////////////////
    var DataButtonCancel = "DataButtonCancel";
    var DataButtonDelete = "DataButtonDelete";
    var DataButtonUndelete = "DataButtonUndelete";
    var DataButtonEdit = "DataButtonEdit";
    var DataButtonInsert = "DataButtonInsert";
    var DataButtonResetRow = "DataButtonResetRow";
    var DisplayPostfix = "_Display";
    var EditPostfix = "_Edit";
    var OldEditPostfix = "_OldEdit";
    var UndeletePostfix = "_Undelete";
    var ChangedExternallyPostfix = "_ChangedExternally";
    var SavePostFix = "_Save";
    var SavePostFixCurr = "_SaveCurr";
    var DatagridFielsdPostfix = "_Datagrid_Fields";
    var SavePostFixD = "_SaveD";
    var SavePostFixU = "_SaveU";
    var SavePostFixC = "_SaveC";
    var DeletedPostFix = "_Deleted";
    var ContainerPostFix = "_Container";
    var VarPostfix = "_Var";
    var AllNormalPostfix = "_AllNormal";
    var ChandedPostfix = "_Changed";
    var itemsDataPostFix = "_itemsData";

    var TemplatePreparePostfix = '_templatePrepare';
    var PlaceHolderPostfix = '_placeHolder';
    var ChangedHiddenPostfix = '_changedHidden';
    var TemplateSymbolPostfix = '_templateSymbol';
    var LastIndexPostfix = '_lastIndex';
    var DataGrid_ValidationTypePostfix = '_validationType';
    var MinLastIndexPostfix = '_minLastIndex';
    var LastVisibleIndexPostfix = '_lastVisibleIndex';
    var TemplateEditHtmlPostfix = '_editHtml';
    var TemplateDisplayHtmlPostfix = '_displayHtml';
    var TemplateAllJavascriptPostfix = '_allJavascript';
    var MvcControlsToolkit_DatagridCssPostfix = '_Css';
    var MvcControlsToolkit_DatagridAltCssPostfix = '_AltCss';
    var MvcControlsToolkit_DatagridFatherItemsPostfix = '_FatherItems';
    var ValidationType_Server = "Server";

    var mvcct = window.mvcct;
    var pstatus = mvcct.pageStatus = mvcct.pageStatus || {};
    var basic = mvcct.basicControls = mvcct.basicControls || {};
    mvcct.html = mvcct["html"] || {};
    var widgets = mvcct.widgets;
    var trackedGrid = mvcct.html.trackedGrid = {};

    function DataGrid_Field(original, current, validationType) {
        this.Original = original;
        this.Current = current;
        this.ValidationType = validationType;
        if (this.Original != null) {
            var attr = $(this.Original).attr('data-element-type');
            if (attr != undefined && attr != null) {
                this.ControlType = attr;
                var cnode = this.Original;
                if (attr == 'DateTimeInput') {
                    this.Original = widgets[attr].get(cnode, null);
                }
                else {
                    this.Original = widgets[attr].getString(cnode);
                }
            }
        }
    }

    DataGrid_Field.prototype = {
        Original: null,
        Current: null,
        ControlType: null,
        ValidationType: null,
        Reset: function () {
            if (this.Original == null) return;
            if (this.Current == null) return;
            if (this.ControlType != null) {
                var cnode = this.Current;
                var attr = this.ControlType;
                var cvalue = this.Original;
                if (attr == 'DateTimeInput') {
                    widgets[attr].set(cnode, cvalue, null, null);
                }
                else {
                    widgets[attr].setString(cnode, cvalue);
                }
                return;
            }
            if (this.Original.nodeName.toLowerCase() == "input") {
                var iType = this.Original.getAttribute('type').toLowerCase();
                if (iType == 'checkbox' ||
                    iType == 'radio') {
                    //var unchanged = this.Current.checked == this.Original.checked;
                    this.Current.checked = this.Original.checked;
                    //if (!unchanged)
                    // $(this.Current).trigger('change');
                }
                else if (iType != 'file' && iType != 'button' && iType != 'reset' && iType != 'submit' && iType != 'image') {
                    try {
                        //if (iType != 'hidden') $(this.Current).trigger('focus');
                        this.Current.value = this.Original.value;
                        //if (iType != 'hidden') $(this.Current).trigger('blur');
                    }
                    catch (e) {
                    }
                }
            }
            else if (this.Original.nodeName.toLowerCase() == "textarea") {
                //$(this.Current).trigger('focus');
                this.Current.value = this.Original.value;
                //$(this.Current).trigger('blur');
            }
            else if (this.Original.nodeName.toLowerCase() == "select") {
                $(this.Current).html($(this.Original).html());
                //$(this.Current).trigger('change');
            }

            basic.refreshWidget(this.Current);

            // if (this.Current.id != '') MvcControlsToolkit_Validate(this.Current.id, this.ValidationType);
        }
    }

    function DataGrid_EditRowFields(validationType) {
        this.Names = new Array();
        this.Dictionary = new Array();
        this.ValidationType = validationType;
    }

    DataGrid_EditRowFields.prototype = {
        Names: null,
        Dictionary: null,
        ValidationType: null,
        AddOriginal: function (fieldName, field) {
            if (typeof this.Dictionary[fieldName] === 'undefined') {
                this.Names.push(fieldName);
                this.Dictionary[fieldName] = new DataGrid_Field(field, null, this.ValidationType);
            }
            else {
                this.Dictionary[fieldName].Original = field;
            }
        },
        AddCurrent: function (fieldName, field) {
            if (typeof this.Dictionary[fieldName] === 'undefined') {
                this.Names.push(fieldName);
                this.Dictionary[fieldName] = new DataGrid_Field(null, field, this.ValidationType);
            }
            else {
                this.Dictionary[fieldName].Current = field;
            }
        },
        Reset: function () {
            var fieldName = null;
            for (var i = 0; i < this.Names.length; i++) {
                fieldName = this.Names[i];
                if (typeof this.Dictionary[fieldName] !== 'undefined') {
                    this.Dictionary[fieldName].Reset();
                }
            }
        }
    }

    function DataGrid_ResetRow(itemRoot) {
        var fields = null;
        var temp = null;
        var validationType = null;
        var root = itemRoot.substring(0, itemRoot.lastIndexOf('___'));
        root = root.substring(0, root.lastIndexOf('___'));
        validationType = pstatus[root + DataGrid_ValidationTypePostfix];
        fields = pstatus[itemRoot + DatagridFielsdPostfix];
        if (fields == null) {
            fields = new DataGrid_EditRowFields(validationType);
            pstatus[itemRoot + DatagridFielsdPostfix] = fields;

            temp = pstatus[itemRoot + SavePostFix];
            temp.find('input:not([data-elementispart])').each(function (i) {
                fields.AddOriginal(this.id, this);
            });
            temp.find('textarea:not([data-elementispart])').each(function (i) {
                fields.AddOriginal(this.id, this);
            });
            temp.find('select:not([data-elementispart])').each(function (i) {
                fields.AddOriginal(this.id, this);
            });
            temp.find('[data-element-type]').each(function (i) {
                fields.AddOriginal(this.id, this);
            });
            temp = pstatus[itemRoot + SavePostFixCurr];
            temp.find('input:not([data-elementispart])').each(function (i) {
                fields.AddCurrent(this.id, this);
            });
            temp.find('textarea:not([data-elementispart])').each(function (i) {
                fields.AddCurrent(this.id, this);
            });
            temp.find('select:not([data-elementispart])').each(function (i) {
                fields.AddCurrent(this.id, this);
            });
            temp.find('[data-element-type]').each(function (i) {
                fields.AddCurrent(this.id, this);
            });
            pstatus[itemRoot + SavePostFix] = null;
        }
        fields.Reset();
        var currRow = pstatus[itemRoot + SavePostFixCurr];
        currRow.find('.input-validation-error').removeClass('input-validation-error');
        currRow.find('.field-validation-error')
            .removeClass('field-validation-error')
            .addClass('field-validation-valid');
    }
    function DataGrid_Remove_Edit_Item(itemRoot) {
        var temp = null;
        temp = $('#' + itemRoot + EditPostfix + ContainerPostFix).detach();
        if (temp.length != 0) {
            pstatus[itemRoot + SavePostFixCurr] = temp;
        }
    }

    function DataGrid_Display_Edit_Item(itemRoot) {
        var temp = null;
        temp = pstatus[itemRoot + SavePostFixCurr];
        $('#' + itemRoot + DisplayPostfix + ContainerPostFix).before(temp);
        DataGrid_ResetRow(itemRoot);
    }

    function DataGrid_ItemRoot_AtIndex(itemRoot, index) {
        var right = itemRoot.substring(itemRoot.lastIndexOf('___'));
        var left = itemRoot.substring(0, itemRoot.lastIndexOf('___'));
        left = left.substring(0, left.lastIndexOf('_') + 1);
        return left + index + right;
    }
    function DataGrid_ItemRoot_Index(itemRoot) {
        itemRoot = itemRoot.substring(0, itemRoot.lastIndexOf('___'));
        itemRoot = itemRoot.substring(itemRoot.lastIndexOf('_') + 1);
        return parseInt(itemRoot);
    }

    function DataGrid_ChecKInsertNewItem(itemRoot) {
        var root = itemRoot.substring(0, itemRoot.lastIndexOf('___'));
        root = root.substring(0, root.lastIndexOf('___'));
        if (typeof pstatus[root + LastIndexPostfix] === 'undefined') return;
        var index = DataGrid_ItemRoot_Index(itemRoot);
        var visibleIndex = pstatus[root + LastVisibleIndexPostfix];
        if (index != visibleIndex) return;

        var lastIndex = pstatus[root + LastIndexPostfix];

        if (lastIndex == index) {
            index++;
            var indexStr = index + '';
            var templateSymbol = pstatus[root + TemplateSymbolPostfix];
            var displayTemplate = pstatus[root + TemplateDisplayHtmlPostfix].replace(templateSymbol, indexStr);
            var editTemplate = pstatus[root + TemplateEditHtmlPostfix].replace(templateSymbol, indexStr);
            var changed = $('<div>').append($('#' + pstatus[root + ChangedHiddenPostfix]).clone()).remove().html().replace(templateSymbol, indexStr);
            var placeHolderName = pstatus[root + PlaceHolderPostfix];
            var placeHolder = $('<div>').append($('#' + placeHolderName).clone()).remove().html().replace(templateSymbol, indexStr);

            var tableRoot = $('#' + itemRoot + EditPostfix + ContainerPostFix).parent();
            $(displayTemplate).appendTo(tableRoot);
            $(editTemplate).appendTo(tableRoot);




            jQuery.globalEval(pstatus[root + TemplateAllJavascriptPostfix].replace(templateSymbol, indexStr));

            var hiddenElementsFather = $('#' + placeHolderName).parent();

            hiddenElementsFather.append(placeHolder);
            hiddenElementsFather.append(changed);

            var newItemName = DataGrid_ItemRoot_AtIndex(itemRoot, index) + EditPostfix + ContainerPostFix;
            var newDisplayItemName = DataGrid_ItemRoot_AtIndex(itemRoot, index) + DisplayPostfix + ContainerPostFix;
            if (typeof $ !== 'undefined' && $ !== null && typeof $.validator !== 'undefined' && $.validator !== null && typeof $.validator.unobtrusive !== 'undefined' && $.validator.unobtrusive !== null) {

                jQuery.validator.unobtrusive.parseExt('#' + newItemName);
            }



            var changeData = new mvcct.events.changeData($('#' + newDisplayItemName), 'NewHtmlCreated', 0);
            tableRoot.trigger('itemChange', changeData);

            var changeData = new mvcct.events.changeData($('#' + newItemName), 'NewHtmlCreated', 0);
            tableRoot.trigger('itemChange', changeData);


            var initCall = $.extend({}, pstatus[root + TemplatePreparePostfix]);
            initCall.itemRoot = initCall.itemRoot.replace(templateSymbol, indexStr);
            if (initCall.itemChanged) initCall.itemChanged = initCall.itemChanged.replace(templateSymbol, indexStr);
            buildItem(initCall);



            visibleIndex++;
            lastIndex++;
            pstatus[root + LastVisibleIndexPostfix] = visibleIndex;
            pstatus[root + LastIndexPostfix] = lastIndex;


        }
        else {
            index++;
            var nextItem = DataGrid_ItemRoot_AtIndex(itemRoot, index);
            var temp = pstatus[nextItem + SavePostFixD];
            $('#' + nextItem + DisplayPostfix + ContainerPostFix).replaceWith(temp);
            pstatus[root + LastVisibleIndexPostfix] = index;
        }

    }

    function DataGrid_ChecKDisappearItem(itemRoot) {
        var root = itemRoot.substring(0, itemRoot.lastIndexOf('___'));
        root = root.substring(0, root.lastIndexOf('___'));
        if (typeof pstatus[root + LastIndexPostfix] === 'undefined') return;

        var index = DataGrid_ItemRoot_Index(itemRoot);
        var visibleIndex = pstatus[root + LastVisibleIndexPostfix];
        var minIndex = pstatus[root + MinLastIndexPostfix];

        if (index < minIndex) return;
        if (index != visibleIndex) {
            $('#' + itemRoot + DisplayPostfix + ContainerPostFix).css('display', 'none'); ;
            if (index == visibleIndex - 2) {
                index++;
                itemRoot = DataGrid_ItemRoot_AtIndex(itemRoot, index);
                DataGrid_ChecKDisappearItem(itemRoot);
                return;

            }
            else {
                return;
            }
        }
        var display = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
        if (display.length == 0) return;
        if (index <= minIndex) {
            display.css('display', '');
            return;
        }
        var prevItem = DataGrid_ItemRoot_AtIndex(itemRoot, index - 1);
        if ($('#' + prevItem + DisplayPostfix + ContainerPostFix).length == 0) return;
        display.css('display', 'none');
        visibleIndex--;
        pstatus[root + LastVisibleIndexPostfix] = visibleIndex;
        index--;
        var prevtItem = DataGrid_ItemRoot_AtIndex(itemRoot, index);
        DataGrid_ChecKDisappearItem(prevItem, root);

    }

    function MvcControlsToolkit_Grid_ItemName(item) {
        var itemRoot = item.id;
        var place = itemRoot.lastIndexOf("_");
        if (place < 0) return null;
        itemRoot = itemRoot.substring(0, place);
        place = itemRoot.lastIndexOf("_");
        if (place < 0) return null;
        return itemRoot.substring(0, place) + '_Container';

    }
    function MvcControlsToolkit_DataButton_Click(itemRoot, dataButtonType) {
        if (typeof (itemRoot) != 'string') itemRoot = MvcControlsToolkit_Grid_ItemName(itemRoot);
        var place = itemRoot.lastIndexOf("_");
        if (place < 0) return null;
        itemRoot = itemRoot.substring(0, place);
        place = itemRoot.lastIndexOf("_");
        if (place < 0) return null;
        var itemChanged = itemRoot.substring(0, place) + '_Changed';
        DataButton_Click(itemRoot, itemChanged, dataButtonType);
    }
    function DataButton_Click(itemRoot, itemChanged, dataButtonType) {
        if (dataButtonType == DataButtonDelete) {
            var undel = pstatus[itemRoot + SavePostFixU];
            var jItem = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
            if (jItem.length == 0) return;
            var jParent = jItem.parent();
            var changeData = new mvcct.events.changeData(jItem, 'ItemDeleting', 0);
            jParent.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;
            if (undel != null) {
                jItem.before(undel.clone(true));
                jItem.detach();
            }
            else {

                jItem.css("display", "none");
            }
            DataGrid_Remove_Edit_Item(itemRoot);

            $('#' + itemChanged).val('True');
            pstatus[itemRoot + DeletedPostFix] = true;
            changeData = new mvcct.events.changeData(jItem, 'ItemDeleted', 0);
            MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            jParent.trigger('itemChange', changeData);
        }
        else if (dataButtonType == DataButtonEdit) {
            var jItem = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
            if (jItem.length == 0) return;
            var jParent = jItem.parent();
            var changeData = new mvcct.events.changeData(jItem, 'ItemGoingEdit', 0);
            jParent.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;
            DataGrid_Display_Edit_Item(itemRoot);
            jItem.detach();
            $('#' + itemChanged).val('True');
            MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            changeData = new mvcct.events.changeData($('#' + itemRoot + EditPostfix + ContainerPostFix), 'ItemGoneEdit', 0);
            jParent.trigger('itemChange', changeData);
        }
        else if (dataButtonType == DataButtonInsert) {
            var jItem = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
            if (jItem.length == 0) return;
            var jParent = jItem.parent();
            var changeData = new mvcct.events.changeData(null, 'ItemCreating', 0);
            jParent.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;
            DataGrid_Display_Edit_Item(itemRoot);
            jItem.detach();
            $('#' + itemChanged).val('True');
            DataGrid_ChecKInsertNewItem(itemRoot);
            MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            changeData = new mvcct.events.changeData($('#' + itemRoot + EditPostfix + ContainerPostFix), 'ItemCreated', 0);
            jParent.trigger('itemChange', changeData);
        }
        else if (dataButtonType == DataButtonCancel) {
            var jItem = $('#' + itemRoot + EditPostfix + ContainerPostFix);
            if (jItem.length == 0) return;
            var jParent = jItem.parent();
            var changeData = new mvcct.events.changeData(jItem, 'ItemUndoing', 0);
            jParent.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;
            var temp = pstatus[itemRoot + SavePostFixD];
            jItem.before(temp);
            DataGrid_Remove_Edit_Item(itemRoot);
            $('#' + itemChanged).val('False');
            DataGrid_ChecKDisappearItem(itemRoot);
            MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            var newItem = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
            changeData = new mvcct.events.changeData(newItem, 'ItemUndone', 0);
            jParent.trigger('itemChange', changeData);
        }
        else if (dataButtonType == DataButtonResetRow) {
            var jItem = $('#' + itemRoot + EditPostfix + ContainerPostFix);
            if (jItem.length == 0) return;
            var jParent = jItem.parent();
            var changeData = new mvcct.events.changeData(jItem, 'ItemResetting', 0);
            jParent.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;
            var temp = pstatus[itemRoot + SavePostFixD];
            $('#' + itemRoot + EditPostfix + ContainerPostFix).before(temp);
            DataGrid_Remove_Edit_Item(itemRoot);
            DataGrid_Display_Edit_Item(itemRoot);
            $('#' + itemRoot + DisplayPostfix + ContainerPostFix).detach();
            MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            changeData = new mvcct.events.changeData(jItem, 'ItemReset', 0);
            jParent.trigger('itemChange', changeData);
        }
        else if (dataButtonType == DataButtonUndelete) {
            var undel = pstatus[itemRoot + SavePostFixU];
            var jItem = null;
            if (undel != null) {
                jItem = $('#' + itemRoot + UndeletePostfix + ContainerPostFix);
            }
            else {
                jItem = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
            }
            if (jItem.length == 0) return;
            var jParent = jItem.parent();
            var changeData = new mvcct.events.changeData(null, 'ItemUndeleting', 0);
            jParent.trigger('itemChange', changeData);
            if (changeData.Cancel == true) return;

            var temp = pstatus[itemRoot + SavePostFixD];
            if (undel != null) {
                jItem.before(temp);
                jItem.remove();
            }
            else {
                jItem.css("display", "")
            }

            pstatus[itemRoot + DeletedPostFix] = false;
            $('#' + itemChanged).val('False');
            MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            changeData = new mvcct.events.changeData($('#' + itemRoot + DisplayPostfix + ContainerPostFix), 'ItemUndeleted', 0);
            jParent.trigger('itemChange', changeData);
        }


    }



    function DataGrid_Prepare_Template(itemRoot, itemChanged, deleted, root) {
        var allJavascript = mvcct.text.collectAllScriptsInelement(itemRoot + EditPostfix + ContainerPostFix) + mvcct.text.collectAllScriptsInelement(itemRoot + DisplayPostfix + ContainerPostFix);
        pstatus[root + TemplateAllJavascriptPostfix] = allJavascript;
        var editTemplateElement = $('#' + itemRoot + EditPostfix + ContainerPostFix);
        var displayTemplateElement = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
        editTemplateElement.find('script').remove();
        displayTemplateElement.find('script').remove();

        var temp = null;
        if (editTemplateElement.hasClass("MVCCT_EncodedTemplate")) {
            temp = editTemplateElement.text();
        }
        else {
            temp = $('<div>').append(editTemplateElement.clone()).remove().html();
        }
        pstatus[root + TemplateEditHtmlPostfix] = temp;
        if (displayTemplateElement.hasClass("MVCCT_EncodedTemplate")) {
            temp = displayTemplateElement.text();
        }
        else {
            temp = $('<div>').append(displayTemplateElement.clone()).remove().html();

        }
        pstatus[root + TemplateDisplayHtmlPostfix] = temp;



        editTemplateElement.remove();
        displayTemplateElement.remove();
    }

    function MvcControlsToolkit_DataGridApplyStylesItem(itemRoot) {
        var root = itemRoot.substring(0, itemRoot.lastIndexOf('___'));
        root = root.substring(0, root.lastIndexOf('___'));
        MvcControlsToolkit_DataGridApplyStyles(root);
    }

    function MvcControlsToolkit_DataGridApplyStyles(rootName) {
        var root = pstatus[rootName + MvcControlsToolkit_DatagridFatherItemsPostfix];
        if (root == null) return;
        var css = pstatus[rootName + MvcControlsToolkit_DatagridCssPostfix];
        var altCss = pstatus[rootName + MvcControlsToolkit_DatagridAltCssPostfix];
        var alt = false;
        for (i = 0; i < root.childNodes.length; i++) {
            var nodeId = root.childNodes[i].id;
            if (nodeId == null) continue;
            var end_prefix = nodeId.lastIndexOf("_");
            if (end_prefix < 0) continue;
            var ending = nodeId.substring(end_prefix);
            if (ending != ContainerPostFix) continue;
            if ($(root.childNodes[i]).css('display') == 'none') continue;
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
    }

    function DataGrid_Prepare_Item(itemRoot, itemChanged, deleted, root) {
        var temp = pstatus[root + AllNormalPostfix] || [];
        temp.push(itemRoot);
        pstatus[root + AllNormalPostfix] = temp;
        $('#' + itemRoot + OldEditPostfix + ContainerPostFix).find('script').remove();
        temp = $('#' + itemRoot + OldEditPostfix + ContainerPostFix).detach();

        $('#' + itemRoot + EditPostfix + ContainerPostFix).find('script').remove();
        if (temp.length == 0)
            temp = $('#' + itemRoot + EditPostfix + ContainerPostFix).clone(true);
        temp.css('display', '');

        pstatus[itemRoot + SavePostFix] = temp;

        temp = $('#' + itemRoot + DisplayPostfix + ContainerPostFix);
        temp.find('script').remove();
        var parent = temp.parent();
        if (parent.length > 0) {
            parent = parent[0];
            pstatus[root + MvcControlsToolkit_DatagridFatherItemsPostfix] = parent;
        }
        //temp=temp.clone(true);
        pstatus[itemRoot + SavePostFixD] = temp;
        temp.css('display', '');

        temp = $('#' + itemRoot + ChangedExternallyPostfix + ContainerPostFix);
        temp.find('script').remove();
        temp = temp.detach();
        temp.css('display', '');
        if (temp != null && temp.size() == 0)
            temp = null;

        pstatus[itemRoot + SavePostFixC] = temp;

        var deletedItem = $('#' + itemRoot + UndeletePostfix + ContainerPostFix);
        deletedItem.find('script').remove();
        temp = deletedItem;

        if (temp != null && temp.size() == 0)
            temp = null;

        pstatus[itemRoot + SavePostFixU] = temp;

        if (deleted) {
            var editItem = $('#' + itemRoot + EditPostfix + ContainerPostFix);
            DataGrid_Remove_Edit_Item(itemRoot);
            editItem.css('display', '');
            if (temp == null) {
                $('#' + itemRoot + DisplayPostfix + ContainerPostFix).css("display", "none");
            }
            else {
                $('#' + itemRoot + DisplayPostfix + ContainerPostFix).detach();
                deletedItem.css('display', '');
            }
            pstatus[itemRoot + DeletedPostFix] = true;
        }
        else {
            deletedItem = deletedItem.detach();
            deletedItem.css('display', '');
            var editItem = $('#' + itemRoot + EditPostfix + ContainerPostFix);
            if (pstatus[itemChanged + VarPostfix]) {

                DataGrid_Remove_Edit_Item(itemRoot);
                $('#' + itemRoot + DisplayPostfix + ContainerPostFix).css('display', '');
            }
            else {
                $('#' + itemRoot + DisplayPostfix + ContainerPostFix).detach();
            }
            editItem.css('display', '');
            pstatus[itemRoot + DeletedPostFix] = false;
        }
    }
    function dataGridAddItem(itemRoot, itemChanged, changedValue, deleted, root) {
        pstatus[root + itemsDataPostFix].push(
        {
            itemRoot: itemRoot,
            itemChanged: itemChanged,
            changedValue: changedValue,
            deleted: deleted,
            root: root
        });
    }

    function dataGridOpen(root, validationType, css, altCss, toUpdate) {
        pstatus[root + AllNormalPostfix] = null;
        pstatus[root + DataGrid_ValidationTypePostfix] = validationType;
        pstatus[root + MvcControlsToolkit_DatagridCssPostfix] = css;
        pstatus[root + MvcControlsToolkit_DatagridAltCssPostfix] = altCss;
        pstatus[root + MvcControlsToolkit_DatagridFatherItemsPostfix] = null;
        pstatus[root + '_FieldsToUpdate'] = toUpdate;
        pstatus[root + itemsDataPostFix] = [];
    }
    function buildItem(infos) {
        pstatus[infos.itemChanged + VarPostfix] = infos.changedValue;
        basic.replace(infos.itemRoot + SavePostFix, null);
        basic.replace(infos.itemRoot + SavePostFixCurr, null);
        basic.replace(infos.itemRoot + SavePostFixD, null);
        basic.replace(infos.itemRoot + SavePostFixU, null);
        basic.replace(infos.itemRoot + SavePostFixC, null);
        DataGrid_Prepare_Item(infos.itemRoot, infos.itemChanged, infos.deleted, infos.root);
    }
    function dataGridClose(root) {
        $(document).ready(function () {
            setTimeout(function () {
                var allItems = pstatus[root + itemsDataPostFix];
                for (var i = 0; i < allItems.length; i++) buildItem(allItems[i]);
                delete pstatus[root + itemsDataPostFix];
            });
            setTimeout(function () { MvcControlsToolkit_DataGridApplyStyles(root) });
        });
    }
    function dataGridTemplate(p0, p1, p2, p3, p4, p5, p6, p7, p8) {
        pstatus[p4 + PlaceHolderPostfix] = p5;
        pstatus[p4 + ChangedHiddenPostfix] = p2;
        pstatus[p4 + TemplateSymbolPostfix] = p6;
        pstatus[p4 + LastIndexPostfix] = p7;
        pstatus[p4 + LastVisibleIndexPostfix] = p7;
        pstatus[p4 + MinLastIndexPostfix] = p8;
        pstatus[p4 + TemplateEditHtmlPostfix] = null;
        pstatus[p4 + TemplateDisplayHtmlPostfix] = null;
        pstatus[p4 + TemplateAllJavascriptPostfix] = null;
        pstatus[p4 + TemplatePreparePostfix] = { itemRoot: p1, itemChanged: p2, changedValue: p0, deleted: p3, root: p4 };
        $(document).ready(function () {
            DataGrid_Prepare_Template(p1, p2, p3, p4);
        });
    }
    function resetAllGrid(target) {
        var toUndo = pstatus[target + AllNormalPostfix];
        if (toUndo) {
            for (var i = 0; i < toUndo.length; i++) {
                var vChanged = toUndo[i].substring(0, toUndo[i].lastIndexOf("_")) + ChandedPostfix;
                var deleted = pstatus[toUndo[i] + DeletedPostFix];
                if (deleted != null && deleted == true)
                    DataButton_Click(toUndo[i], vChanged, DataButtonUndelete);
                else
                    DataButton_Click(toUndo[i], vChanged, DataButtonCancel);
            }
        }
    }
    ////////////////////////////////DETAIL FORM///////////////////////////////////////////////


    function OnBeginDetailForm(baseName, detailType, rowId, loadingElementId, validationType, beforeStart) {
        if (beforeStart && !beforeStart(rowId)) return;
        detailBusy = pstatus[baseName + '_DetailBusy'];
        if (detailBusy) return false;
        pstatus[baseName + '_DetailBusy'] = true;
        pstatus[baseName + "_TypeDetail"] = detailType;
        if (rowId != null) {//rowId null means re-posting on the same column
            if (detailType == 'Insert') {
                pstatus[baseName + "_CurrentRow"] = null; // grid need not be updated on success
            }
            else {
                pstatus[baseName + "_CurrentRow"] = rowId;
            }
        }
        else {
            var res = mvcct.unobtrusive.formIsValid(loadingElementId, validationType);
            return res;
        }
        return true;
    }

    function OnFailureDetailForm(baseName, displayExecute, editExecute) {
        var detailType = pstatus[baseName + '_TypeDetail'];
        if (detailType == 'Display') {
            if (displayExecute != null) displayExecute();
        }
        else {
            if (editExecute != null) editExecute();
        }
        pstatus[baseName + '_DetailBusy'] = false;
    }

    function TrueValue(value, fieldName) {
        var trueValue = pstatus[fieldName + "_True"];
        if (trueValue === undefined) trueValue = value;

        var field = $('#' + fieldName);
        if (field.length == 0) field = $('#' + fieldName + "___Hidden");
        trueValue = field.data('_True') || trueValue;
        return trueValue;
    }

    function FormattedValue(value, fieldName) {
        var fValue = pstatus[fieldName + "_Format"];
        if (fValue === undefined) fValue = value;

        fValue = $('#' + fieldName + "___Hidden").data('_Format') || fValue;
        if (fValue && fValue.length > 0 && fValue.substring(0, 1) == '<') {
            fValue = $('#' + fieldName + '_Format').text();
            $('#' + fieldName + '_Format').remove();
        }
        var companionField = document.getElementById(fieldName + "_hidden");
        if (companionField != null) {
            fValue = companionField.value;
        }
        return fValue;
    }

    function UrlValue(fieldName) {
        var url = pstatus[fieldName + "_Url"];
        if (!url && url !== "") return null;
        return url;
    }

    function OnSuccessDetailForm(baseName, displayExecute, editExecute, ajaxContext, formId, validationType, unobtrusiveAjaxOn, updateTargetId) {
        var detailType = pstatus[baseName + '_TypeDetail'];
        if (!unobtrusiveAjaxOn) mvcct.text.globalEvalScriptAndDestroy(ajaxContext.get_updateTarget());
        else if (detailType == 'Edit') $('#' + updateTargetId).html(ajaxContext);
        if (validationType != ValidationType_Server) mvcct.unobtrusive.prepareAjaxFormClientValidation(formId, validationType);
        var detailType = pstatus[baseName + '_TypeDetail'];
        var changedFieldCss = pstatus[baseName + '_ChangedFieldCss'];
        var deletedRecordCss = pstatus[baseName + '_DeletedRecordCss'];
        var isValid = false;
        var hiddenIsValid = document.getElementById("IsValid");
        if (hiddenIsValid != null && hiddenIsValid.value == "True") isValid = true;
        var itemRoot = pstatus[baseName + "_CurrentRow"];
        if (isValid && (detailType == 'FirstEdit' || detailType == 'Edit' || detailType == 'Display')) {
            var fieldsToUpdate = pstatus[baseName + "_FieldsToUpdate"].split(",");
            var detailRoot = pstatus[baseName + "_DetailPrefix"];
            if (itemRoot != null) {
                var oldItemRoot = itemRoot.substring(0, itemRoot.lastIndexOf('Value')) + 'OldValue';
                var isInsert = true;
                var isExternalDelete = true;
                var changedDisplay = pstatus[itemRoot + SavePostFixC];
                var changedDisplayAvailable = false;
                if (changedDisplay == null) changedDisplay = pstatus[itemRoot + SavePostFixD];
                else changedDisplayAvailable = true;
                for (var i = 0; i < fieldsToUpdate.length; i++) {
                    var oField = document.getElementById(oldItemRoot + "_" + fieldsToUpdate[i]);
                    var oFields = document.getElementById(oldItemRoot + '_' + fieldsToUpdate[i] + '___JSonModel');
                    if (oField == null)
                        oField = oFields;
                    if (oField != null) isInsert = false;
                    var newFieldName = null;
                    if (detailRoot.length == 0) {
                        newFieldName = fieldsToUpdate[i];
                    }
                    else {
                        newFieldName = oldItemRoot + "_" + fieldsToUpdate[i];
                    }
                    var newField = document.getElementById(newFieldName);
                    if (newField != null) isExternalDelete = false;
                    if (oField != null) {
                        var newValue = null;
                        var newFormattedValue = null;
                        if (newField != null && newField.getAttribute('type') != null && (newField.getAttribute('type').toLowerCase() == 'checkbox' || newField.getAttribute('type').toLowerCase() == 'radio')) {
                            if (newField.getAttribute('checked') != null && newField.checked == true) newValue = 'True';
                            else newValue = 'False';
                            newFormattedValue = FormattedValue(newValue, newFieldName);
                        }
                        else if (newField != null && newField.getAttribute('type') != null && newField.getAttribute('type').toLowerCase() == 'file') {
                        }
                        else {
                            if (newField != null) {
                                try {
                                    if (newField.nodeName != null && (newField.nodeName.toLowerCase() == "input" || newField.nodeName.toLowerCase() == "textarea")) {
                                        newValue = TrueValue(newField.value, newFieldName);
                                        newFormattedValue = FormattedValue(newField.value, newFieldName);
                                    }
                                    else if (newField.nodeName != null && newField.nodeName.toLowerCase() == "select") {
                                        var jNewField = $(newField);
                                        newValue = TrueValue(jNewField.val(), newFieldName);
                                        if (newValue == '') newValue = null;
                                        newFormattedValue = FormattedValue(jNewField.find('option:selected').text(), newFieldName);
                                    }
                                    else {
                                        newValue = TrueValue(newField.childNodes[0].nodeValue, newFieldName);
                                        newFormattedValue = FormattedValue(newField.childNodes[0].nodeValue, newFieldName);
                                    }
                                }
                                catch (e) {
                                }
                            }
                            else {
                                newValue = TrueValue(null, newFieldName);
                                newFormattedValue = FormattedValue(null, newFieldName);
                            }
                        }
                        var itemToUpdate = changedDisplay.find('#' + itemRoot + '_Display_' + fieldsToUpdate[i]);
                        var originalValue;
                        var jOField = $(oField);
                        if (typeof (jOField.data('originalvalue')) !== 'undefined') {
                            originalValue = jOField.data('originalvalue');
                            if (originalValue == null || originalValue == undefined) {
                                originalValue = oField.value;
                                jOField.data('originalvalue', oField.value);
                            }
                        }
                        else {
                            originalValue = oField.value;
                            jOField.data('originalvalue', oField.value);
                        }
                        if (changedFieldCss != null) {
                            if (newValue != null && originalValue != newValue) {
                                itemToUpdate.removeClass(changedFieldCss);
                                itemToUpdate.addClass(changedFieldCss);

                            }
                            else {
                                itemToUpdate.removeClass(changedFieldCss);
                            }
                        }
                        if (newValue != null && oField.value != newValue) {
                            oField.value = newValue;
                            if (itemToUpdate.length != 0) {
                                var inputType = itemToUpdate.attr('type');
                                if (inputType != null && inputType != undefined && (inputType.toLowerCase() == 'checkbox' || inputType.toLowerCase() == 'radio')) {
                                    if (newValue.toLowerCase() == 'true') itemToUpdate.checked = true;
                                    else itemToUpdate.checked = false;
                                }
                                else {
                                    if (itemToUpdate.filter('img').length > 0) {
                                        var imgUrl = UrlValue(newFieldName);
                                        if (imgUrl != null) {
                                            try {
                                                itemToUpdate.attr('src', imgUrl);
                                                itemToUpdate.attr('alt', newFormattedValue);
                                            }
                                            catch (e) {
                                            }
                                        }
                                    }
                                    else {
                                        try {
                                            itemToUpdate.html(newFormattedValue);
                                        }
                                        catch (e) {
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
                if (isExternalDelete) {
                    $('input[id^="' + oldItemRoot + '"]').remove();
                    if (deletedRecordCss != null) {
                        var newSavePostFixD = pstatus[itemRoot + SavePostFixD];
                        newSavePostFixD.addClass(deletedRecordCss);
                        $('#' + itemRoot + DisplayPostfix + ContainerPostFix).replaceWith(newSavePostFixD);
                    }
                }
                else if (!isInsert) {
                    if (changedDisplayAvailable) {
                        pstatus[itemRoot + SavePostFixD] = pstatus[itemRoot + SavePostFixC];
                        var newSavePostFixD = pstatus[itemRoot + SavePostFixD];
                        $('#' + itemRoot + DisplayPostfix + ContainerPostFix).replaceWith(newSavePostFixD);
                    }
                }
                if (itemRoot != null) MvcControlsToolkit_DataGridApplyStylesItem(itemRoot);
            }
        }

        if (detailType == 'Display') {
            if (displayExecute != null) {
                try {
                    displayExecute(itemRoot, isValid, detailType);
                }
                catch (e) {
                }
            }
        }
        else {
            if (editExecute != null) {
                try {
                    editExecute(itemRoot, isValid, detailType);
                }
                catch (e) {
                }
            }
        }

        pstatus[baseName + '_DetailBusy'] = false;
    }
    trackedGrid.dataButtonCancel = DataButtonCancel;
    trackedGrid.dataButtonDelete = DataButtonDelete;
    trackedGrid.dataButtonUndelete = DataButtonUndelete;
    trackedGrid.dataButtonResetRow = DataButtonResetRow;
    trackedGrid.dataButtonEdit = DataButtonEdit;
    trackedGrid.dataButtonInsert = DataButtonInsert;
    trackedGrid.dataButtonClick = MvcControlsToolkit_DataButton_Click;

    basic.displayPostfix = DisplayPostfix;
    basic.editPostfix = EditPostfix;
    basic.savePostFixCurr = SavePostFixCurr;
    basic.containerPostFix = ContainerPostFix;
    basic.gridItemName = MvcControlsToolkit_Grid_ItemName;
    basic.dataButtonClick = DataButton_Click;
    basic.dataGridPrepareTemplate = DataGrid_Prepare_Template;
    basic.dataGridApplyStyles = MvcControlsToolkit_DataGridApplyStyles;
    basic.dataGridPrepareItem = DataGrid_Prepare_Item;
    basic.dataGridTemplate = dataGridTemplate;
    basic.dataGridAddItem = dataGridAddItem;
    basic.dataGridOpen = dataGridOpen;
    basic.dataGridClose = dataGridClose;

    basic.onBeginDetailForm = OnBeginDetailForm;
    basic.onFailureDetailForm = OnFailureDetailForm;
    basic.onSuccessDetailForm = OnSuccessDetailForm;
    basic.resetAllGrid = resetAllGrid;

})(jQuery);