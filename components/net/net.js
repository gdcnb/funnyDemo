var id = 0,
    ARGS_RE = /\S+/g,
    defaults = {
        type: 'get',
        dataType: 'json',
        async: true,
        timeout: 0,
        username: null,
        password: null
    },
    util = require('../util/util.js');

/**
 Handlers
 Modified from jQuery's Callbacks

 @param {String|Object} options
 @example
 var handlers1 = new Handlers('once memory'),
 handlers2 = new Handlers({once: true, memory: true});
 */
var Handlers = (function () {
    var optionsCache = {},
        STATUS = {
            INIT: 0,
            FIRING: 1,
            FIRED: 2
        };

    function createOptions(options) {
        var object = optionsCache[options] = {};
        util.each(options.match(ARGS_RE), function (flag) {
            object[flag] = true;
        });
        return object;
    }

    function Constructor(options) {
        // options.once: ensure handlers can only be fired once
        // options.memory: call handler added after status changed
        //     with latest "memorized" values
        this.options = typeof options === 'string' ?
            optionsCache[options] || createOptions(options) :
            util.extend({}, options);

        // handlers' list
        this.list = [];
        // stack of fire calls of repeatables lists
        this.stack = !this.options.once && [];
        // memorized values
        this.dataCache = null;
        // current status
        this.status = STATUS.INIT;

        this.firingStart = this.firingLength = this.firingIndex = 0;
    }

    Constructor.prototype = {
        _fire: function (data) {
            var list = this.list,
                stack = this.stack;
            this.firingIndex = this.firingStart || 0;
            this.firingStart = 0;
            this.firingLength = list.length;
            // cache data
            this.dataCache = this.options.memory && data;

            // fire handlers
            this.status = STATUS.FIRING;
            for (; list && this.firingIndex < this.firingLength; this.firingIndex++) {
                list[this.firingIndex].apply(data[0], data[1]);
            }
            this.status = STATUS.FIRED;

            if (list) {
                if (stack) {
                    if (stack.length) {
                        this._fire(stack.shift());
                    }
                } else if (this.dataCache) {
                    this.empty();
                } else {
                    this.disable();
                }
            }
        },

        add: function () {
            var that = this;
            if (this.list) {
                // cache list's current length
                var start = this.list.length;

                (function add(args) {
                    util.each(args, function (arg) {
                        var type = util.type(arg);
                        if (type === 'function') {
                            that.list.push(arg);
                        } else if (arg && arg.length && type !== 'string') {
                            add(arg);
                        }
                    });
                })(arguments);

                if (this.status === STATUS.FIRING) {
                    this.firingLength = this.list.length;
                } else if (this.dataCache) {
                    this.firingStart = start;
                    this._fire(this.dataCache);
                }
            }
            return this;
        },

        remove: function () {
            if (this.list) {
                util.each(arguments, function (arg) {
                    var index = util.indexOf(this.list, arg);
                    while (index > -1) {
                        this.list.splice(index, 1);
                        if (this.status === STATUS.FIRING) {
                            if (index <= this.firingLength) {
                                this.firingLength--;
                            }
                            if (index <= this.firingIndex) {
                                this.firingIndex--;
                            }
                        }
                        index = util.indexOf(this.list, arg, index);
                    }
                }, this);
            }
            return this;
        },

        has: function (handler) {
            var list = this.list;
            return handler ? util.indexOf(list, handler) > -1 :
                !!(list && list.length);
        },

        empty: function () {
            this.list.length = 0;
            this.firingLength = 0;
            return this;
        },

        disable: function () {
            this.list = this.stack = this.dataCache = null;
            return this;
        },

        lock: function () {
            this.stack = null;
            if (!this.dataCache) {
                this.disable();
            }
            return this;
        },

        fireWith: function (context, args) {
            var notFired = this.status !== STATUS.FIRED,
                firing = this.status === STATUS.FIRING,
                list = this.list,
                stack = this.stack;
            args = args || [];
            args = [context, args.slice ? args.slice() : args];
            if (list && (notFired || stack)) {
                if (firing) {
                    stack.push(args);
                } else {
                    this._fire(args);
                }
            }
            return this;
        },

        fire: function () {
            this.fireWith(this, arguments);
            return this;
        }
    };

    Constructor._optionsCache = optionsCache;
    Constructor._createOptions = createOptions;
    return Constructor;
})();
Handlers.prototype.constructor = Handlers;


