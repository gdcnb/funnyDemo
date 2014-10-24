(function(){
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

    function param (data, appendTo) {
        var stack = [],
            query;

        for(key in data) {
            stack.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }

        query = stack.join('&').replace(/%20/g, '+');

        if (typeof appendTo === 'string') {
            query = appendTo + (query.length > 0 ?
                (appendTo.indexOf('?') < 0 ? '?' : '&') + query : '');
        }

        return query;
    }

    function ping(url, params){
        var img = new Image();
        params = extend({
            _tm: new Date() - 0
        }, params);
        img.src = param(params, url);
    }

    /**
     * 生成唯一标识码的方法
     * @returns {string}
     */
    function uuid() {
        function s4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    /**
     * 格式化js统计的信息
     * 格式为：
     * @param statParams {object} 统计参数对象 eg:{page:'index', tag: '热门'}
     * @returns {string} 格式化后的统计信息 'page=index&tag=热门'
     */
    function formatStatParams (statParams) {
        var keys = Object.keys(statParams),
            plist = [];

        keys.forEach(function(key){
            plist.push(key + '=' + statParams[key]);
        });

        return plist.join('&');
    }

    function WaStat(){
        var that = this;

        //WA统计的URL
        that.statUrl = 'http://track.uc.cn:9080/collect?uc_param_str=dnfrcpve&';
        //that.statUrl = 'http://dev7.ucweb.local:8888/collect?uc_param_str=dnfrcpve&';
        //统计用到的公共配置
        that.comStat = {};

        //重写构造函数实现单例
        WaStat = function() {
            return that;
        }
    }


    /**
     * 设置 wa 统计公共参数的方法
     * @param olpmParams olpm系统返回的UC公参信息或者自定义公参信息
     * eg: {appid:xxx, pg: xxx, ch:xxx}
     *
     */
    WaStat.prototype.setComStat = function(olpmParams) {
        var that = this;

        that.comStat = extend(that.comStat, olpmParams);

        //默认给WA统计添加 uuid 方便在非UC浏览器下面作UV统计
        if(!that.comStat.uuid) {
            that.comStat.uuid = that.getUnUCUid();
        }
    };

    /**
     * 获取唯一码的方法
     * @returns {*}
     */
    WaStat.prototype.getUnUCUid = function () {
        var key = location.hostname + '_uid';
        if(!localStorage.getItem(key)) {
            localStorage.setItem(key, uuid());
        }
        return localStorage.getItem(key);
    };

    /**
     * WA pv 日志统计的方法
     * @param option 自定义参数
     */
    WaStat.prototype.pvStat = function(option) {
        var that = this;

        if(!option) {
            option = {};
        }
        //pv统计的类型标识
        option.lt = 'log';
        option.pv_rf = document.referrer;

        var paramStr = formatStatParams(extend(that.comStat, option));
        console.log(that.statUrl + paramStr);
        ping(that.statUrl + paramStr);
    };

    /**
     * WA click 日志统计的方法
     * @param option 自定义参数
     */
    WaStat.prototype.clickStat = function(option) {
        var that = this;

        if(!option) {
            option = {};
        }
        //click统计的类型标识
        option.lt = 'link';

        var paramStr = formatStatParams(extend(that.comStat, option));
        console.log(that.statUrl + paramStr);
        ping(that.statUrl + paramStr);
    };

    /**
     * WA event 日志统计的方法
     * @param option 自定义参数
     */
    WaStat.prototype.eventStat = function(option) {
        var that = this;

        if(!option) {
            option = {};
        }
        //event统计的类型标识
        option.lt = 'event';
        option.e_c = '行为统计';
        option.e_a = 'touch';

        var paramStr = formatStatParams(extend(that.comStat, option));
        console.log(that.statUrl + paramStr);
        ping(that.statUrl + paramStr);
    };

    if(!window.waStat) {
        window.waStat = new WaStat();
    }

    //使用事件委托来实现特定站点添加wa的click统计
    document.addEventListener('click', function(e){
        var target = e.target;
        while(target !== e.currentTarget) {
            try{
                //如果以ext开头的站点且带有属性data-wa=true，则该站点要作wa的click点击统计
                if(target.tagName.toLowerCase() === 'a' && target.dataset.wa === 'true' && /^ext:/.test(target.href)) {
                    e.preventDefault();

                    //ext:as:navi_online_index-479*598*1907-N33416:http://3g.163.com/ntes/special/0034073A/wechat_article.html?docid=A3H0ICBG00963VRO
                    //ext:as:navi_online_pages-529*1327-N6913:http://www.digu.com/
                    var siteUrl = target.href, statStr = siteUrl.substring(0, siteUrl.indexOf(':http')),
                        statList = statStr.split('-'),
                        statIds = statList[1].split('*'),
                        statInfo = {
                            fcid: statIds[0],
                            cid: statIds[1],
                            pox: statIds.length === 3 ? statIds[2] : '',
                            uid: statList[2].substring(0, 1).toUpperCase() === 'U' ? statList[2].substring(1) : '',
                            nid: statList[2].substring(0, 1).toUpperCase() === 'N' ? statList[2].substring(1) : '',
                            title: target.title
                        };

                    //调用wa 的click统计
                    window.waStat.clickStat(statInfo);

                    //站点跳转
                    setTimeout(function() {
                        location.href = siteUrl;
                    }, 200);
                }

                target = target.parentNode;
            } catch(e) {
                console.error(e.message);
                return;
            }
        }
    }, false);

    if ( typeof module != 'undefined' && module.exports ) {
        module.exports = window.waStat;
    }
})();
