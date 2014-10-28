/**
 * 采集脚本
 * 维护者：Nino Zhang
 * 起始日期：2014-1-12
 * 版本：0.0.1
 */
 
//try {
/**
 * 调试相关
 */
var log = {};

log.debug = function (n) {
    console.log(n);
};
log.info = function (n) {
    console.info(n);
};
log.warn = function (n) {
    console.warn(n);
};
log.error = function (n) {
    console.error(n);
};
(function (name, factory) {

    // 检测上下文环境是否为 AMD 或 CMD
    var hasDefine = typeof define === 'function',
        // 检测上下文环境是否为 node
        hasExports = typeof module !== 'undefined' && module.exports,
        // 检测上下文环境是否为浏览器
        hasWindow = typeof window !== 'undefined';

    // 定义为普通 Node 模块
    if (hasExports) {
        module.exports = factory();

    // AMD 环境或 CMD 环境
    } else if (hasDefine) {
        define(factory);

    // 浏览器环境
    } else if (hasWindow) {
        var ctor = function () {},
            self = new ctor;
        factory.call(self, name);
    }

})('uca', function (name) {

var VERSION = '0.0.1';
/**
 * 基础方法
 */

var breaker = {};

var win = window,
    that = this;

// 开放给外部调用的api
// 有需要开放外部调用的接口就放在这里进行开放
var api = {};
    
// 页面文档对象
var doc,
    // 域名
    domain,
    // body
    body,
    // documentElement
    docElem,
    
    // 客户端屏幕
    screen,
    // 颜色深度
    colorDepth,
    // 屏幕宽
    sWidth,
    // 屏幕高
    sHeight,
    // 页面可见宽
    cWidth,
    // 页面可见高
    cHeight,
    docWidth,
    docHeight,
    // 分辨率
    resolution,
    
    // 浏览器相关信息
    navi,
    // 操作系统平台
    platform,
    // 浏览器的user-agent标识
    ua,
    // 浏览器的user-agent标识转化为小写字符
    ua_lc,

    // 上一个页面的URL
    referrer,

    cookieEnabled,
    timeZone;

// Object原生hasOwnProperty的捷径
var hasOwn = Object.prototype.hasOwnProperty,
    // Object原生toString的捷径
    toString = Object.prototype.toString,
    // String原生substring的捷径
    substring = String.prototype.substring,
    // Array原生slice的捷径
    slice = Array.prototype.slice,
    // Array原生splice的捷径
    splice = Array.prototype.splice,
    // Array原生forEach的捷径
    forEach = Array.prototype.forEach,
    // 四舍五入的捷径
    round = Math.round,
    // 取绝对值的捷径
    abs = Math.abs,
    // 向上取整的捷径
    ceil = Math.ceil,
    // 向下取整的捷径
    floor = Math.floor,
    // 编码
    encode = encodeURIComponent,
    // 解码
    decode = decodeURIComponent;

// Object原生keys捷径
// --es5-keys--
var keys = Object.keys;
// --es5-keys--

// 判断对象是否是数组
// --es5-isArray--
var isArray = Array.isArray;
// --es5-isArray--

// 获取指定对象指定的值
function get(obj, attr) {
    if (isDef(obj)) {
        return obj[attr];
    }
}

// 获取全局值
function $get(attr) {
    return get(win, attr);
}

// 获取 uca 前缀的全局值
function $_get(attr) {
    return get(win, UCA + attr);
}

// 是否完全相等
function equal(v1, v2) {
    return v1 === v2;
}

// 判断某个类中是否有指定的键
function has(obj, key) {
    if (isUndef(obj) || isUndef(key)) {
        return false;
    }
    return hasOwn.call(obj, key) || isDef(obj[key]);
}

// 获取指定对象的子元素数量
function size(obj) {
    var s = 0;
    if (isUndef(obj) || (obj === null)) {
        s = 0;
    } else if (obj.length === +obj.length) {
        s = obj.length;
    } else if (isObject(obj)) {
        s = keys(obj).length;
    } else if (isNumber(obj) || isBoolean(obj)) {
        s = String(obj).length;
    }
    return s;
}

// 遍历方法，'each'的实现，就如'forEach'
// 调用类和数组的原生遍历方法
// 如果有**ECMAScript 5**原生的'forEach'方法则委托其处理
// 来源: underscore
function each(obj, fn, context) {
    if (isUndef(obj) || !isFunction (fn)) {
        return;
    }
    if (forEach && (obj.forEach === forEach)) {
        obj.forEach(fn, context);
    } else if (isArray(obj)) {
        for (var i = 0, l = size(obj); i < l; i++) {
            if (fn.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    } else if (isObject(obj)) {
        for (var key in obj) {
            if (has(obj, key)) {
                if (fn.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
}

// 扩展方法，用于扩展对象
function extend(obj) {
    var prop, src;
    each(slice.call(arguments, 1), function (source) {
        each(source, function (src, prop) {
            if (obj !== src) {
                obj[prop] = src;
            }
        }, this);
    }, this);
    return obj;
}

// 字符串复制
function repeat(string, times) {
    return (times < 1) ? '' : (new Array(times + 1).join(string));
}

// 判断对象是否已定义
function isDef() {
    var args = arguments,
        count = args.length;
    if (count < 2) {
        return typeof(args[0]) !== 'undefined';
    } else {
        var r = true;
        each(args, function (v) {
            if (typeof(v) === 'undefined') {
                r = false;
                return {};
            }
        });
        return r;
    }
}

// 判断对象是否未定义
function isUndef() {
    var args = arguments,
        count = args.length;
    if (count < 2) {
        return typeof(args[0]) === 'undefined';
    } else {
        var r = true;
        each(args, function (v) {
            if (typeof(v) !== 'undefined') {
                r = false;
                return {};
            }
        });
        return r;
    }
}

// 判断对象是否为空值
// 空值情况包括：未定义、null、空字符串、空对象（对象中没有键值）
function isBlank(obj) {
    var blank = true;
    if (isDef(obj) &&
        (obj !== null) &&
        (obj !== 'null') &&
        (obj !== '')) {
        blank = false;
    }
    if (!blank &&
        (isArray(obj) || isObject(obj))) {
        blank = true;
        each(obj, function (v) {
            if (isDef(v)) {
                blank = false;
                return breaker;
            }
        });
    }
    return blank;
}

// 判断对象是否为布尔值
function isBoolean(obj) {
    return (obj === true) || (obj === false);
}

// 判断对象是否为函数
function isFunction (obj) {
    return toString.call(obj) === '[object Function]';
}

// 判断对象是否为字符串
function isString(obj) {
    return toString.call(obj) === '[object String]';
}

// 判断对象是否为字符串
function isNumber(obj) {
    return toString.call(obj) === '[object Number]';
}

// 判断对象是否为Object，这里的Object为狭义上的Object
function isObject(obj) {
    return (obj === Object(obj)) && !isArray(obj) && !isFunction (obj);
}

// 生成随机数
// 可以不指定参数（生成0～1）或指定最大值（生成0～最大值）或最小值和最大值（生成最小值～最大值）
// 使用原生产生随机数的方法
function random() {
    var r = Math.random(),
        args = arguments,
        length = size(args);
    if (length === 1) {
        r *= args[0];
    } else if (length === 2) {
        r = round(r * (args[1] - args[0])) + args[0];
    }
    return r;
}

// 生成随机数，length用于指定所产生结果的长度
// 如果type为空，则生成随机字符串（包含字母和数字）；如果type为‘num’，则生成随机数字字符串（仅包含数字）
function rand(length, type) {
    if (length < 1) {
        return 0;
    }
    var str = '',
        r,
        isNum = (type === 'num');
    while (size(str) < length) {
        r = floor(date.usec() * random() * 999);
        if (!isNum) {
            r = r.toString(16);
        }
        str += r;
    }
    return str.substr(0, length);
}

// 生成唯一id
// 参数flag可以传入标记，如访客标记为'v'，页面标记为'p'，将出现在第3组数据，建议只设置1位字符
function uuid(flag) {
    var pick = function (value, length) {
        var base16 = value.toString(16),
            len = size(base16) - 1,
            str = '';
        while (size(str) < length) {
            str += base16.substr(round(random(0, len)), 1);
        }
        return str;
    };
    
    var t = Date.now(),
        t16 = add0(t.toString(16), 12),
        u1 = t16.substr(0, 8),
        u2 = t16.substr(8, 4),
        u3 = pick(t, 4),
        u4 = pick(rand(t % 97), 2),
        u5 = pick(rand(t % 89), 2),
        u6 = pick(rand(4), 1) + pick(rand(8), 1) + pick(rand(16), 2) +
            pick(rand(32), 2) + pick(rand(64), 3) + pick(rand(128), 3),
        id = '';
    if (flag) {
        u3 = (flag + u3).substr(0, 4);
    }
    id = u1 + '-' + u2  + '-' + u3 + '-' + u4 + u5 + '-' + u6;
    return id.toUpperCase();
}

// 阻塞浏览器进程，默认300毫秒
function sleep(usec) {
    if (!usec) {
        usec = 300;
    }
    var now = date.now(),
        expires = date.at(usec);
    while (now < expires) {
        now = date.now();
    }
}

// 将对象转化为字符串并在前面补足0直到满足指定长度
function add0(obj, length) {
    if (!obj) {
        return '0';
    }
    var str = String(obj),
        times = length - size(str);
    return repeat('0', times) + str;
}

// 延迟一段时间执行方法
function delay(fn, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {return fn.apply(null, args); }, wait);
}

// 延迟执行函数，让浏览器有机会喘口气
function defer(fn) {
    return delay.apply(this, [fn, 1].concat(slice.call(arguments, 1)));
}

// 序列化和反序列化 JSON
// --es5-JSON--
// --es5-JSON--

// 实现简单的自定义事件，供扩展使用
var CustomEvent = {
    // 监听指定事件
    // 参数：事件类型、绑定函数、指针
    on: function (type, fn, context) {
        if (!type || !fn) {
            return;
        }
        var callbacks = this._callbacks || (this._callbacks = {}),
            list = callbacks[type] || (callbacks[type] = []);
        list.push({fn: fn, context: context});
    },
    // 移除事件监听
    // 参数：事件类型、绑定函数、指针
    // 如果不指定事件类型则移除所有事件监听
    off: function (type, fn, context) {
        if (!type) {
            delete this._callbacks;
        } else {
            var list = this._callbacks && this._callbacks[type];
            if (list) {
                each(list, function (v, i) {
                    if (v && (!fn || v.fn === fn) &&
                        (!context || v.context === context)) {
                        list[i] = null;
                    }
                });
            }
        }
    },
    // 触发指定事件
    trigger: function (type) {
        if (!type) {
            return;
        }
        var list = this._callbacks && this._callbacks[type],
            args = slice.call(arguments, 1),
            context;
        if (list) {
            each(list, function (v, i) {
                if (v && v.fn) {
                    context = v.context || that;
                    v.fn.apply(context, args);
                }
           });
        }
    }
};

// 数据映射对象，一个提供键值映射的对象，用于保存数据
// 使用Key-Value形式保存，一个Key只能对应一个Value
// 提供常用方法方便对数据进行增删查清空以及遍历
var Map = function () {
    this.init.apply(this, arguments);
};
extend(Map.prototype, CustomEvent, {
    init: function (map, options) {
        this.map = {};
        this.add(map, options);
    },
    add: function (key, value, options) {
        if (isUndef(key)) {
            return;
        }
        var attrs,
            force = false,
            checkFn;
        if (isObject(key)) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (options) {
            if (options.force === true) {
                force = true;
            }
            if (options.check) {
                checkFn = options.check;
            }
        }
        each(attrs, function (value, key) {
            // 必须符合以下条件才能添加成功
            // key必须定义
            // 强制设置 或者 为存在该key
            // 未定义验证方法 或 通过验证方法验证
            if (isDef(key) &&
                (force || !this.has(key)) &&
                (!checkFn || checkFn.call(this, key, value))) {
                this.map[key] = value;
            }
        }, this);
    },
    set: function (key, value, options) {
        if (isUndef(key)) {
            return;
        }
        var attrs;
        if (isObject(key)) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!options) {
            options = {};
        }
        options.force = true;
        this.add(attrs, options);
    },
    get: function (key) {
        return isDef(key) ? this.map[key] : void(0);
    },
    has: function (key) {
        return isDef(key) && isDef(this.map[key]);
    },
    remove: function (key) {
        if (isDef(key)) {
            delete this.map[key];
        }
    },
    clear: function () {
        this.map = {};
    },
    each: function (fn) {
        each(this.map, fn, this);
    }
});

// 采集数据的参数类，用于存放采集的数据以及对应的属性名，并提供序列化方法
var URLVar = function () {
    this.init.apply(this, arguments);
};
extend(URLVar.prototype, Map.prototype, {
    stringify: function () {
        var str = '';
        this.each(function (value, key) {
            str += '&' + key + '=' + value;
        });
        return str.substring(1);
    }
});

// 列表类，提供方便的添加、移除、清空、遍历方法及对应的事件绑定
var List = function () {
    this.init.apply(this, arguments);
};
extend(List.prototype, CustomEvent, {
    init: function (options) {
        var that = this;
        that.list = [];
        if (options) {
            var onAdd = options.onAdd,
                onRemove = options.onRemove,
                onClear = options.onClear;
            if (onAdd) {
                that.onAdd(onAdd);
            }
            if (onRemove) {
                that.onRemove(onRemove);
            }
            if (onClear) {
                that.onClear(onClear);
            }
        }
    },
    all: function () {
        return this.list;
    },
    add: function (value , silent) {
        this.list.push(value);
        if (!silent) {
            this.trigger('a', value);
        }
    },
    onAdd: function (fn) {
        this.on('a', fn , this);
    },
    remove: function (value , silent) {
        var that = this,
            size = that.size();
        for (var i = size - 1; i >= 0; i--) {
            if (that.list[i] === value) {
                that.list.splice(i, 1);
                if (!silent) {
                    that.trigger('r', value);
                }
            }
        }
    },
    onRemove: function (fn) {
        this.on('r', fn , this);
    },
    clear: function (silent) {
        var that = this;
        that.list = [];
        if (!silent) {
            that.trigger('c', that.list);
        }
    },
    onClear: function (fn) {
        this.on('c', fn , this);
    },
    size: function () {
        return size(this.list);
    },
    each: function (fn) {
        each(this.list, fn, this);
    }
});

// 时间处理函数
var date = {
    // 返回当前时间
    now: function () {
        return new Date();
    },
    // 返回当前时间格式化后的字符串
    nowString: function () {
        var n = this.now();
        return this.format(n);
    },
    // 返回指定毫秒后的时间
    at: function (usec) {
        var u = this.usec() + (usec || 0);
        return new Date(u);
    },
    // 返回指定时间的毫秒数或者当前时间的毫秒数
    usec: function (t) {
        if (!t) {
            t = this.now();
        }
        return t.getTime();
    },
    // 计算两个时间之间相差毫秒数
    // 如果只有一个时间则与当前时间比较
    between: function (d1, d2) {
        if (!d1) {
            return 0;
        }
        if (!d2) {
            d2 = this.now();
        }
        return abs(d2 - d1);
    },
    // 返回随机日期
    rand: function () {
        return this.make(random(0, new Date().getFullYear()), random(0, 11), random(0, 31), random(0, 23), random(0, 59), random(0, 59), random(0, 999));
    }
};

// 定时器
var timer = {
    // 设置定时器
    // 参数repeat仅支持 重复一次（1）和 无限次重复（其他所有值）
    on: function (fn, delay, repeat) {
        if (!fn) {
            return;
        }
        if (!delay) {
            delay = 1;
        }
        if (!repeat) {
            repeat = 0;
        }
        var args = slice.call(arguments, 3),
            wrapper = null,
            id = -1;
        wrapper = function () {
            fn.apply(null, args);
        };
        if (repeat === 1) {
            id = setTimeout(wrapper, delay);
        } else {
            id = setInterval(wrapper, delay);
        }
        return id;
    },
    // 清空指定id的定时器
    off: function (id) {
        clearTimeout(id);
        clearInterval(id);
    },
    // 单次定时器，相当于timeout
    once: function (fn, delay) {
        var args = [fn, delay, 1],
            len = size(arguments),
            id;
        for(var i = 2; i < len; i++) {
            args.push(arguments[i]);
        }
        id = timer.on.apply(this, args);
        return id;
    }
};

// 寄存事件相应的元素以及类型和响应函数
var events = {},
    // 浏览器事件监听、解除监听函数
    domEvent = {
        on: function (el, type, fn) {
            if (!el || !type || !fn) {
                return;
            }
            var handlers = events[type] || (events[type] = []);
            handlers.push({el: el, fn: fn});
            domEvent.add(el, type, fn);
        },
        off: function (el, type, fn) {
            if (!el || !type) {
                return;
            }
            var handlers = events[type];
            each(handlers, function (handler, i) {
                if (handler) {
                    var el = handler.el,
                        fn = handler.fn;
                    handlers[i] = null;
                    domEvent.remove(el, type, fn);
                }
            });
        },
        add: function (el, type, fn) {
            el.addEventListener(type, fn, false);
        },
        remove: function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        }
    };


// 浏览器相关信息
var browser = {
    uc: false,
    qq: false,
    liebao: false,
    ie: false,
    ie4: false,
    ie5: false,
    ie5_5: false,
    ie6: false,
    ie7: false,
    ie8: false,
    ie9: false,
    ie10: false,
    chrome: false,
    safari: false,
    firefox: false,
    opera: false,
    u3: false,
    webkit: false,
    unknown: false
};

// 检测浏览器类型
function detectBrowser() {
    log.debug('detecting browser');
    log.debug('[ua: ' + ua + ']');
    var r;
    // 分析浏览器类型
    if (r = ua_lc.match(/ucbrowser\/([\d.]+)/)) {
        browser.uc = true;
        browser.name = 'UCBrowser';
        log.debug('[browser: uc]');
    } else if (r = ua_lc.match(/qqbrowser\/([\d.]+)/)) {
        browser.qq = true;
        browser.name = 'QQBrowser';
        log.debug('[browser: qq]');
    } else if (r = ua_lc.match(/liebaofast\/([\d.]+)/)) {
        browser.liebao = true;
        browser.name = 'LieBao';
        log.debug('[browser: liebao]');
    } else if (r = ua_lc.match(/msie ([\d.]+)/)) {
        browser.ie = true;
        browser.name = 'MSIE';
        log.debug('[browser: ie]');
        if (doc.documentMode === 10) {
            browser.ie10 = true;
            log.debug('[browser: ie10]');
        } else if (doc.documentMode === 9) {
            browser.ie9 = true;
            log.debug('[browser: ie9]');
        } else if (win.postMessage) {
            browser.ie8 = true;
            log.debug('[browser: ie8]');
        } else if (win.XMLHttpRequest) {
            browser.ie7 = true;
            log.debug('[browser: ie7]');
        } else if (doc.compatMode) {
            browser.ie6 = true;
            log.debug('[browser: ie6]');
        } else if (win.createPopup) {
            browser.ie5_5 = true;
            log.debug('[browser: ie5.5]');
        } else if (win.attachEvent) {
            browser.ie5 = true;
            log.debug('[browser: ie5]');
        } else if (doc.all) {
            browser.ie4 = true;
            log.debug('[browser: ie4]');
        }
    } else if (r = ua_lc.match(/firefox\/([\d.]+)/)) {
        browser.firefox = true;
        browser.name = 'Firefox';
        log.debug('[browser: firefox]');
    } else if (r = ua_lc.match(/chrome\/([\d.]+)/)) {
        browser.chrome = true;
        browser.name = 'Chrome';
        log.debug('[browser: chrome]');
    } else if (win.opera) {
        browser.opera = true;
        browser.name = 'Opera';
        log.debug('[browser: opera]');
    } else if (r = ua_lc.match(/version\/([\d.]+).*safari/)) {
        browser.safari = true;
        browser.name = 'Safari';
        log.debug('[browser: safari]');
    } else {
        browser.unknown = true;
        log.debug('[browser: unknown]');
    }
    // 提取浏览器版本号
    if (r && r.length > 1) {
        browser.version = r[1];
        log.debug('[browser.version: ' + browser.version + ']');
    }

    // 分析浏览器核心
    if (r = ua_lc.match(/u3\/([\d.]+)/)) {
        browser.u3 = true;
        browser.core = 'U3';
        log.debug('[browser.core: u3]');
    } else if ((r = ua_lc.match(/applewebkit\/([\d.]+)/)) ||
        (r = ua_lc.match(/safari\/([\d.]+)/))) {
        browser.webkit = true;
        browser.core = 'Webkit';
        log.debug('[browser.core: webkit]');
    }
    if (r && r.length > 1) {
        browser.coreVersion = r[1];
        log.debug('[browser.coreVersion: ' + browser.coreVersion + ']');
    }
    return browser;
}

// 获取客户端时区
function detectTimeZone() {
    var date = new Date(),
        offset = date.getTimezoneOffset(),
        offsetHour = offset / 60;
    timeZone = '';
    if (offsetHour < -10 || offsetHour > 10) {
        timeZone = offsetHour * 100;
    } else if (offsetHour < -10) {
        timeZone = '-0' + Math.abs(offsetHour) * 100;
    } else if (offsetHour < 10) {
        timeZone = '0' + Math.abs(offsetHour) * 100;
    }
}

// 检测页面的referrer，即上一个页面的URL
function detectReferrer() {
    log.debug('detecting referrer');
    if (win.top && win.top.document) {
        referrer = win.top.document.referrer;
    }
    if (isBlank(referrer) && win.parent && win.parent.document) {
        referrer = win.parent.document.referrer;
    }
    if (isBlank(referrer)) {
        referrer = doc.referrer;
    }
    log.debug('[referrer: ' + referrer + ']');
    return referrer;
}

// 检测是否开启cookie功能
function detectCookieEnabled() {
    if (navi.cookieEnabled === true) {
        cookieEnabled = true;
    } else {
        var key = '_uca_cookie_',
            value = 'test';
        cookie.set(key, value);
        cookieEnabled = (cookie.get(key) === value);
    }
    log.debug('[cookie enabled: ' + cookieEnabled + ']');
    return cookieEnabled;
}

function detectSize() {
    var bch = (body && body.clientHeight) || 0,
        dch = (docElem && docElem.clientHeight) || 0,
        bcw = (body && body.clientWidth) || 0,
        dcw = (docElem && docElem.clientWidth) || 0;
    cHeight = (bch < dch) ? bch : dch;
    cWidth = (bcw < dcw) ? bcw : dcw;
    docHeight = (docElem && docElem.scrollHeight) ||
        (body && body.scrollHeight) ||
        0;
    docWidth = (docElem && docElem.scrollWidth) ||
            (body && body.scrollWidth) ||
            0;
}

// 检测环境
function detectEnvi() {
    doc = win.document;
    domain = doc.domain;
    body = doc.body;
    docElem = doc.documentElement;
    
    screen = win.screen;
    colorDepth = screen.colorDepth;
    sWidth = screen.width;
    sHeight = screen.height;
    resolution = sWidth + 'x' + sHeight;
    
    navi = win.navigator;
    platform = navi.platform;
    ua = navi.userAgent;
    ua_lc = ua.toLowerCase();
    
    detectTimeZone();
    detectReferrer();
    detectBrowser();
    detectSize();
    detectCookieEnabled();
}

// 操作cookie
var cookie = {
    set: function (key, value, options) {
        if (!options) {
            options = {};
        }
        try {
            var map = {},
                c = '';
            map[key] = value;
            if (options.expires) {
                map.expires = options.expires.toGMTString();
            }
            map.domain = options.domain || domain;
            map.path = options.path || '/';
            map = new Map(map);
            map.each(function (value, key) {
                c += key + '=' + value + ';';
            });
            doc.cookie = c;
        } catch(e) {}
    },
    get: function (key) {
        try {
            var exp = '(^|)' + key + '=([^;]*)(;|$)',
                data = doc.cookie.match(new RegExp(exp));
            if (data) {
                return data[2];
            }
        } catch(e) {}
    },
    remove: function (key) {
        try {
            this.set(key, '', {expires: date.at(-1)});
        } catch(e) {}
    }
};

var isReady = false,
    readyList = [];
// 绑定 document 在 ready 时执行的函数
function ready(fn) {
    // 如果有参数添加 ready 函数列表中
    if (fn) {
        readyList.push(fn);
        bindReady();
        
    // document 已经 ready，遍历 ready 函数列表执行函数并且清空列表
    } else {
        log.info('doc ' + (isReady ? 'has been' : 'just') + ' ready');
        isReady = true;
        each(readyList, function (fn) {
            if (fn) {
                fn.apply();
            }
        }, this);
        readyList = [];
    }
}

// --es5-ready--
function bindReady() {
    // 防止在绑定document的ready事件监听之前document已经触发ready事件
    // 直接执行
    if (equal(doc.readyState, 'complete')) {
        return defer(ready);
    }
    
    log.info('add document-load-event listener');
    // firefox或其他标准浏览器支持此方法
    domEvent.on(doc, 'DOMContentLoaded', onDOMLoaded);
    
    // 保险方法：监听win的load事件，这个事件任何情况下都能正常工作
    domEvent.on(win, 'load', onDOMLoaded);
}
    
function onDOMLoaded() {
    // 移除各load监听器
    log.warn('remove all document-load-event listeners');
    domEvent.off(doc, 'DOMContentLoaded', onDOMLoaded);
    domEvent.off(doc, 'readystatechange', onDOMLoaded);
    domEvent.off(win, 'load', onDOMLoaded);
    // 调用ready执行监听ready的函数
    defer(ready);
}
// --es5-ready--
var common = {
    v: VERSION
};

var Promise = function () {
    this.init.apply(this, arguments);
};

Promise.prototype.init = function () {
};

Promise.prototype.then = function (onFulfilled, onRejected) {
    // body...
};

Promise.resolve = function () {

};

Promise.reject = function () {

};
/**
 * 存储相关
 */

var cookieStorage = {
    set: function (key, value, options) {
        try {
            if (!options) {
                options = {};
            }
            value = stringifyStorage(value);
            // 十年过期时间
            options.expires = date.at(10 * 366 * 24 * 60 * 60 * 1000);
            cookie.set(key, value, options);
        } catch(e) {}
    },
    get: function (key) {
        try {
            return parseStorage(cookie.get(key));
        } catch(e) {}
    },
    remove: function (key) {
        try {
            cookie.remove(key);
        } catch(e) {}
    }
};

var localStorage = {
    set: function (key, value, options) {
        try {
            if (win.localStorage) {
                win.localStorage.removeItem(key);
                win.localStorage.setItem(key, stringifyStorage(value));
            }
        } catch(e) {}
    },
    get: function (key) {
        try {
            return win.localStorage ? 
                        parseStorage(win.localStorage.getItem(key)) :
                        {};
        } catch(e) {}
    },
    remove: function (key) {
        try {
            if (win.localStorage) {
                win.localStorage.removeItem(key);
            }
        } catch(e) {}
    }
};

// --userdata-userData--
var userDataStorage = null;
// --userdata-userData--

// 将存储数据反序列化为数据
function parseStorage(str) {
    var kvs, kv, value, create, expires, scope,
        now = date.usec(),
        elapsed = floor(now / 1000),
        data = {};
    if (str && (str.length > 0)) {
        kv = str.split('=');
        if (kv.length > 0) {
            value = decode(kv[0]);
            create = Number(kv[1]);
            expires = Number(kv[2]);
            if (expires === 0 || expires > elapsed) {
                log.debug('parseStorage from ' + str + ' to ' + [value, create, expires]);
                return [value, create, expires];
            }
        }
    }
}

// 序列化为存储格式
function stringifyStorage(value) {
    if (isString(value)) {
        return value;
    }
    return value.join('=');
}


// 数据存储器
// 数据存储在 localStorage 或者 cookie 中
var storage = {
    // 客户端存储的总调度方法，可以将键值保存到所有位置
    set: function (key, value, options) {
        var data,
            now = date.usec(),
            create = ceil(now / 1000),
            // 数据过期时间，默认为1年
            expires = now + (1 * 366 * 24 * 60 * 60 * 1000);

        if (isBlank(options)) {
            options = {};
        }

        if (isNumber(options.expires)) {
            expires = options.expires;
        }

        if (expires > 0) {
            // 如果设置的过期时间小于当前毫秒数，则认为是当前时间加上指定毫秒
            if (expires < now) {
                expires += now;
            }
            expires = ceil(expires / 1000);

        // 如果小于0则是不正常的过期时间，不保存
        } else if(expires < 0) {
            return this;
        }

        data = [value, create, expires];
        if (options.local !== false && localStorage) {
            localStorage.set(key, data, options);
        }
        if (options.cookie !== false && cookieStorage) {
            cookieStorage.set(key, data, options);
        }
        if (options.userData !== false && userDataStorage) {
            userDataStorage.set(key, data, options);
        }
        return this;
    },
    get: function (key, options) {
        var data;

        if (isBlank(options)) {
            options = {};
        }

        if (options.local !== false && localStorage) {
            data = localStorage.get(key);
        }

        if (!data && options.cookie !== false && cookieStorage) {
            data = cookieStorage.get(key);
        }

        if (!data && options.userData !== false && userDataStorage) {
            data = userDataStorage.get(ns);
        }

        return data && data[0];
    },
    has: function (key, options) {
        var value = this.get(key, options);
        return !isBlank(value);
    },
    remove: function (key) {
        if (localStorage) {
            localStorage.remove(key);
        }
        if (cookieStorage) {
            cookieStorage.remove(key);
        }
        if (userDataStorage) {
            userDataStorage.remove(key);
        }
        return this;
    }
};

 // 扩展常用的存取操作
extend(storage, {
    // 从浏览器存储中获取上一次页面跳转时间
    forward: function (f) {
        if (f) {
            // 默认过期时间为180秒
            storage.set('pf', f.getTime(), {expires: 180000});
        }
        return storage.get('pf');
    }
});

/**
 * 统计核心
 */

// 处理采集脚本关于采集脚本数据的内容，主要是探测各种参数以及提供数据保存同步等功能 

var // 最大页面加载时间，超过此时间直接发送onload数据
    readyTimeout = 30 * 1000,
    // 最大采集时间超时阀值，超过这个时间则不再发送任何数据
    collectTimeout = 24 * 3600 * 1000,
    // 数据发送超时时间，默认10000毫秒
    sendTimeout = 10 * 1000,
    // resize事件延迟执行的计时器
    resizeTimer,
    // 是否是单例模式
    singleton = false,

    lastURL,

    // 页面打开时间
    openTimeStamp;

// 返回自从页面打开当前时刻经过的毫秒数
function sinceOpen() {
    return date.between(date.now(), openTimeStamp);
}

// 消息器
var Message = function () {};
extend(Message.prototype, CustomEvent);

var msg = new Message();
api.on = [msg.on, msg];
api.off = [msg.off, msg];

var setHandlers = [];
api.set = function set(key, value) {
    if (isString(key)) {
        var done = false;
        each(setHandlers, function (handler) {
            if (!done && (done = handler(key, value))) {
                return breaker;
            }
        });
        if (!done) {
            common[key] = value;
        }
    } else if (isObject(key)) {
        each(key, function (v, k) {
            set(k, key[k]);
        });
    }
};

// 页面加载完毕的处理方法
function onReady() {
    msg.trigger('load');
}

// 离开页面的处理方法
function onLeave() {
    msg.trigger('leave');
}

// 页面尺寸变化的处理方法
function onResize() {
    if (!resizeTimer) {
        detectSize();
        resizeTimer = timer.once(function () {
            detectSize();
            resizeTimer = null;
            msg.trigger('resize');
        }, 150);
    }
}

var conf = {
        server: 'http://vcollect.st.uae.uc.cn'
    },

    serverApi = {
        pageview: '/pageview',
        event: '/event',
        click: '/click',
        error: '/error'
    },

    // 前缀
    UCA = '_uca_';

setHandlers.push(function (key, value) {
    if (isDef(conf[key])) {
        conf[key] = value;
        return true;
    }
    return false;
});
/**
 * 点击相关
 */
    // 鼠标位置偏移量，用于计算鼠标实际相对于页面左上角的位置
var offsetX = 0,
    offsetY = 0,
    pageZoom = 1;

extend(conf, {
    pageLayout: null,
    pageWidth: 0,
    pageAlign: null
});

msg.on('readVar', function () {
    // 页面布局
    // float 浮动布局
    // zoom 缩放
    conf.pageLayout = $_get('pl') || null;

    // 读取页面固定宽度
    conf.pageWidth = $_get('pw') || 0;
    
    // 读取页面对齐方式，默认为居中对齐
    conf.pageAlign = $_get('pa') || null;
});

msg.on('processVar', calPageOffset);

msg.on('resize', calPageOffset);

function calPageOffset() {
    // 当配置的pageWidth为空或者为0的时候，不更新页面鼠标的偏移量
    if (conf.pageWidth > 0) {
        if (conf.pageLayout === 'zoom') {
            pageZoom = cWidth / conf.pageWidth;
        }
        // switch (pageAlign) {
        //     case 'right':
        //         offsetX = pageWidth - docWidth;
        //         break;
                
        //     case 'left':
        //         offsetX = 0;
        //         break;
                
        //     default:
        //         // 默认为页面居中显示
        //         offsetX = (pageWidth - docWidth) * 0.5;
        // }
    }
}

var click = api.click = function (data) {
    if (!data) {
        return;
    }

    if (isDef(data.x)) {
        data.x = floor(data.x / pageZoom);
    }

    if (conf.pageLayout) {
        data.pl = conf.pageLayout;
    }

    if (conf.pageWidth) {
        data.pw = conf.pageWidth;
    }

    if (conf.pageAlign) {
        data.pa = conf.pageAlign;
    }

    send(data, {api: serverApi.click});
};










/**
 * 统计事件相关
 */

var event = api.event = function (category, action, label, value) {
    var data;
    if (isString(category)) {
        data = {
            category: category,
            action: action,
            label: label,
            value: value
        };
    } else {
        data = category;
    }
    if (isUndef(data.value)) {
        data.value = 1;
    }
    send(data, {api: serverApi.event});
};
/**
 * 出错统计相关
 */

// 每次发送出错数据携带的出错内容的最大长度
var errorInfo,
    errorSize = 1024;

// 读取变量
msg.on('readVar', function () {
    // 读取出错信息
    errorInfo = {
        url: $_get('e_u') || window.location.href,
        code: $_get('e_c') || '',
        message: decode($_get('e_m') || ''),
        times: $_get('e_t') || 1
    };
    
    // 读取发送错误信息的最大长度
    if (isNumber($_get('e_s'))) {
        errorSize = $_get('e_s');
    }
    log.debug('[max error size: ' + errorSize + ']');
});

// 发送页面出错数据
var error = api.error = function (code, message, times, url) {
    if (isObject(code)) {
        message = code.message;
        times = code.times;
        url = code.url;
        code = code.code;
    }
    // TODO 增加分次发送，每次发送指定字符个数
    event('err', code, message, times);
};

/**
 * 页面访问统计相关
 */

var lastPageViewReferrer;
var pageview = api.pageview = function (data) {

    // 如果没有传入标题，则自动获取
    if (!data.title) {
        data.title = doc.title;
    }

    // 如果没有传入 referrer，则自动获取
    if (!data.referrer) {
        // 重新检测 referrer
        detectReferrer();

        // referrer 不同，为非单页面应用
        if (referrer !== lastPageViewReferrer) {
            data.referrer = encode(referrer);

        // referrer 相同，判断为单页面应用
        // 改为用 hash 作为 referrer
        } else {
            data.referrer = encode(decode(location.hash));
        }
    }

    lastPageViewReferrer = referrer;

    send(data, {api: serverApi.pageview});
};
// 读取全局配置变量
msg.on('readVar', function () {
    log.debug('--start reading global config vars');
    
    // 读取是否配置为单例模式
    singleton = !!($_get('singleton') || $_get('sing') || singleton);
    log.debug('[singleton: ' + singleton + ']');


    var savedUuid = storage.get('uuid');
    log.debug('[*uuid from storage*: ' + savedUuid + ']');
    if (!common.uuid) {
        common.uuid = $_get('uuid') || savedUuid || uuid('v');
    }
    if (!savedUuid || savedUuid !== common.uuid) {
        storage.set('uuid', common.uuid);
        common.nv = 1;
    }
    log.debug('[*uuid*: ' + common.uuid + ']');
    
    // 读取采集端服务器列表
    if ($_get('s')) {
        conf.server = $_get('s');
    }
    
    // 读取页面ready超时时间
    if (isNumber($_get('rdy_to'))) {
        readyTimeout = $_get('rdy_to');
    }
    log.debug('[page ready timeout: ' + readyTimeout + ']');
    
    // 读取采集时间超时阀值
    if (isNumber($_get('clt_to'))) {
        collectTimeout = $_get('clt_to');
    }
    log.debug('[collect timeout: ' + collectTimeout + ']');
    
    if (browser.name) {
        common.br = browser.name;
        common.brv = browser.version;
    }

    extend(common, {
        sid: $_get('sid') || uuid('s'),
        cd: colorDepth,
        ck: cookieEnabled ? 1 : 0,
        tz: timeZone,
        rs: resolution,
        ht: domain
    });
});
function parseQuery(queryString) {
    if (!queryString) {
        queryString = location.search.substring(1);
    }
    var queryPairs = queryString.split('&'),
        query = {};
    each(queryPairs, function (pair) {
        var p = pair.split('='),
            key = p[0],
            value = p[1];
        if (isDef(key) && isDef(value)) {
            query[key] = value;
        }
    });
    return query;
}

setHandlers.push(function (key, value) {
    if (key && value && value.indexOf('query.') === 0) {
        var query = parseQuery(),
            v = query[value.replace('query.', '')];
        if (isDef(v)) {
            uca.set(key, v);
        }
        return true;
    }
    return false;
});

/**
 * 数据发送相关
 */

var sendMap = {};

function send(data, options) {
    // 无内容或超过有效期的数据不发送
    if (!data || !options || sinceOpen() >= collectTimeout) {
        return;
    }

    var urlVar = makeUrlVar(data),
        urlVarString = urlVar.stringify(),
        api = options.api,
        url = conf.server + api + '?' + urlVarString;

    ping(url);
}

function ping(url) {
    var promise = new Promise(),
        image = new Image(1, 1);

    image.onload = function () {
        Promise.resolve(promise);
    };
    image.onabort = image.onerror = function () {
        Promise.reject(promise);
    };
    image.src = url;
    return promise;
}

// 每次发送的唯一序列号
var serialNumber = 0;

// 生成采集数据对象，携带有探针的基础采集数据
function makeUrlVar() {
    var data = {},
        args = arguments,
        count = args.length,
        fullUrl = decode(window.location.href),
        urlVar;

    // 将当前 URL 中的 UC 扩展参数去掉
    fullUrl = fullUrl.replace(/&(uc_param_str|fr|dn|sn|pf|ve|cp|la|bt|bm|nt|nw|pv|ss|li|bi|ei|si|ni)=[^&#]*/g, '');
    fullUrl = fullUrl.replace(/\?uc_param_str=[^&#]*/g, '?');

    for (var i = 0; i < count; i++) {
        if (isObject(args[i])) {
            extend(data, args[i]);
        }
    }

    urlVar = new URLVar(common);
    urlVar.set(data);
    urlVar.set({
        r: rand(4),
        sm: serialNumber++,
        full_url: encode(fullUrl),
        pla: platform,
        cht: cHeight,
        cwt: cWidth
    });
    
    return urlVar;
}


/**
 * 初始化
 */

// --------采集脚本主方法-----------------------------------------------
// 按顺序初始化采集脚本所需的各种变量、获取所需的配置和数据、加入对各事件的监听、判定是否需要发送错误数据


// 处理变量
msg.on('processVar', function () {
    // 读取最后的页面URL
    // lastURL = storage.lastURL() || null;
    log.debug('[lastURL: ' + lastURL + ']');
});

// 绑定事件监听
msg.on('bindEvent', function () {
    // 监听document的ready事件，绑定ready处理方法
    ready(onReady);
    // 如果页面在ready超时时间之前都没有准备完毕，那么视为页面已经ready直接发送load数据
    // 如果超时时间为-1则不强制执行ready处理方法
    if (readyTimeout > -1) {
        timer.once(onReady, readyTimeout);
    }
    
    // 离开页面的数据应在是在beforeunload事件时触发
    domEvent.on(win, 'beforeunload', onLeave);

    // 监听窗口变化事件
    domEvent.on(win, 'resize', onResize);
});

function uca(name) {
    if (name) {
        var args = slice.call(arguments, 1),
            names = name.split(','),
            item, fn, context;
        names.forEach(function (name) {
            item = api[name];
            if (item) {
                if (isFunction(item)) {
                    item.apply(that, args);
                } else if (isArray(item)) {
                    fn = item[0];
                    context = item[1];
                    fn.apply(context, args);
                }
                
            }
        });
    }
    return this;
}

// 如果已经存在采集脚本的全局变量
if (win['_' + name]) {
    // 判断是否开启了单例模式，如果开启单例模式则终止采集脚本初始化
    if (singleton) {
        log.warn('!singleton is enabled, already exists _' + name + ', stop initialization!');
        return;
    }
}

log.info('.:start initialization queue:.');

win['_' + name] = uca;

extend(uca, api);

// 执行初始化队列
msg.trigger('beforeInit');

// 检测浏览器等环境
detectEnvi();

// 初始化窗体相关数据
onResize();

msg.trigger('init');

msg.trigger('readVar');

if (win._uaq) {
    each(win._uaq, function (args) {
        uca.apply(that, args);
    }, that);
    win._uaq = null;
}

// 读取其他采集脚本所需配置
msg.trigger('processVar');

msg.trigger('bindEvent');

msg.trigger('afterInit');

log.info('.:initialization queue finished:.');

});
//} catch(e) {}