// Promise Pattern
var Promise = (function () {
    var STATUS = {
            INIT: 0,
            RESOLVED: 1,
            REJECTED: 2
        },
        configs = [
            ['resolve', 'done', STATUS.RESOLVED],
            ['reject', 'fail', STATUS.REJECTED],
            ['notify', 'progress']
        ];

    function Constructor(obj) {
        this.handlers = [
            // doneHandlers
            new Handlers('once memory'),
            // failHandlers
            new Handlers('once memory'),
            // progressHandlers
            new Handlers('memory')
        ];
        this.status = STATUS.INIT;

        // promise['done' | 'fail' | 'progress']
        util.each(configs, function (cfg, i) {
            var that = this,
                handlers = this.handlers[i],
                status = cfg[2];

            this[cfg[1]] = function () {
                handlers.add.apply(handlers, arguments);
                return this;
            };

            if (status) {
                handlers.add(function () {
                    // change status
                    that.status = status;
                    // disable another handlers
                    that.handlers[i ^ 1].disable();
                    // lock progress handlers
                    that.handlers[2].lock();
                });
            }
        }, this);

        if (obj != null) {
            return mixin(obj, Constructor);
        }
    }

    var prototype = Constructor.prototype = {
        then: function (/* doneHandler, failHandler, progressHandler */) {
            var args = arguments;

            // bind handler with promise['done' | 'fail' | 'progress']
            util.each(configs, function (cfg, i) {
                var handler = args[i];
                if (util.type(handler) === 'function') {
                    this[cfg[1]](handler);
                }
            }, this);

            return this;
        },

        always: function (handler) {
            this.then(handler, handler);
            return this;
        }
    };

    // promise['resolve' | 'reject' | 'notify']
    util.each(configs, function (cfg, i) {
        prototype[cfg[0]] = function () {
            this.handlers[i].fireWith(this, arguments);
            return this;
        };
    });

    // MultiPromise Support
    var multiPromiseMixin = {
        all: function () {
            var fork = when.apply(this, this._when);
            return fork;
        },

        any: function () {
            var fork = when.apply(this, this._when);
            fork._count = 1;
            return fork;
        },

        some: function (n) {
            var fork = when.apply(this, this._when);
            fork._count = n;
            return fork;
        }
    };

    function when (/* promise1, promise2, ..., promiseN */) {
        var completed = [],
            multiArgs = [],
            multiPromise = new Promise(),
            resolve = multiPromise.resolve;
        multiPromise._when = [];
        multiPromise._count = arguments.length;
        util.each(arguments, function (promise, i) {
            multiPromise._when.push(promise.always(function () {
                if (!completed[i]) {
                    completed[i] = true;
                    multiArgs[i] = slice.call(arguments);
                    if (--multiPromise._count === 0) {
                        completed.length = 0;
                        resolve.apply(multiPromise, multiArgs);
                    }
                }
            }));
        });

        // 移除 multiPromise 中其他方法，只保留 then
        multiPromise.then = multiPromise.done;
        util.each(['done', 'fail', 'progress', 'always',
            'resolve', 'reject', 'notify'], function (method) {
            delete multiPromise[method];
        });

        // 混入 all、some、any 等方法
        util.extend(multiPromise, multiPromiseMixin);
        return multiPromise;
    }

    Constructor.when = when;
    return Constructor;
})();
Promise.prototype.constructor = Promise;

