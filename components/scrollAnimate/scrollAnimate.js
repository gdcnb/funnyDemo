/**
 * 页面滚动动画插件，提供一个页面元素的id号,之后它会滚动到该元素的位置
 * @param domId css选择器
 */
function scrollAnimate(domId) {
    var targetDom = document.querySelector(domId);

    targetDom.timer = setInterval(function(){
        var scrollDistance = getScrollDistance(targetDom),
            speed = scrollDistance > 0 ? Math.ceil(scrollDistance/5) : Math.floor(scrollDistance/5);

        if(scrollDistance === 0){
            clearInterval(targetDom.timer);
        } else {
            document.body.scrollTop += speed;
        }
    }, 20);

    // private function
    /**
     * 获取滚动条需要滚动的距离，正数为向下滚动，负数为向上滚动
     * @param elem
     * @returns {number}
     */
    function getScrollDistance(elem) {
        var distance = elem.offsetTop, //元素外边框距离父元素内边框距离
            parent = elem.offsetParent,
            scrollY = document.body.scrollTop,
            viewH = window.innerHeight,
            pageH = document.body.offsetHeight,
            scrollH = document.body.scrollHeight,
            resultH = 0;

        while(parent){
            distance += parent.clientTop; //加上父元素边框宽度
            distance += parent.offsetTop; //加上父元素外边框到下个包含元素内边框距离
            parent = parent.offsetParent;
        }

        /*var logDom = document.getElementById('showLog');
        logDom.innerHTML = 'viewH = '+ viewH +'<br>' +
            'distance = '+ (distance) +'<br>' +
            'distance - scrollY = '+ (distance - scrollY) +'<br>' +
            'scrollH = '+ scrollH +'<br>' +
            'scrollY = '+ scrollY +'<br>' +
            'scrollH - viewH = '+ (scrollH - viewH) +'<br>' +
            'viewH = '+ viewH;
*/
        //TODO 判断当前滚动条的位置
        var maxDist = scrollH - viewH;
        if(pageH < viewH) {
            //页面内容高度不满一屏时不用滚动
            resultH = 0;
        } else if (distance >= maxDist && scrollY >= maxDist) {
            //当滚动的元素在最后一屏的范围内时，只需要滚动到最后一屏的高度
            resultH = 0;
        } else {
            resultH = distance - scrollY;
        }

        return resultH
    }
}

//启动scroll事件更新viewH，解决地址栏引发的视图高度变化的问题
window.addEventListener('scroll', function(){
    var viewH = window.innerHeight;
});

window.scrollAnimate = scrollAnimate;

module.exports = window.scrollAnimate;