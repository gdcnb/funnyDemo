var objProto = Object.prototype,
    hasOwn = objProto.hasOwnProperty;

/**
 * 在webview下用于打印日志的方法
 * @param message 要打印的日志信息
 */
function webviewLog(message) {
    var $log = domFind('#log');

    //插入一个div用于记录日志信息
    if($log.length === 0){
        append(document.body, '<div id="log" style="position:absolute;width:100%;height:300px;top:300px;z-index:1000;background:#fff;"></div>');
        $log = domFind('#log');
    }

    $log[0].innerHTML += message + '<br>';
}

function formatUrl(url, keyword) {
    url = url || '';
    keyword = encodeURIComponent(keyword || '');

    if (/(\{keyword\})/.test(url)) {
        url = url.replace(RegExp.$1, keyword);
    }
    return url;
}

function inArray (item, arr) {
    for(var i = 0, len = arr.length; i < len; i++) {
        if(JSON.stringify(item) === JSON.stringify(arr[i])) {
            return i;
        }
    }
    return -1;
}

function trim(str){
    // 用正则表达式将前后空格
    // 用空字符串替代。
    return str.replace(/(^\s*)|(\s*$)/g, '');
}
/**
 * dom对象选择器
 * @param parentDom 父级dom对象(可选参数)
 * @param query css查询条件
 * @returns {NodeList}
 */
function domFind(parentDom, query){
    if(arguments.length === 2 && typeof arguments[0] === 'object') {
        return parentDom.querySelectorAll(query);
    } else {
        return document.querySelectorAll(arguments[0]);
    }
}

/**
 * 添加element响应事件
 * @param element
 * @param type
 * @param handler
 */
function addEvent(element, type, handler) {
    //如果element是nodeList,则递归执行
    if(element instanceof NodeList){
        for(var i = 0; i < element.length; i++) {
            addEvent(element[i], type, handler);
        }
    } else {
        element.addEventListener(type, handler, false);
    }
}

/**
 * 移除element响应事件
 * @param element
 * @param type
 * @param handler
 */
function removeEvent(element, type, handler) {
    if(element instanceof NodeList){
        for(var i = 0; i < element.length; i++) {
            removeEvent(element[i], type, handler);
        }
    } else {
        element.removeEventListener(type, handler, false);
    }
}

/**
 * 阻止浏览器的默认行为
 * @param e
 */
function preventDefault(e) {
    e.preventDefault();
}

/**
 * 管理手机上的点击事件
 * @param element
 * @param handler
 */
function addTouchEvent(element, handler) {
    var isClick, clickTimer,
        initPos = {},
        lastPos = {};

    function onTouchStart(e) {
        var t = e.touches[0];
        isClick = true;
        clickTimer = setTimeout(function () {
            isClick = false;
        }, 300);
        initPos.x = lastPos.x = t.clientX;
        initPos.y = lastPos.y = t.clientY;
    }

    function onTouchMove(e) {
        var t = e.touches[0];
        lastPos.x = t.clientX;
        lastPos.y = t.clientY;
    }

    function onTouchEnd(e) {
        clearTimeout(clickTimer);
        if (initPos.x === lastPos.x &&
            initPos.y === lastPos.y &&
            isClick) {

            //要延时执行，防止android下touch事件穿透
            //注：这时要把e.currentTarget当参数传给回调函数，回调函数执行时的e.currenTarget已经为null
            setTimeout(handler, 50, e, e.currentTarget);
        }
    }

    addEvent(element, 'touchstart', onTouchStart);
    addEvent(element, 'touchmove', onTouchMove);
    addEvent(element, 'touchend', onTouchEnd);
}

function hasClass(ele,cls) {
    try{
        return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    }catch(e) {
        return false;
    }

}

function addClass(ele,cls) {
    //如果ele是nodeList,则递归执行
    if(ele.hasOwnProperty('length')){
        for(var i = 0; i < ele.length; i++) {
            addClass(ele[i], cls);
        }
    } else {
        if (!hasClass(ele,cls)) {
            var classNames = trim(ele.className) + ' ' + cls;
            ele.className = classNames;
        }
    }
}

function removeClass(ele,cls) {
    //如果ele是nodeList,则递归执行
    if(ele.hasOwnProperty('length')){
        for(var i = 0; i < ele.length; i++) {
            removeClass(ele[i], cls);
        }
    } else {
        if(typeof cls === 'undefined') {
            ele.className = '';
            return;
        }
        if (hasClass(ele,cls)) {
            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            ele.className = ele.className.replace(reg, ' ');
        }
    }

}