function param (data, appendTo) {
    var stack = [],
        query;

    util.each(data, function (value, key) {
        stack.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    query = stack.join('&').replace(/%20/g, '+');

    if (typeof appendTo === 'string') {
        query = appendTo + (query.length > 0 ?
            (appendTo.indexOf('?') < 0 ? '?' : '&') + query : '');
    }

    return query;
}

function addHeaders(xhr, dataType, headers) {
    var accept;
    switch ((dataType || '').toLowerCase()) {
        case 'html':
            accept = 'text/html';
            break;
        case 'xml':
            accept = 'text/xml';
            break;
        case 'script':
            accept = 'text/javascript, application/javascript';
            break;
        case 'text':
            accept = 'text/plain';
            break;
        // 默认为 JSON
        //case 'json':
        default:
            accept = 'application/json, text/javascript';
    }
    accept += ', */*;q=0.01';
    xhr.setRequestHeader('Accept', accept);

    if (typeof headers === 'object') {
        util.each(headers, function (value, key) {
            xhr.setRequestHeader(key, value);
        });
    }
}

function success(xhr, data) {
    var args = [data, xhr.status, xhr];
    getSuccess(xhr).apply(xhr, args);
    xhr.resolve.apply(xhr, args);
}

// 返回成功处理函数
function getSuccess(xhr) {
    var settings = xhr.ajaxSettings;
    if (settings && typeof settings.success === 'function') {
        return settings.success;
    }
    return defaults.onSuccess || empty;
}

// 返回错误处理函数
function getError(xhr) {
    var settings = xhr.ajaxSettings;
    if (settings && typeof settings.error === 'function') {
        return settings.error;
    }
    return defaults.onError || empty;
}

function error(xhr, msg) {
    var handler = getError(xhr),
        args;
    msg = typeof msg === 'string' ? msg : xhr.statusText;
    args = [xhr, msg, xhr.status];
    handler.apply(xhr, args);
    xhr.reject.apply(xhr, args);
}

// readystatechange 事件处理函数
function onReadyStateChange(e) {
    var xhr = e.target,
        settings = xhr.ajaxSettings || {},
        dataType = settings.dataType,
        status,
        resText,
        resBody;

    if (xhr.readyState === xhr.DONE) {
        status = xhr.status;
        resText = xhr.responseText;

        if (settings._timeoutTimer) {
            clearTimeout(settings._timeoutTimer);
        }

        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            try {
                switch (dataType.toLowerCase()) {
                    case 'json':
                        resBody = JSON.parse(resText);
                        break;
                    case 'xml':
                        resBody = xhr.responseXML;
                        break;
                    default:
                        resBody = resText;
                }
                success(xhr, resBody);
            } catch (err) {
                error(xhr, 'parsererror');
                throw err;
            }
        } else {
            error(xhr);
        }
    }
}

function jsonp (url, callback) {
    var xhr = {
            id: ++ id
        },
        callbackName = 'elf_jsonp_' + xhr.id,
        script = document.createElement('script');

    // 清理 JSONP Callback 函数
    xhr.abort = function () {
        script.parentNode.removeChild(script);
        if (callbackName in window) {
            window[callbackName] = null;
        }
        try {
            delete window[callbackName];
        } catch(e) {}
    };

    // JSONP Callback
    window[callbackName] = function (data) {
        xhr.abort();
        callback(data);
    };

    // 处理 error
    script.onerror = function () {
        xhr.abort();
        // error(xhr);
    };

    if (!(/[&?]callback=/.test(url))) {
        url = url + (url.indexOf('?') < 0 ? '?' : '&') + 'callback=?';
    }
    script.src = url.replace('=?', '=' + callbackName);
    document.head.appendChild(script);
    return xhr;
}

function ajax (options) {
    if (options.dataType === 'jsonp') {
        return jsonp(options);
    }

    var xhr = new XMLHttpRequest(),
        upload = xhr.upload,
        tmp,
        settings = util.extend({}, defaults, options),
        type = settings.type = settings.type.toLowerCase(),
        data = settings.data,
        hasParam = false,
        progress = settings.progress,
        promise,
        oldAlways;

    // 处理 xhr 对象，加入 promise 模式支持
    xhr.id = ++id;
    promise = xhr.promise = new Promise();
    oldAlways = promise.always;
    promise.always = function (fn) {
        oldAlways.call(promise, function () {
            fn(xhr);
        });
    };
    util.each(['done', 'fail', 'always', 'resolve', 'reject'], function (m) {
        xhr[m] = util.bind(promise[m], promise);
    });

    // 处理 options.data
    util.each(data, function () {
        hasParam = true;
    });

    if (!hasParam && util.type(data) !== 'string') {
        delete settings.data;
        data = settings.data;
    }

    if (typeof data === 'object' &&
        util.type(data) !== 'formdata' &&
        util.type(data) !== 'file') {

        if (type === 'get') {
            settings.url = param(data, settings.url);
            data = settings.data = null;
        } else {
            tmp = new FormData();
            util.each(data, function (value, key) {
                tmp.append(key, util.type(value) === 'array' ? value.join() : value);
            });
            data = settings.data = tmp;
        }
    }

    // 处理 progress 事件
    if (typeof progress === 'function') {
        upload.callback = progress;
        upload.onprogress = onProgress;
    }

    // 处理 timeout
    if (settings.timeout > 0) {
        settings._timeoutTimer = setTimeout(function () {
            xhr.onreadystatechange = empty;
            xhr.abort();
            error(xhr, 'timeout');
            xhr = null;
        }, settings.timeout * 1000);
    }

    xhr.open(type, settings.url, settings.async,
        settings.username, settings.password);

    addHeaders(xhr, settings.dataType, settings.headers);
    xhr.ajaxSettings = settings;
    xhr.onreadystatechange = onReadyStateChange;
    xhr.onerror = function () {
        return error(xhr);
    };

    xhr.send(data);
    return xhr;
}

module.exports = {
    ping: function(url, params){
        var img = new Image();
        params = util.extend({
            _tm: new Date() - 0
        }, params);
        img.src = param(params, url);
    },
    jsonp : jsonp,
    ajax: ajax
};
