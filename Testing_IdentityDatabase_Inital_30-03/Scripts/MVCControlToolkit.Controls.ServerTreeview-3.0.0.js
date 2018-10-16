/* ****************************************************************************
*
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

jQuery.cookie = function (name, value, options) {
    if (typeof value != 'undefined') { 
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); 
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { 
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

; (function ($) {
    $.extend($.fn, {
        swapClass: function (c1, c2) {
            var c1s = c1.split(" ")[0];
            var c2s = c2.split(" ")[0];
            var c1Elements = this.filter('.' + c1s);
            this.filter('.' + c2s).removeClass(c2).addClass(c1);
            c1Elements.removeClass(c1).addClass(c2);
            return this;
        },
        replaceClass: function (c1, c2) {
            return this.filter('.' + c1.split(" ")[0]).removeClass(c1).addClass(c2).end();
        },
        hoverClass: function (className) {
            className = className || "hover";
            return this.hover(function () {
                $(this).addClass(className);
            }, function () {
                $(this).removeClass(className);
            });
        },
        heightToggle: function (animated, callback) {
            animated ?
				this.animate({ height: "toggle" }, animated, callback) :
				this.each(function () {
				    jQuery(this)[jQuery(this).is(":hidden") ? "show" : "hide"]();
				    if (callback)
				        callback.apply(this, arguments);
				});
        },
        heightHide: function (animated, callback) {
            if (animated) {
                this.animate({ height: "hide" }, animated, callback);
            } else {
                this.hide();
                if (callback)
                    this.each(callback);
            }
        },
        prepareBranches: function (settings) {
            if (!settings.prerendered) {
                this.filter(":last-child:not(ul)").addClass(CLASSES.last);
                this.filter((settings.collapsed ? "" : "." + CLASSES.closed) + ":not(." + CLASSES.open + ")").find(">ul").hide();
            }
            return this.filter(":has(>ul)");
        },
        applyClasses: function (settings, toggler) {
            this.filter(":has(>ul):not(:has(>a))").find(">span").unbind("click.treeview").bind("click.treeview", function (event) {
                if (this == event.target)
                    toggler.apply($(this).next());
            }).add($("a", this)).hoverClass();

            if (!settings.prerendered) {
                this.filter(":has(>ul:hidden)")
						.addClass(CLASSES.expandable)
						.replaceClass(CLASSES.last, CLASSES.lastExpandable);

                this.not(":has(>ul:hidden)")
						.addClass(CLASSES.collapsable)
						.replaceClass(CLASSES.last, CLASSES.lastCollapsable);
                var hitarea = this.children("div." + CLASSES.hitarea);
                if (!hitarea.length)
                    hitarea = this.prepend("<div class=\"" + CLASSES.hitarea + "\"/>").children("div." + CLASSES.hitarea);
                hitarea.removeClass().addClass(CLASSES.hitarea).each(function () {
                    var classes = "";
                    $.each($(this).parent().attr("class").split(" "), function () {
                        if (this == CLASSES.collapsable) classes += CLASSES.collapsableHitarea;
                        else if (this == CLASSES.expandable) classes += CLASSES.expandableHitarea;
                        else if (this == CLASSES.lastCollapsable) classes += CLASSES.lastCollapsableHitarea;
                        else if (this == CLASSES.lastExpandable) classes += CLASSES.lastExpandableHitarea;
                        else classes += this + "-hitarea ";

                    });
                    $(this).addClass(classes);
                })

            }

            this.find("div." + CLASSES.hitarea).unbind().click(toggler);
        },
        treeview: function (settings) {

            settings = $.extend({
                cookieId: "treeview"
            }, settings);

            if (settings.toggle) {
                var callback = settings.toggle;
                settings.toggle = function () {
                    return callback.apply($(this).parent()[0], arguments);
                };
            }

            function treeController(tree, control) {
                function handler(filter) {
                    return function () {
                        toggler.apply($("div." + CLASSES.hitarea, tree).filter(function () {
                            return filter ? $(this).parent("." + filter).length : true;
                        }));
                        return false;
                    };
                }
                $("a:eq(0)", control).click(handler(CLASSES.collapsable));
                $("a:eq(1)", control).click(handler(CLASSES.expandable));
                $("a:eq(2)", control).click(handler());
            }

            function toggler() {
                var myParent = $(this).parent();
                var opened = myParent.filter(":has(>ul:hidden)").length == 0;

                var root = myParent.parents('.treeview');
                var changeData = new mvcct.events.changeData(myParent, opened ? 'ItemClosing' : 'ItemOpening', null);
                root.trigger('itemChange', changeData);
                if (changeData.Cancel == true) return;
                myParent
					.find(">.hitarea")
						.swapClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea)
						.swapClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea)
					.end()
					.swapClass(CLASSES.collapsable, CLASSES.expandable)
					.swapClass(CLASSES.lastCollapsable, CLASSES.lastExpandable)
					.find(">ul")
					.heightToggle(settings.animated, settings.toggle);
                if (settings.unique) {
                    $(this).parent()
						.siblings()
						.find(">.hitarea")
							.replaceClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea)
							.replaceClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea)
						.end()
						.replaceClass(CLASSES.collapsable, CLASSES.expandable)
						.replaceClass(CLASSES.lastCollapsable, CLASSES.lastExpandable)
						.find(">ul")
						.heightHide(settings.animated, settings.toggle);
                }
                changeData = new mvcct.events.changeData(myParent, opened ? 'ItemClosed' : 'ItemOpened', null);
                root.trigger('itemChange', changeData);
            }
            this.data("toggler", toggler);

            function serialize() {
                function binary(arg) {
                    return arg ? 1 : 0;
                }
                var data = [];
                branches.each(function (i, e) {
                    data[i] = $(e).is(":has(>ul:visible)") ? 1 : 0;
                });
                $.cookie(settings.cookieId, data.join(""), settings.cookieOptions);
            }

            function deserialize() {
                var stored = $.cookie(settings.cookieId);
                if (stored) {
                    var data = stored.split("");
                    branches.each(function (i, e) {
                        $(e).find(">ul")[parseInt(data[i]) ? "show" : "hide"]();
                    });
                }
            }

            this.addClass("treeview");

            var branches = this.find("li").prepareBranches(settings);

            switch (settings.persist) {
                case "cookie":
                    var toggleCallback = settings.toggle;
                    settings.toggle = function () {
                        serialize();
                        if (toggleCallback) {
                            toggleCallback.apply(this, arguments);
                        }
                    };
                    deserialize();
                    break;
                case "location":
                    var current = this.find("a").filter(function () {
                        return this.href.toLowerCase() == location.href.toLowerCase();
                    });
                    if (current.length) {
                        var items = current.addClass("selected").parents("ul, li").add(current.next()).show();
                        if (settings.prerendered) {
                            items.filter("li")
							.swapClass(CLASSES.collapsable, CLASSES.expandable)
							.swapClass(CLASSES.lastCollapsable, CLASSES.lastExpandable)
							.find(">.hitarea")
								.swapClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea)
								.swapClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea);
                        }
                    }
                    break;
            }

            branches.applyClasses(settings, toggler);

            if (settings.control) {
                treeController(this, settings.control);
                $(settings.control).show();
            }

            return this;
        }
    });

    $.treeview = {};
    var CLASSES = ($.treeview.classes = {
        open: "open",
        closed: "closed",
        expandable: "expandable",
        expandableHitarea: "expandable-hitarea ui-icon ui-icon-triangle-1-e ui-icon-arrow-r",
        lastExpandableHitarea: "lastExpandable-hitarea ui-icon  ui-icon-triangle-1-e ui-icon-arrow-r",
        collapsable: "collapsable",
        collapsableHitarea: "collapsable-hitarea ui-icon ui-icon-triangle-1-se ui-icon-arrow-d",
        lastCollapsableHitarea: "lastCollapsable-hitarea ui-icon  ui-icon-triangle-1-se ui-icon-arrow-d",
        lastCollapsable: "lastCollapsable",
        lastExpandable: "lastExpandable",
        last: "last",
        hitarea: "hitarea"
    });

})(jQuery);

(function ($) {
    var CLASSES = $.treeview.classes;
    var proxied = $.fn.treeview;
    $.fn.treeview = function (settings) {
        settings = $.extend({}, settings);
        if (settings.add) {
            return this.trigger("add", [settings.add]);
        }
        if (settings.remove) {
            return this.trigger("remove", [settings.remove]);
        }
        return proxied.apply(this, arguments).bind("add", function (event, branches) {
            $(branches).prev()
				.removeClass(CLASSES.last)
				.removeClass(CLASSES.lastCollapsable)
				.removeClass(CLASSES.lastExpandable)
			.find(">.hitarea")
				.removeClass(CLASSES.lastCollapsableHitarea)
				.removeClass(CLASSES.lastExpandableHitarea);
            $(branches).find("li").andSelf().prepareBranches(settings).applyClasses(settings, $(this).data("toggler"));
            return false;
        }).bind("add_treeview_node", function (event, branches) {
            $(branches).prev()
				.removeClass(CLASSES.last)
				.removeClass(CLASSES.lastCollapsable)
				.removeClass(CLASSES.lastExpandable)
			.find(">.hitarea")
				.replaceClass($.treeview.classes.lastCollapsableHitarea, $.treeview.classes.collapsableHitarea)
				.replaceClass($.treeview.classes.lastExpandableHitarea, $.treeview.classes.expandableHitarea);
            $(branches).prepareBranches(settings).applyClasses(settings, $(this).data("toggler"));
            return false;
        }).bind("remove", function (event, branches) {
            var prev = $(branches).prev();
            var parent = $(branches).parent();
            $(branches).remove();
            prev.filter(":last-child").addClass(CLASSES.last)
				.filter("." + CLASSES.expandable).replaceClass(CLASSES.last, CLASSES.lastExpandable).end()
				.find(">.hitarea").replaceClass(CLASSES.expandableHitarea, CLASSES.lastExpandableHitarea).end()
				.filter("." + CLASSES.collapsable).replaceClass(CLASSES.last, CLASSES.lastCollapsable).end()
				.find(">.hitarea").replaceClass(CLASSES.collapsableHitarea, CLASSES.lastCollapsableHitarea);
            if (parent.is(":not(:has(>))") && parent[0] != this) {
                parent.parent().removeClass(CLASSES.collapsable).removeClass(CLASSES.expandable)
                parent.siblings(".hitarea").andSelf().remove();
            }
            return false;
        });
    };

})(jQuery);
(function ($) {
    var mvcct = window.mvcct;

    var MvcControlsToolkit_TreeView_ButtonModePostfix = '_ButtonMode';
    var MvcControlsToolkit_TreeView_SaveDisplayPostfix = '_SaveDisplay';
    var MvcControlsToolkit_TreeView_SaveEditPostfix = '_SaveEdit';
    var MvcControlsToolkit_TreeView_ContainerDisplayPostfix = '___Choice1___flattened_ItemsContainer';
    var MvcControlsToolkit_TreeView_ContainerEditPostfix = '___Choice2___flattened_ItemsContainer';
    var MvcControlsToolkit_TreeView_ToggleEditPostfix = '_ToggleEditButton';
    var MvcControlsToolkit_TreeView_IsEditPostFix = '___IsChoice2';
    var MvcControlsToolkit_TreeView_RootNamePostfix = "_RootNamePostfix";
    var MvcControlsToolkit_TreeView_ClosedPostfix = "___Closed";
    var MvcControlsToolkit_TreeView_ItemsCountPostfix = "___ItemsCount";
    var MvcControlsToolkit_TreeView_TemplatesPostfix = "_Templates";
    var MvcControlsToolkit_TreeView_TemplateSymbolPrefix = '_TemplateSymbol';
    var MvcControlsToolkit_TreeView_TemplateSriptPrefix = '_TemplateSript';
    var MvcControlsToolkit_TreeView_TemplateHtmlPrefix = '_TemplateHtml';
    var MvcControlsToolkit_TreeView_CanSortPrefix = '_CanSort';
    var MvcControlsToolkit_TreeView_ItemsContainerPrefix = '_ItemsContainer';
    var MvcControlsToolkit_TreeView_ContainerPrefix = '_Container';
    var MvcControlsToolkit_TreeView_Open = 1;
    var MvcControlsToolkit_TreeView_Close = 2;
    var MvcControlsToolkit_TreeView_Toggle = 0;
    window["mvcct"] = window["mvcct"] || {};
    var pstatus = mvcct.pageStatus = mvcct.pageStatus || {};
    var basic = mvcct.basicControls = mvcct.basicControls || {};
    mvcct.html = mvcct["html"] || {};
    var treeview = mvcct.html.serverTreeview = {};
    basic.updated = false;

    function MvcControlsToolkit_FormContext$_isElementInHierarchy(parent, child) {
        if (child == null) return false;
        while (child) {
            if (parent === child) {
                return true;
            }
            child = child.parentNode;
        }
        return false;
    }
    function MvcControlsToolkit_Button_AdjustText(buttonName, newText) {
        var button = document.getElementById(buttonName);

        var nodeTag = button.nodeName.toLowerCase();

        if (nodeTag == 'input') button.value = newText;
        else if (nodeTag == 'img') button.setAttribute('src', newText);
        else if (nodeTag == 'a') button.firstChild.nodeValue = newText;

    }
    function MvcControlsToolkit_TreeView_ChangeNodeState(node, operation) {
        var itemName = node;
        if (typeof (itemName) != 'string') itemName = MvcControlsToolkit_TreeView_ItemName(itemName);
        var place = itemName.lastIndexOf("___");
        if (place < 0) return;
        itemName = itemName.substring(0, place);

        var item = $(document.getElementById(itemName + MvcControlsToolkit_TreeView_ContainerPrefix));
        var hitharea = item.find(">.hitarea");
        var opened = item.find(':has(>ul:hidden)').length == 0;
        if (operation == MvcControlsToolkit_TreeView_Toggle) hitharea.click();
        else if (operation == MvcControlsToolkit_TreeView_Close && opened) hitharea.click();
        else if (operation == MvcControlsToolkit_TreeView_Open && !opened) hitharea.click();
    }

    function MvcControlsToolkit_TreeView_StartDrag(item, jQueryRoot) {
        basic.updated = false;
        var failure = true;
        var currClass = jQueryRoot.attr("class");
        if (currClass != null) {
            var currClass = currClass.split(' ');
            if (currClass != null && currClass.length > 0) {
                currClass = currClass[0];
                if (currClass != null && currClass.length > 0 && currClass.substring(currClass.length - 1) != "_")
                    return;
                else {
                    currClass = currClass.substring(0, currClass.length - 1);
                    var selectedElement = $('.' + currClass);
                    if (selectedElement.length > 0) {
                        var res = MvcControlsToolkit_FormContext$_isElementInHierarchy(item[0], selectedElement[0]);
                        if (res) {
                            selectedElement.removeClass(currClass);
                            selectedElement.attr("class", currClass + "__ " + selectedElement.attr("class"));
                        }
                    }
                }
            }
        }

        jQueryRoot.sortable('option', 'items', '');
        jQueryRoot.sortable('refresh');

    }

    function MvcControlsToolkit_TreeView_StopDrag(item, jQueryRoot) {
        basic.updated = false;
        var currClass = jQueryRoot.attr("class");
        if (currClass != null) {
            var currClass = currClass.split(' ');
            if (currClass != null && currClass.length > 0) {
                currClass = currClass[0];
                if (currClass != null && currClass.length > 0 && currClass.substring(currClass.length - 1) == "_")
                    currClass = currClass + '_';
                else {
                    currClass = currClass + '__';
                }
                var selectedElement = $('.' + currClass);
                if (selectedElement.length > 0) {
                    selectedElement.removeClass(currClass);
                    currClass = currClass.substring(0, currClass.length - 2);
                    selectedElement.attr("class", currClass + ' ' + selectedElement.attr("class"));
                }
            }
        }
        jQueryRoot.sortable('option', 'items', '> *');
        jQueryRoot.sortable('refresh');
    }

    function MvcControlsToolkit_TreeView_SelectLevel(target, selector) {
        var root = $(target).parent().find('>.mvcct-items-container');
        var currClass = root.attr("class");
        var arr = null;
        if (currClass != null) {
            var arr = currClass.split(' ');
            if (arr != null && arr.length > 0) {
                currClass = arr[0];
            }
            else {
                arr = new Array();
                arr.push(currClass);
            }
            currClass = arr[0];
        }
        if (target.checked) {
            if (currClass != null && currClass.length > 0 && currClass.substring(currClass.length - 1) == "_")
                currClass = currClass.substring(0, currClass.length - 1);

        }
        else {

            if (currClass != null && currClass.length > 0 && currClass.substring(currClass.length - 1) != "_")
                currClass = currClass + '_';
        }
        for (var i = 1; i < arr.length; i++) {
            currClass = currClass + ' ' + arr[i];
        }
        root.attr("class", currClass);
        if (target.checked) {
            $(selector).each(function () {
                if (this == target) return;
                if (!this.checked) return;
                this.checked = false;
                MvcControlsToolkit_TreeView_SelectLevel(this, selector);
            });
        }
    }

    function MvcControlsToolkit_TreeView_PrepareTemplates(root, templatesId) {
        pstatus[root + MvcControlsToolkit_TreeView_TemplateSriptPrefix] = new Array();
        pstatus[root + MvcControlsToolkit_TreeView_TemplateHtmlPrefix] = new Array();

        for (var i = 0; i < templatesId.length; i++) {
            var templateId = templatesId[i];
            var templateElement = $('#' + templateId);
            var allJavascript = mvcct.text.collectAllScriptsInelement(templateId);
            pstatus[root + MvcControlsToolkit_TreeView_TemplateSriptPrefix][i] = allJavascript;

            templateElement.find('script').remove();

            var temp = null;
            if (templateElement.hasClass("MVCCT_EncodedTemplate")) {
                temp = templateElement.text();
            }
            else {
                temp = $('<div>').append(templateElement.children().clone()).remove().html();
            }
            pstatus[root + MvcControlsToolkit_TreeView_TemplateHtmlPrefix][i] = temp;




        }
        $('#' + root + MvcControlsToolkit_TreeView_TemplatesPostfix).remove();


    }

    function MvcControlsToolkit_TreeView_AddNewChoice(rootName, templateChosen, item, after) {

        if (pstatus[rootName + MvcControlsToolkit_TreeView_RootNamePostfix] === 'undefined') return;
        var root = pstatus[rootName + MvcControlsToolkit_TreeView_RootNamePostfix];
        var rootElement = $('#' + root + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        var changeData = new mvcct.events.changeData(null, 'ItemCreating', templateChosen);
        rootElement.trigger('itemChange', changeData);
        if (changeData.Cancel == true) return;
        var elementNumber = parseInt(document.getElementById(root + MvcControlsToolkit_TreeView_ItemsCountPostfix).value);

        var templateSymbol = new RegExp(pstatus[root + MvcControlsToolkit_TreeView_TemplateSymbolPrefix].source + templateChosen, 'g');

        var allJavascript = pstatus[root + MvcControlsToolkit_TreeView_TemplateSriptPrefix][templateChosen].replace(templateSymbol, elementNumber + '');
        var allHtml = pstatus[root + MvcControlsToolkit_TreeView_TemplateHtmlPrefix][templateChosen].replace(templateSymbol, elementNumber + '');

        var canSort = pstatus[root + MvcControlsToolkit_TreeView_CanSortPrefix];


        document.getElementById(root + MvcControlsToolkit_TreeView_ItemsCountPostfix).value = (elementNumber + 1) + '';



        var result = null;
        if (item == null)
            result = $(allHtml).appendTo('#' + rootName + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        else {
            if (after != true) result = $(allHtml).insertBefore(item);
            else result = $(allHtml).insertAfter(item);
        }

        var initFields = result.find('.MvcCT_init_info_' + root).detach().children();
        initFields.insertAfter('#' + root + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        result.find('.level-select_' + root).change(
            function (event) {

                MvcControlsToolkit_TreeView_SelectLevel(event.target, '.level-select_' + root);
            }
        );
        jQuery.globalEval(allJavascript);
        if (typeof $ !== 'undefined' && $ !== null && typeof $.validator !== 'undefined' && $.validator !== null && typeof $.validator.unobtrusive !== 'undefined' && $.validator.unobtrusive !== null) {
            jQuery.validator.unobtrusive.parseExt('#' + result[0].id)
        }

        rootElement.treeview({
            add: result
        });
        MvcControlsToolkit_TreeView_UpdateFather(result[0], rootName + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        if (canSort) {

            $('#' + rootName + MvcControlsToolkit_TreeView_ItemsContainerPrefix).sortable("refresh");
        }
        changeData = new mvcct.events.changeData(result, 'ItemCreated', templateChosen);
        rootElement.trigger('itemChange', changeData);
        changeData = new mvcct.events.changeData(result, 'NewHtmlCreated', 0);
        rootElement.trigger('itemChange', changeData);
        return result;
    }

    function MvcControlsToolkit_TreeViewToggle(item) {
        if (item == null) return;
        var closedId = item.id.substring(0, item.id.lastIndexOf('_')) + MvcControlsToolkit_TreeView_ClosedPostfix;
        var closedStore = document.getElementById(closedId);
        if (closedStore == null) return;
        closedStore.value = $(item).hasClass($.treeview.classes.expandable) ? "True" : "False";

    }

    function MvcControlsToolkit_TreeView_UpdatePermutations(item, senderId) {
        if (item == null || item.length == 0) return;
        var nodeName = item.attr('id');
        if (nodeName == null) return;
        var place = nodeName.lastIndexOf("_");
        if (place < 0) return;
        nodeName = nodeName.substring(0, place);
        var rootName = document.getElementById(nodeName + '___FatherOriginalId');
        rootName = rootName.value.replace(/[\$\.]/g, '_');
        var oldFather = $('#' + rootName + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        MvcControlsToolkit_TreeView_UpdateFather(item[0], rootName + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        MvcControlsToolkit_TreeView_UpdateFather(item[0], null);
        if (basic.updated) return;
        var root = pstatus[rootName + MvcControlsToolkit_TreeView_RootNamePostfix];
        var rootElement = $('#' + root + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        var changeData = new mvcct.events.changeData(item, 'ItemMoved', oldFather);
        rootElement.trigger('itemChange', changeData);
        basic.updated = true;
    }

    function MvcControlsToolkit_TreeView_AdjustToggleButton(
        id,
        textOrUrlEdit, cssClassEdit,
        textOrUrlUndoEdit, cssClassUndoEdit,
        textOrUrlRedoEdit, cssClassRedoEdit) {

        var button = $('#' + id + MvcControlsToolkit_TreeView_ToggleEditPostfix);
        if (button.length == 0) return;

        if (typeof pstatus[id + MvcControlsToolkit_TreeView_ButtonModePostfix] === 'undefined')
            return;

        var buttonMode = pstatus[id + MvcControlsToolkit_TreeView_ButtonModePostfix];
        if (buttonMode == 0) {
            button.removeClass(cssClassUndoEdit);
            button.removeClass(cssClassRedoEdit);
            button.addClass(cssClassEdit);
            MvcControlsToolkit_Button_AdjustText(
                id + MvcControlsToolkit_TreeView_ToggleEditPostfix,
                textOrUrlEdit);
        }
        else if (buttonMode == 1) {
            button.removeClass(cssClassUndoEdit);
            button.removeClass(cssClassEdit);
            button.addClass(cssClassRedoEdit);
            MvcControlsToolkit_Button_AdjustText(
                id + MvcControlsToolkit_TreeView_ToggleEditPostfix,
                textOrUrlRedoEdit);
        }
        else {
            button.removeClass(cssClassRedoEdit);
            button.removeClass(cssClassEdit);
            button.addClass(cssClassUndoEdit);
            MvcControlsToolkit_Button_AdjustText(
                id + MvcControlsToolkit_TreeView_ToggleEditPostfix,
                textOrUrlUndoEdit);
        }

    }

    function MvcControlsToolkit_TreeView_ToggleEdit(
        id,
        textOrUrlEdit, cssClassEdit,
        textOrUrlUndoEdit, cssClassUndoEdit,
        textOrUrlRedoEdit, cssClassRedoEdit) {

        if (typeof pstatus[id + MvcControlsToolkit_TreeView_ButtonModePostfix] === 'undefined')
            return;

        var buttonMode = pstatus[id + MvcControlsToolkit_TreeView_ButtonModePostfix];


        if (buttonMode == 0 || buttonMode == 1) {
            var edit = pstatus[id + MvcControlsToolkit_TreeView_SaveEditPostfix];
            $('#' +
                id + MvcControlsToolkit_TreeView_ContainerDisplayPostfix).before(edit);
            var display = $('#' +
                id + MvcControlsToolkit_TreeView_ContainerDisplayPostfix).detach();
            pstatus[id + MvcControlsToolkit_TreeView_SaveDisplayPostfix] = display;
            pstatus[id + MvcControlsToolkit_TreeView_ButtonModePostfix] = 2;


            document.getElementById(id + MvcControlsToolkit_TreeView_IsEditPostFix).value = 'True';
        }
        else {
            var display = pstatus[id + MvcControlsToolkit_TreeView_SaveDisplayPostfix];
            $('#' +
                id + MvcControlsToolkit_TreeView_ContainerEditPostfix).before(display);
            var edit = $('#' +
                id + MvcControlsToolkit_TreeView_ContainerEditPostfix).detach();
            pstatus[id + MvcControlsToolkit_TreeView_SaveEditPostfix] = edit;
            pstatus[id + MvcControlsToolkit_TreeView_ButtonModePostfix] = 1;

            document.getElementById(id + MvcControlsToolkit_TreeView_IsEditPostFix).value = 'False';
        }
        MvcControlsToolkit_TreeView_AdjustToggleButton(
        id,
        textOrUrlEdit, cssClassEdit,
        textOrUrlUndoEdit, cssClassUndoEdit,
        textOrUrlRedoEdit, cssClassRedoEdit);
    }

    function MvcControlsToolkit_TreeView_UpdateFather(item, fatherId) {
        if (item == null && fatherId == null) return;
        var root = null;
        var parentId = fatherId;
        if (parentId == null) {
            root = item.parentNode;
            parentId = root.getAttribute('id');
        }
        else {
            root = document.getElementById(parentId);
        }
        var place = parentId.lastIndexOf("_");
        if (place < 0) return;
        var parentName = parentId.substring(0, place);
        var itemsHandleName = parentName + "_handle";

        var countSonsField = document.getElementById(parentName + '___SonNumber');
        if (countSonsField == null) return;
        countSonsField.value = root.childNodes.length + '';

        var originaIdField = document.getElementById(parentName + '___OriginalId');
        if (originaIdField == null) return;
        var rootName = originaIdField.value;

        var nodeName = null;
        var placeAsSonField = null;
        var fatherNameField = null;
        for (i = 0; i < root.childNodes.length; i++) {

            var nodeId = root.childNodes[i].getAttribute('id');
            place = nodeId.lastIndexOf("_");
            if (place < 0) continue;
            nodeName = nodeId.substring(0, place);

            placeAsSonField = document.getElementById(nodeName + '___PositionAsSon');
            placeAsSonField.value = i + '';

            fatherNameField = document.getElementById(nodeName + '___FatherOriginalId');
            fatherNameField.value = rootName;
            if (root.childNodes[i] == item) {
                place = item.id.lastIndexOf("_");


                var innerContainer = $(document.getElementById(item.id.substring(0, place) + "___Item_SubContainer"));

                if (!innerContainer.hasClass(itemsHandleName)) {
                    innerContainer.removeClass();
                    innerContainer.addClass(itemsHandleName);
                }
                var current = $(item);
                if (i != root.childNodes.length - 1
                    ) {
                    current
                    .removeClass($.treeview.classes.last)
                    .removeClass($.treeview.classes.lastCollapsable)
                    .removeClass($.treeview.classes.lastExpandable)
                    .find(">.hitarea")
                        .replaceClass($.treeview.classes.lastCollapsableHitarea, $.treeview.classes.collapsableHitarea)
                        .replaceClass($.treeview.classes.lastExpandableHitarea, $.treeview.classes.expandableHitarea);

                }
            }
        }
        if (root.childNodes.length > 0) {
            var last = $(root.childNodes[root.childNodes.length - 1]);
            if (!last.hasClass($.treeview.classes.last)) {
                last.addClass($.treeview.classes.last)
                    .filter("." + $.treeview.classes.expandable).replaceClass($.treeview.classes.last, $.treeview.classes.lastExpandable).end()
                    .find(">.hitarea").replaceClass($.treeview.classes.expandableHitarea, $.treeview.classes.lastExpandableHitarea).end()
                    .filter("." + $.treeview.classes.collapsable).replaceClass($.treeview.classes.last, $.treeview.classes.lastCollapsable).end()
                    .find(">.hitarea").replaceClass($.treeview.classes.collapsableHitarea, $.treeview.classes.lastCollapsableHitarea);
            }
        }
        if (root.childNodes.length > 1) {
            var semiLast = $(root.childNodes[root.childNodes.length - 2]);

            semiLast
                .removeClass($.treeview.classes.last)
                    .removeClass($.treeview.classes.lastCollapsable)
                    .removeClass($.treeview.classes.lastExpandable)
                    .find(">.hitarea")
                        .replaceClass($.treeview.classes.lastCollapsableHitarea, $.treeview.classes.collapsableHitarea)
                        .replaceClass($.treeview.classes.lastExpandableHitarea, $.treeview.classes.expandableHitarea);

        }


    }

    function MvcControlsToolkit_TreeView_ItemName(item) {
        var itemRoot = item.id;
        var place = itemRoot.lastIndexOf("_");
        if (place < 0) return null;

        return itemRoot.substring(0, place) + '___Item_Container';
    }

    function MvcControlsToolkit_TreeView_AddNew(root, templateChosen, item, after) {
        if (typeof (root) != 'string') root = MvcControlsToolkit_TreeView_ItemName(root);
        var place = root.lastIndexOf("___");
        if (place < 0) return;
        var root = root.substring(0, place);

        return MvcControlsToolkit_TreeView_AddNewChoice(root, templateChosen, item, after);



    }

    function MvcControlsToolkit_TreeView_Delete(node) {
        var itemName = node;
        if (typeof (itemName) != 'string') itemName = MvcControlsToolkit_TreeView_ItemName(itemName);
        var place = itemName.lastIndexOf("___");
        if (place < 0) return;
        itemName = itemName.substring(0, place);

        var item = document.getElementById(itemName + MvcControlsToolkit_TreeView_ContainerPrefix);
        var jItem = $(item);
        var rootName = document.getElementById(itemName + '___FatherOriginalId');
        rootName = rootName.value.replace(/[\$\.]/g, '_');
        var root = pstatus[rootName + MvcControlsToolkit_TreeView_RootNamePostfix];
        var rootElement = $('#' + root + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        var changeData = new mvcct.events.changeData(jItem, 'ItemDeleting', 0);
        rootElement.trigger('itemChange', changeData);
        if (changeData.Cancel == true) return;
        $(item).remove();
        MvcControlsToolkit_TreeView_UpdateFather(item, rootName + MvcControlsToolkit_TreeView_ItemsContainerPrefix);
        changeData = new mvcct.events.changeData(jItem, 'ItemDeleted', 0);
        rootElement.trigger('itemChange', changeData);

    }

    function MvcControlsToolkit_TreeView_Move(item, target, after) {
        if (after != true) $(item).insertBefore(target);
        else $(item).insertAfter(target);
        basic.updated = false;
        MvcControlsToolkit_TreeView_UpdatePermutations($(item), -1);
    }

    function MvcControlsToolkit_TreeView_MoveAppend(item, target) {
        $(item).appendTo($(target).find('>.mvcct-items-container'));
        basic.updated = false;
        MvcControlsToolkit_TreeView_UpdatePermutations($(item), -1);
    }

    window["mvcct"] = window["mvcct"] || {};
    var basic = mvcct.basicControls = mvcct.basicControls || {};
    mvcct.html = mvcct["html"] || {};
    var treeview = mvcct.html.serverTreeview = {};

    basic.treeViewUpdatePermutations = MvcControlsToolkit_TreeView_UpdatePermutations;
    basic.treeViewStartDrag = MvcControlsToolkit_TreeView_StartDrag;
    basic.treeViewStopDrag = MvcControlsToolkit_TreeView_StopDrag;
    basic.treeViewSelectLevel = MvcControlsToolkit_TreeView_SelectLevel;
    basic.treeViewPrepareTemplates = MvcControlsToolkit_TreeView_PrepareTemplates;
    basic.treeViewToggleEdit = MvcControlsToolkit_TreeView_ToggleEdit;
    basic.treeViewAdjustToggleButton = MvcControlsToolkit_TreeView_AdjustToggleButton;
    basic.treeViewToggleCallback = MvcControlsToolkit_TreeViewToggle;

    treeview.treeViewToggle = MvcControlsToolkit_TreeView_Toggle;
    treeview.treeViewClose = MvcControlsToolkit_TreeView_Close;
    treeview.treeViewMvcOpen = MvcControlsToolkit_TreeView_Open;
    treeview.changeNodeState = MvcControlsToolkit_TreeView_ChangeNodeState;
    treeview.addNew = MvcControlsToolkit_TreeView_AddNew;
    treeview.deleteNode = MvcControlsToolkit_TreeView_Delete;
    treeview.move = MvcControlsToolkit_TreeView_Move;
    treeview.moveAppend = MvcControlsToolkit_TreeView_MoveAppend;
})(jQuery);