function parseDom(htmStr) {
    var domObj = document.createElement('div');
    domObj.innerHTML = htmStr;

    return domObj.childNodes;
}

function prepend(parentDom, htmStr) {
    var nodeList = parseDom(htmStr);
    for(var i = 0; i < nodeList.length; i++) {
        parentDom.insertBefore(nodeList[i], parentDom.firstChild);
    }
}

function append(parentDom, htmStr) {
    parentDom.innerHTML += htmStr;
}

function type (obj) {
    var myType;
    if (obj == null) {
        myType = String(obj);
    } else {
        myType = Object.prototype.toString.call(obj).toLowerCase();
        myType = myType.substring(8, myType.length - 1);
    }
    return myType;
}

function isPlainObject(obj) {
    var key;
    if (!obj || type(obj) !== 'object' ||
        obj.nodeType || 'setInterval' in obj) {
        return false;
    }

    if (obj.constructor &&
        !hasOwn.call(obj, 'constructor') &&
        !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
        return false;
    }

    for (key in obj) {}
    return key === undefined || hasOwn.call(obj, key);
}

function extend(){
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && type(target) !== 'function') {
        target = {};
    }

    // extend caller itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i<length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (isPlainObject(copy) || (copyIsArray = type(copy) === 'array'))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && type(src) === 'array' ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;

}

function each(obj, iterator, context) {
    var i, l, type2;

    if (typeof obj !== 'object') {
        return;
    }

    type2 = type(obj);
    context = context || obj;
    if (type2 === 'array' || type2 === 'arguments') {
        for (i=0, l=obj.length; i<l; i++) {
            if (iterator.call(context, obj[i], i, obj) === false) {
                return;
            }
        }
    } else {
        for (i in obj) {
            if (hasOwn.call(obj, i)) {
                if (iterator.call(context, obj[i], i, obj) === false) {
                    return;
                }
            }
        }
    }
}

// 将方法的 this 绑定为指定的对象
function bind (func, context) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function () {
        return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
    };
}

// shim for Array.prototype.indexOf from MDN
function indexOf (arr, element, fromIndex) {
    if (arr == null) {
        throw new TypeError();
    }
    var t = Object(arr),
        len = Number(t.length);

    if (len !== len || len === 0) {
        return -1;
    }

    var n = 0;
    if (arguments.length > 1) {
        n = Number(fromIndex);
        // if it's NaN
        if (n !== n) {
            n = 0;
        } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === element) {
                return k;
            }
        }
        return -1;
    }
}

function getUrlParam(name){

    var reg = new RegExp('(^|&)'+ name + '=([^&]*)(&|$)'),
        r = window.location.search.substr(1).match(reg);

    return r !== null ? unescape(r[2]) : null;
}

//循环执行函数
function circulateFn(handler, time) {
    setTimeout(function(handler, time){
        handler();

        setTimeout(circulateFn, time, handler, time);
    }, 0, handler, time);
}

//节流器
function throttle(fn, delay){
    var timer = null;
    return function(){
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){
            fn.apply(context, args);
        }, delay);
    };
}

//时间戳格式化为 7-1 20:30 格式
function formatDate(unixTime){
    var date,month,currentDate,hh,mm;
        date=new Date(unixTime);
        month=date.getMonth()+1;
        currentDate=date.getDate();
        hh=date.getHours()<10 ? "0"+date.getHours() :date.getHours();
        mm=date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();
    return month+'-'+currentDate+" "+hh+":"+mm;
}

//日期格式化方法
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

module.exports = {
    getUrlParam: getUrlParam,
    formatUrl: formatUrl,
    formatDate:formatDate,
    inArray: inArray,
    domFind: domFind,
    addEvent: addEvent,
    addTouchEvent: addTouchEvent,
    removeEvent: removeEvent,
    preventDefault: preventDefault,
    hasClass: hasClass,
    addClass: addClass,
    trim: trim,
    prepend: prepend,
    append: append,
    webviewLog: webviewLog,
    removeClass: removeClass,
    os: (function(){
        // 检测系统和浏览器
        var
            ua = navigator.userAgent,
            os = {},
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

        if (iphone) { os.ios = os.iphone = true; os.version = iphone[2].replace(/_/g, '.'); }
        if (ipad) { os.ios = os.ipad = true; os.version = ipad[2].replace(/_/g, '.'); }
        return os;
    })(),
    type: type,
    bind: bind,
    indexOf: indexOf,
    extend: extend,
    circulateFn: circulateFn,
    throttle: throttle,
    each: each
};