
var util = require('components/util/util.js'),
    storage = require('components/storage/storage.js'),
    model = require('components/model/model.js');

var ConstellationBar = function(elem, fr) {

    var _self = this;

    _self.el = {
        $root : elem,
        $contsBar: util.domFind(elem, '.contsBar')[0],
        $select: util.domFind(elem, '.contsBar-cont select')[0],
        $iconLink: util.domFind(elem, '.contsBar-icon')[0],
        $iconLinkImg: util.domFind(elem, '.contsBar-icon>img')[0],
        $sugLink: util.domFind(elem, '.contsBar-sug')[0],
        $title: util.domFind(elem, '.contsBar-cont-title')[0],
        $fortuneList: util.domFind(elem, '.contsBar-fortune>em')
    };
    _self.reqUrl = 'http://napi.api.uc.cn/2/zdl/classes/life/'; //请求星座地址前缀
    _self.selectStarKey = location.host + location.pathname + 'selectStarKey'; //用户选择的星座对应的localStorage key值
    _self.selectId = 'astro_0'; //选择的星座的对应编号
    _self.store = {}; //存储返回后的各个星座的数据
    _self.fr = fr;
};

var fn = ConstellationBar.prototype;

//根据星座的编号来切换对应的星座
fn.toggleConstellation = function(astroId) {
    var _self = this,
        $selectStar = _self.el.$select.querySelector('option[value="'+ astroId +'"]');

    //更新页面UI
    _self.el.$title.innerText = $selectStar.dataset.title;

    if(_self.el.$iconLinkImg.src) { //处理图片懒加载的问题
        _self.el.$iconLinkImg.src = $selectStar.dataset.img;
    } else {
        _self.el.$iconLinkImg.dataset.src = $selectStar.dataset.img;
    }

    _self.el.$iconLink.href = $selectStar.dataset.url;
    _self.el.$iconLink.title = $selectStar.dataset.title;

    _self.el.$sugLink.href = $selectStar.dataset.url;
    _self.el.$sugLink.title = $selectStar.dataset.title;

    //切换星座时调用接口
    _self.updateConstData(_self.selectId);
};

fn.updateConstData = function(astroId) {
    var _self = this;

    function updateConstellUIinfo(data) {
        //更新 今日运势
        var fortuneNum = parseInt(data.fortune);
        for(var i = 0; i < _self.el.$fortuneList.length; i ++) {
            if(i < fortuneNum) {
                util.removeClass(_self.el.$fortuneList[i]);
                util.addClass(_self.el.$fortuneList[i], 'contsBar-star-active');
            } else {
                util.removeClass(_self.el.$fortuneList[i]);
                util.addClass(_self.el.$fortuneList[i], 'contsBar-star-normal');
            }
        }
        //更新建议内容
        _self.el.$sugLink.innerText = data.suggest;
    }

    var userStar = storage.get(_self.selectStarKey);
    //优先拿命中用户记录星座
    if(userStar && userStar.selectId === astroId && userStar.data.date === new Date().Format('yyyyMMdd')) {
        updateConstellUIinfo(userStar.data);
    }
    else if(_self.store[astroId] && new Date().Format('yyyyMMdd') === _self.store[astroId].date) {
        updateConstellUIinfo(_self.store[astroId]);

        //存储用户选择的星座信息
        storage.set(_self.selectStarKey, {
            selectId: astroId,
            data: _self.store[astroId]
        });
    }
    else {
        model.napi(_self.reqUrl + astroId,
            function(data){
                //在内存里存储已经调用接口的星座，第二次选择时不用再调用接口
                _self.store[astroId] = data;

                if(_self.selectId === astroId) { //防止请求过长时用户频繁切换星座导致的数据不同步问题
                    //成功回调函数
                    updateConstellUIinfo(data);

                    //存储用户选择的星座信息
                    storage.set(_self.selectStarKey, {
                        selectId: astroId,
                        data: data
                    });
                }
            }
        );
    }
};

//public 方法
fn.init = function(){
    var _self = this;

    //事件绑定
    util.addEvent(_self.el.$select, 'change', function() {
        _self.selectId = _self.el.$select.value;

        _self.toggleConstellation(_self.selectId);

        var constellation = _self.el.$select.querySelector('option[value="'+ _self.selectId +'"]').dataset.title;
        try {   //对切换星座的行为进行统计
            window.waStat.eventStat({
                section: '星座模块',
                op: '选择星座',
                desc: constellation
            });
        } catch (e) {
            console.error(e.message);
        }
    });

    var userStar = storage.get(_self.selectStarKey);
    if(_self.fr === 'android') {
        //如果是android平台让高度自适应
        _self.el.$sugLink.style.height = 'auto';
    }
    if(userStar) {
        _self.selectId = userStar.selectId;
        _self.el.$select.value = userStar.selectId;

        try {   //添加对默认星座的统计
            window.waStat.eventStat({
                section: '星座模块',
                op: '默认星座',
                desc: userStar.data.title
            });
        } catch (e) {
            console.error(e.message);
        }
    }
    _self.toggleConstellation(_self.selectId);
};

module.exports = function(fr){
    var elements = util.domFind('.contsBarWarp');
    for(var i = 0,len = elements.length;i < len;i++){
        new ConstellationBar(elements[i], fr).init();
    }
};
