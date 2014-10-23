var id = 0,
    ARGS_RE = /\S+/g,
    defaults = {
        type: 'get',
        dataType: 'json',
        async: true,
        timeout: 0,
        username: null,
        password: null,
        onSuccess: function() {},
        onError: function() {}
    },
    util = require('../util/util.js');

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
}

function error(xhr, msg) {
    var handler = getError(xhr),
        args;
    msg = typeof msg === 'string' ? msg : xhr.statusText;
    args = [xhr, msg, xhr.status];
    handler.apply(xhr, args);
}

// 返回成功处理函数
function getSuccess(xhr) {
    var settings = xhr.ajaxSettings;
    if (settings && typeof settings.success === 'function') {
        return settings.success;
    }
    return defaults.onSuccess;
}

// 返回错误处理函数
function getError(xhr) {
    var settings = xhr.ajaxSettings;
    if (settings && typeof settings.error === 'function') {
        return settings.error;
    }
    return defaults.onError;
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
        progress = settings.progress;

    // 处理 xhr 对象，加入 promise 模式支持
    xhr.id = ++id;

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
