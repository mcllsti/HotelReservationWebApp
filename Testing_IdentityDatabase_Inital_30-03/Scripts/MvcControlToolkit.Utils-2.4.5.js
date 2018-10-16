/* ****************************************************************************
*  MvcControlToolkit.Utils-2.4.5.js
* Copyright (c) Francesco Abbruzzese. All rights reserved.
* francesco@dotnet-programming.com
* http://www.dotnet-programming.com/
* 
* This software is subject to the the license at http://www.mvc-controls.com/media/eula.html 
* and included in the license.txt file of this distribution.
* 
* You must not remove this notice, or any other, from this software.
*
* ***************************************************************************/
(function ($) {
    var mvcct = window["mvcct"] = window["mvcct"] || {};
    var ko = window["ko"];
    if (typeof ko === 'undefined' || typeof ko.bindingHandlers === 'undefined') {
        ko = window["ko"] = {
            'isObservable': function (instance) { return false; },
            'observable': function (x) { return x; },
            'observableArray': function (x) { return x; },
            'applyBindings': function (x, y) { },
            'utils': {
                'unwrapObservable': function (instance) { return instance; }
            },
            'mapping': {
                'fromJS': function (x) { return x; }
            }
        };
    }   
    mvcct.utils = mvcct["utils"] || {};
    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
    var dateRewriteOut = /\\\\\/Date\((\d+)(?:[-+]\d+)?\)\\\\\//ig;
    var dateRewriteIn = /\\\/Date\((\d+)(?:[-+]\d+)?\)\\\//ig;
    function stringify(json, isoDate) {

        var res = JSON.stringify(json, function (key, value) {
            if (typeof value == "string") {
                dateRewriteIn.lastIndex = 0;
                var a = dateRewriteIn.exec(value);
                if (a) {
                    var mill = parseInt(a[1]);
                    var corrected = mill;
                    if (isoDate) {
                        value = ISODateString(new Date(corrected));
                    }
                    //                    else {
                    //                        var date = new Date(corrected);
                    //                        value = '\\/Date(' + Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()) + ')\\/';
                    //                    }
                    this[key] = value;
                    return value;
                }
            }
            return value;
        });
        if (!isoDate) res = res.replace(dateRewriteOut, "\\/Date($1)\\/");
        return res;
    }
    function ISODateString(d, simplified) {
        function pad(n) { return n < 10 ? '0' + n : n }
        return d.getUTCFullYear() + '-'
              + pad(d.getUTCMonth() + 1) + '-'
              + pad(d.getUTCDate()) + 'T'
              + pad(d.getUTCHours()) + ':'
              + pad(d.getUTCMinutes()) + ':'
              + pad(d.getUTCSeconds()) + (simplified ? '' : 'Z')
    }

    function property(item, name, wholeObservable) {
        if (!name) return item;
        if (name.charAt(0) == "#") {
            name = name.substring(1);
            item = window;
        }
        if (item == window && name.length > 0 && name.charAt(0) == '@') {
            name = (name.length > 1) ? name.substring(2) : '';
            item = mvcct.utils.currentModel || window;
        }
        name = name.split(".");
        if (name.length == 0) return item;
        var res = item;
        for (var i = 0; i < name.length - 1; i++) {
            res = ko.utils.unwrapObservable(res[name[i]]);
        }
        res = res[name[name.length - 1]];
        if (wholeObservable) return res;
        else return ko.utils.unwrapObservable(res);
    }
    function propertySet(item, name, value, changeObservable) {
        if (item == window && name.length > 0 && name.charAt(0) == '@') {
            name = (name.length > 1) ? name.substring(2) : '';
            item = mvcct.utils.currentModel || window;
        }
        name = name.split(".");
        var res = item;
        for (var i = 0; i < name.length - 1; i++) {
            var nRes = ko.utils.unwrapObservable(res[name[i]]);
            if (!nRes) { nRes = {}; res[name[i]] = nRes; }
            res = nRes;
        }
        if ((!changeObservable) && ko.isObservable(res[name[name.length - 1]]))
            res[name[name.length - 1]](value);
        else
            res[name[name.length - 1]] = value;
    }
    function propertySetA(item, name, value, changeObservable) {
        var toDelete = false;
        var toAdd = false;
        var toReverse = false;
        if (name.length > 2) {
            if (name.charAt(0) == '-') {
                toReverse = true;
                name = name.substring(1);
            }
            if (name.substring(name.length - 2) == ']-') {
                toDelete = true;
                name = name.substring(0, name.length - 2);
            }
            else if (name.substring(name.length - 2) == ']+') {
                toAdd = true;
                name = name.substring(0, name.length - 2);
            }
        }
        name = name.split(/[\[\.\]]+/);
        var res = ko.utils.unwrapObservable(item);
        var resO = item;
        var isArray = mvcct.utils.isArray(res);
        var newName = [];
        for (var i = 0; i < name.length; i++)
            if (name[i]) newName.push(name[i]);
        name = newName;
        try {
            for (var i = 0; i < name.length - 1; i++) {
                if (!name[i]) continue;
                resO = res[isArray ? parseInt(name[i]) : name[i]]
                var nRes = ko.utils.unwrapObservable(resO);
                if (!nRes) { nRes = {}; res[name[i]] = nRes; }
                res = nRes;
                isArray = mvcct.utils.isArray(res);
            }
            if (isArray) {
                var index = parseInt(name[name.length - 1]);
                if (toReverse) index = res.length - index;
                if (index < 0) index = 0;
                if (toDelete) resO.splice(index, 1);
                else if (toAdd) {
                    if (index >= res.length) resO.push(value);
                    else resO.splice(index, 0, value);
                }
                else res[parseInt(name[name.length - 1])] = value;
            }
            else {
                if ((!changeObservable) && ko.isObservable(res[name[name.length - 1]]))
                    res[name[name.length - 1]](value);
                else
                    res[name[name.length - 1]] = value;
            }
        }
        catch (x) {
            throw "Expression doesnt match data structure";
        }
    }
    function propertyA(item, name, wholeObservable) {
        name = name.split(/[\[\.\]]+/);
        var res = item;
        var resO = item;
        var isArray = mvcct.utils.isArray(res);
        var newName = [];
        for (var i = 0; i < name.length; i++)
            if (name[i]) newName.push(name[i]);
        name = newName;
        try {
            for (var i = 0; i < name.length; i++) {
                if (!name[i]) continue;
                resO = res[isArray ? parseInt(name[i]) : name[i]]
                var nRes = ko.utils.unwrapObservable(resO);
                if (!nRes) { nRes = {}; res[name[i]] = nRes; }
                res = nRes;
                isArray = mvcct.utils.isArray(res);
            }
            return wholeObservable ? resO : res;
        }
        catch (x) {
            throw "Expression doesnt match data structure";
        }
    }
    function createIfNotExists(name) {
        name = name.split(".");
        var res = window;
        for (var i = 0; i < name.length - 1; i++) {
            var nRes = ko.utils.unwrapObservable(res[name[i]]);
            if (!nRes) { nRes = {}; res[name[i]] = nRes; }
            res = nRes;
        }
        if (!res[name[name.length - 1]]) res[name[name.length - 1]] = {};
        return res[name[name.length - 1]];
    }
    mvcct.utils.property = property;
    mvcct.utils.propertySet = propertySet;
    mvcct.utils.propertyComplete = propertyA;
    mvcct.utils.propertySetComplete = propertySetA;
    mvcct.utils.createIfNotExists = createIfNotExists;
    mvcct.utils.classof = function (o) {
        if (o === null) {
            return "null";
        }
        if (o === undefined) {
            return "undefined";
        }
        return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
    };
    mvcct.utils.isDate = function (o) {
        return mvcct.utils.classof(o) === "date";
    };
    mvcct.utils.isFunction = function (o) {
        return mvcct.utils.classof(o) === "function";
    };
    mvcct.utils.isObject = function (o) {
        return mvcct.utils.classof(o) === "object";
    };
    mvcct.utils.isString = function (o) {
        return (typeof o === "string");
    };
    mvcct.utils.isGuid = function (o) {
        return (typeof o === "string") && /[a-fA-F\d]{8}-(?:[a-fA-F\d]{4}-){3}[a-fA-F\d]{12}/.test(o); ;
    };
    mvcct.utils.isArray = function (o) {
        return mvcct.utils.classof(o) === "array";
    };
    mvcct.utils.stringify = function (obj, isoDate) {
        return stringify(obj, isoDate);
    };
    mvcct.utils.ISODate = function (obj, simplified) {
        return ISODateString(obj, simplified);
    };
    mvcct.utils.idFromName = function (name) {
        return !name ? name : name.replace(/[\$\[\]\.]/g, '_');
    };
    mvcct.utils.changeIndex = function (prefixId, newPrefixId, id, newIndex) {
        prefixId = prefixId + '['; //add [
        newPrefixId = newPrefixId + '['; //add 
        if (!(id.indexOf(prefixId) === 0)) return null;
        id = id.slice(prefixId.length);
        var closeSquare = id.indexOf(']');
        if (closeSquare <= 0) return null;
        var index = id.slice(0, closeSquare);
        index = parseInt(index);
        if (isNaN(index)) return null;

        if (mvcct.utils.isFunction(newIndex)) index = newIndex(index);
        else index = newIndex;
        if (index === null) return null;
        return newPrefixId + index + id.slice(closeSquare);
    };
    mvcct.utils.cloneEntity = function (x, visitRelation, cloneArray) {
        if (!x) return x;
        var obs = ko.isObservable(x);
        x = ko.utils.unwrapObservable(x);
        var type = this.classof(x);
        if (type == "object") {
            var y = {};
            for (var property in x) {
                if (property == '__ko_mapping__' || ((!ko.isObservable(x[property])) && (this.classof(x[property]) == 'function'))) continue;
                y[property] = this.cloneEntity(x[property],
                    this.isFunction(visitRelation) ? visitRelation(property) : visitRelation,
                    this.isFunction(cloneArray) ? cloneArray(property) : cloneArray);
            }
            return obs ? ko.observable(y) : y;
        }
        else if (type == "array") {
            if (!visitRelation) return null;
            y = [];
            for (var i = 0; i < x.length; i++) {
                if (cloneArray) y.push(this.cloneEntity(x[i], visitRelation, cloneArray));
                y.push(x[i]);
            }
            return obs ? ko.observableArray(y) : y;
        }
        else {
            y = x;
            return obs ? ko.observable(y) : y;
        }

    };
    function identityHash(x, y) {
        return x + "";
    }
    function complexHash(x, y) {
        return $.toJSON(x);
    }
    function identityKeyHash(x, y) {
        return property(x, y) + "";
    }
    function complexKeyHash(x, y) {
        return $.toJSON(property(x, y));
    }
    mvcct.utils.arrayDiff = function (arr1, arr2, keyExpression, keyIsComplex, updates, release) {
        var comparer = null;
        if (keyExpression) {
            if (keyIsComplex) comparer = complexKeyHash;
            else comparer = identityKeyHash;
        }
        else {
            if (keyIsComplex) comparer = complexHash;
            else comparer = identityHash;
        }
        
        
        var obsArr1 = arr1;
        arr1 = ko.utils.unwrapObservable(arr1);
        arr2 = ko.utils.unwrapObservable(arr2);
        var lookUp = null;
        if (arr2) {
            lookUp = {};
            for (var i = 0; i < arr2.length; i++) lookUp[comparer(arr2[i], keyExpression)] = true;
        }
        var updatesLookUp = null;
        if (updates) {
            updates = ko.utils.unwrapObservable(updates);
            updatesLookUp = {};
            for (var i = 0; i < updates.length; i++) updatesLookUp[comparer(updates[i], keyExpression)] = updates[i];
        }
        var res = [];
        var removed = [];
        for (var i = 0; i < arr1.length; i++) {
            var x = arr1[i];
            if (lookUp && !lookUp[comparer(x, keyExpression)]) res.push(x);
            else if (release) removed.push(x);
            if (updatesLookUp) {
                var newVersion = updatesLookUp[comparer(x, keyExpression)];
                if (newVersion) {
                    mvcct.utils.restoreEntity(newVersion, x, false);
                    var tData = x._oldValue_;
                    if (tData) {
                        tData = tData();
                        tData.ph = false;
                        tData.pph = false;
                        tData.pc = false;
                        mvcct.utils.restoreEntity(newVersion, tData.value, false);
                    }
                    if (x._modified) x._modified(false);
                }
            }
        }
        if (!lookUp || (res.length == arr1.length)) return obsArr1;
        if (ko.isObservable(obsArr1)) {
            obsArr1(res);
            if (mvcct.ko && mvcct.ko.unfreeze) {
                for (var i = 0; i < removed.length; i++) mvcct.ko.unfreeze(removed[i]);
            }
            return obsArr1;
        }
        else return res;
    }
    mvcct.utils.updateCopy = function (x) {
        if (!x['_oldValue_']) return x;
        var tData = x._oldValue_();
        return mvcct.utils.cloneEntity(x, tData.vr, tData.ca);
    }
    mvcct.utils.restoreEntity = function (x, y, visitRelation) {
        var obs = ko.isObservable(x);
        var orOb = x;
        x = ko.utils.unwrapObservable(x);
        var z = ko.utils.unwrapObservable(y);
        var type;
        if (x) type = this.classof(x);
        else type = this.classof(z);
        if (type == "object") {
            for (var property in x) {
                if (property == '__ko_mapping__' || ((!ko.isObservable(x[property])) && (this.classof(x[property]) == 'function'))) continue;
                if (y[property] !== undefined || property == "ModelPrefix" || property == "ModelId" || property == "_tag") {
                    y[property] = this.restoreEntity(x[property], y[property], this.isFunction(visitRelation) ? visitRelation(property) : visitRelation);
                }
            }
            return y;
        }
        else if (type == "array") {
            if (!visitRelation) return y;
            if (obs) y(x);
            else y = x;
            return y;
        }
        else {
            if (obs) y(x);
            else y = x;
            return y;
        }

    };
    mvcct.utils.Track = function (x, visitRelation, cloneArray, updater) {
        if (x['_oldValue_']) return;
        var tData = {
            value: mvcct.utils.cloneEntity(x, visitRelation, cloneArray),
            vr: visitRelation, up: updater,
            ca: cloneArray
        };
        x['_oldValue_'] = function () { return tData };
    };
    mvcct.utils.accept = function (x) {
        if (!x['_oldValue_']) return;
        x._oldValue_ = false;
    };
    mvcct.utils.undo = function (x) {
        if (!x['_oldValue_']) return;
        var tData = x._oldValue_();
        mvcct.utils.restoreEntity(tData.value, x, tData.vr);
    };
    mvcct.utils.changed = function (x) {
        if (!x['_oldValue_']) return true;
        var tData = x._oldValue_();
        return mvcct.utils.compareEntities(tData.value, x, tData.vr, tData.ca);
    }
    mvcct.utils.compareEntities = function (x, y, visitRelation, verifyRelation) {
        y = ko.utils.unwrapObservable(y);
        x = ko.utils.unwrapObservable(x);
        if (x === y) return false;
        var type;
        if (x) type = this.classof(x);
        else type = this.classof(y);
        if (type == "object") {
            for (var property in x) {
                if (property == '_modified' || property == '__ko_mapping__' || ((!ko.isObservable(x[property])) && (this.classof(x[property]) == 'function'))) continue;
                if (this.compareEntities(x[property], y[property],
                    this.isFunction(visitRelation) ? visitRelation(property) : visitRelation,
                    this.isFunction(verifyRelation) ? verifyRelation(property) : verifyRelation
                )) return true;
            }
            return false;
        }
        else if (type == "array") {
            if (!visitRelation) return false;
            if (x.length != y.length) return true;
            for (var i = 0; i < x.length; i++) {
                if (x[i] != y[i]) return true;
                if (verifyRelation) {
                    if (this.compareEntities(x[i], y[i], visitRelation, verifyRelation)) return true;
                }
            }
            return false;
        }
        else if (type == "date") {
            if (this.classof(y) != "date") return true;
            return x.getTime() != y.getTime();
        }
        else {
            return y !== x;
        }

    };
    mvcct.utils.cache = function (size) {
        var lookUp = new Array();
        var queue = [];
        var entriesCount = 0;
        return {
            changeSize: function (x) {
                size = x;
            },
            add: function (key, value) {
                var old = lookUp[key];
                var res = null;
                if (old) {
                    old.invalid = true;
                    old.key = null;
                    old.value = null;
                }
                else {
                    entriesCount++;
                    if (entriesCount > size) {
                        var oldest = queue.pop();
                        while (oldest.invalid) oldest = queue.pop();
                        if (oldest) {
                            delete lookUp[oldest.key];
                            res = oldest.value;
                        }
                    }
                }
                var newEntry = {
                    key: key,
                    value: value,
                    invalid: false
                };
                lookUp[key] = newEntry;
                queue.unshift(newEntry);
                return res;
            },
            get: function (key) {
                var res = lookUp[key];
                if (!res || res.invalid) return null;
                var fres = res.value;
                res.invalid = true;
                res.key = null;
                res.value = null;
                var newEntry = {
                    key: key,
                    value: fres,
                    invalid: false
                };
                lookUp[key] = newEntry;
                queue.unshift(newEntry);
                return fres;
            },
            remove: function (key) {
                var res = lookUp[key];
                if (!res) return;
                res.invalid = true;
                res.value = null;
                res.key = null;
                delete lookUp[key];
                entriesCount--;
            },
            clear: function () {
                lookUp = new Array;
                entriesCount = 0;
                queue = [];
            },
            save: function (key, session, koMapped, callback) {
                if (!queue) return;
                var toSave = [];
                for (var i = 0; i < queue.length; i++) {
                    currData = queue[i];
                    if (!currData.invalid) {
                        if (callback)
                            toSave.push(callback(currData));
                        else
                            toSave.push(currData);
                    }
                }
                queue = toSave;
                if (koMapped) toSave = ko.mapping.toJS(toSave);
                if (session) sessionStorage.setItem(key, mvcct.utils.stringify(toSave));
                else localStorage.setItem(key, mvcct.utils.stringify(toSave));
            },
            load: function (key, session, koMap, callback) {
                if (session) queue = sessionStorage.getItem(key);
                else queue = localStorage.getItem(key);
                if (!queue) throw "the key: " + key + " was not found";
                queue = $.parseJSON(queue);
                entriesCount = queue.length;
                if (koMap) queue = ko.mapping.fromJS(queue)();
                lookUp = new Array();
                for (var i = 0; i < queue.length; i++) {
                    if (callback) queue[i] = callback(queue[i]);
                    if (koMap) queue[i].value = ko.mapping.fromJS(queue[i].value);
                    lookUp[queue[i].key] = lookUp[queue[i].value];
                }

            }
        };
    };
    mvcct.utils['cloneDeep'] = function (source, cf) {
        source = ko.utils.unwrapObservable(source);
        var type = mvcct.utils.classof(source);
        if ((!source) || (type != "object" && type != "array")) return source;
        var destination = null;
        if (type == "array") destination = [];
        else destination = {};
        mvcct.utils['copyModel'](source, destination, cf);
        return destination;
    }
    mvcct.utils['copyModel'] = function (source, destination, cf) {
        source = ko.utils.unwrapObservable(source);
        destination = ko.utils.unwrapObservable(destination);
        var type = mvcct.utils.classof(source);
        if ((!source) || (type != "object" && type != "array" && type != "function")) return;
        for (var property in source) {
            if (property == "__ko_mapping__" || property == "ModelPrefix" || property == "ModelId" || property == "_tag") continue;
            var val = ko.utils.unwrapObservable(source[property]);
            var ptype = mvcct.utils.classof(val);
            if (ptype == "array") {
                var destArray = [];
                for (var i = 0, j = val.length; i < j; i++) {
                    var elem = ko.utils.unwrapObservable(val[i]);
                    var elemObs = ko.isObservable(val[i]);
                    var destelem = null;
                    var elemtype = mvcct.utils.classof(elem);
                    if (elemtype == 'object') {
                        destelem = elemObs ? ko.observable({}) : {};
                        mvcct.utils['copyModel'](elem, destelem, cf);
                    }
                    else if (elemtype == 'array') {
                        destelem = elemObs ? ko.observable([]) : [];
                        mvcct.utils['copyModel'](elem, destelem, cf);
                    }
                    else {
                        destelem = elemObs ? ko.observable(elem) : elem;
                    }
                    destArray.push(destelem);
                }
                if (destination[property]) {
                    if (ko.isObservable(destination[property]))
                        destination[property](destArray);
                    else
                        destination[property] = destArray;
                }
                else {
                    if (ko.isObservable(source[property]))
                        destination[property] = ko.observableArray(destArray);
                    else
                        destination[property] = destArray;
                }
            }
            else if (ptype == "object") {
                if (!destination[property]) {
                    destination[property] = ko.isObservable(source[property]) ? ko.observable({}) : {};
                }
                mvcct.utils['copyModel'](val, destination[property], cf);
            }
            else if (ptype != 'function') {
                if (destination[property]) {
                    if (ko.isObservable(destination[property]))
                        destination[property](val);
                    else
                        destination[property] = val;
                }
                else destination[property] = ko.isObservable(source[property]) ? ko.observable(val) : val;
            }
            else if (cf != null) destination[property] = val;

        }

    };
    mvcct.utils['visitModel'] = function (source, callBack, visitArrays, onlyObjects, properties) {
        if (properties == null) {
            properties = [];
            source = ko.utils.unwrapObservable(source);
        }
        var type = mvcct.utils.classof(source);
        if ((!source) || type != "object") return;
        var data = {};
        callBack(properties.join('.'), source, type, data);
        if (data && data.cancel) return;
        for (var property in source) {
            if (property == "__ko_mapping__" || property == "ModelPrefix" || property == "ModelId" || property == "_tag") continue;
            var val = ko.utils.unwrapObservable(source[property]);
            var ptype = mvcct.utils.classof(val);
            if (ptype == "array") {
                if (!onlyObjects) callBack(properties.join('.') + "." + property, val, ptype);
                if (visitArrays) {
                    for (var i = 0; i < val.length; i++) {
                        properties.push(property + "[" + i + "]");
                        mvcct.utils['visitModel'](val[i], callBack, visitArrays, onlyObjects, properties)
                        properties.pop();
                    }
                }
            }
            else if (ptype == "object") {
                properties.push(property);
                mvcct.utils['visitModel'](val, callBack, visitArrays, onlyObjects, properties);
                properties.pop();
            }
            else if (ptype != 'function' && (!onlyObjects)) {
                properties.push(property);
                callBack(properties.join('.'), val, ptype, data);
                properties.pop();
            }

        }

    };
})(jQuery);