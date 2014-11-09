define(function(require){
    var util = require('components/util/util.js'),
        slice = Array.prototype.slice;

    /*window.onload = function() {
        waterfall('main', 'box');
    };
    var dataInt = {'data': [
        {'src':'http://image.uc.cn/s/nav/g/olps/2014/e6509df98e4bb63af2ae75f1c1ef2a28.jpg'},
        {'src':'http://image.uc.cn/s/nav/g/olps/2014/1584ff7e63ab8606d50f348d5a4dfb9f.jpg'},
        {'src':'http://image.uc.cn/s/nav/g/olps/2014/1584ff7e63ab8606d50f348d5a4dfb9f.jpg'}
    ]};
    window.onscroll = function() {
        var oParent = document.getElementById('main');
        if(checkScrollSlide()) {
            for(var i=0; i < dataInt.data.length; i++) {
                var oBox = document.createElement('div');
                oBox.className = 'box';
                oParent.appendChild(oBox);

                var oPic = document.createElement('div');
                oPic.className='pic';
                oBox.appendChild(oPic);

                var oImg = document.createElement('img');
                oImg.src = dataInt.data[i].src;
                oPic.appendChild(oImg);
            }
        }
        waterfall('main', 'box');

    };*/

    function checkScrollSlide() {
        var oParent = document.getElementById('main');
        var oBox = slice.apply(util.domFind(oParent, '.box'));

        var lastBox = oBox[oBox.length -1];
        var lastBoxH = Math.floor(lastBox.offsetTop + lastBox.offsetHeight/2);

        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var heigth = document.body.clientHeight || document.documentElement.clientHeight;

        return (lastBoxH < scrollTop + heigth)? true : false;
    }

    function waterfall(parent, box) {
        var oParent = document.getElementById(parent);
        var oBoxs = slice.apply(util.domFind(oParent, '.box'));
        //计算整个页面的显示的列数（页面宽/box的宽）
        var oBoxW = oBoxs[0].offsetWidth;
        var cols = Math.floor(document.documentElement.clientWidth/oBoxW);

        oParent.style.cssText = 'width:' + oBoxW * cols +'px;';

        var hArr = [];
        for(var i=0; i<oBoxs.length; i++) {
            if(i< cols){
                hArr.push(oBoxs[i].offsetHeight);
            } else {
                var minH = Math.min.apply(null, hArr);
                var index = getMinhIndex(hArr, minH);
                oBoxs[i].style.position = 'absolute';
                oBoxs[i].style.top = minH + 'px';
                oBoxs[i].style.left = oBoxs[index].offsetLeft + 'px';

                hArr[index] += oBoxs[i].offsetHeight;
            }
        }
    }
    function getMinhIndex(arr, val) {
        for(var i = 0; i <arr.length; i++) {
            if(arr[i] == val) {
                return i;
            }
        }
    }
});