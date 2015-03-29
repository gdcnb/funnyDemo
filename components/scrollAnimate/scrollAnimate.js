
/* private function */
function clearIntervalTimer() {
    //当在滚动过程中有触发 touchmove 事件时则停止动画
    clearInterval(targetDom.timer);
}

function scrollEvent() {
    var viewH = window.innerHeight;
}
/**
 * 获取滚动条需要滚动的距离，正数为向下滚动，负数为向上滚动
 * @param elem
 * @returns {number}
 */
function getScrollDistance(elem) {
    var scrollY = window.pageYOffset,
        distance = elem.getBoundingClientRect().top + scrollY, //元素外边框距离父元素内边框距离
        viewH = window.innerHeight,
        pageH = document.body.offsetHeight,
        scrollH = document.body.scrollHeight,
        resultH = 0;

    //判断当前滚动条的位置
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

/**
 * 页面滚动动画插件，提供一个页面元素的id号,之后它会滚动到该元素的位置
 * @param domId css选择器
 */
function scrollAnimate(domId, callback) {
    var targetDom = document.querySelector(domId);

    targetDom.timer = setInterval(function(){
        var scrollDistance = getScrollDistance(targetDom),
            speed = scrollDistance > 0 ? Math.ceil(scrollDistance/5) : Math.floor(scrollDistance/5);

        if(scrollDistance === 0){
            clearInterval(targetDom.timer);
            if(typeof callback === 'function') {
                callback();
            }

            //执行完动画后移除事件监听
            window.removeEventListener('scroll', scrollEvent, false);
            document.body.removeEventListener('touchmove', clearIntervalTimer, false);
        } else {
            document.body.scrollTop += speed;
        }
    }, 20);

    //启动scroll事件更新viewH，解决地址栏引发的视图高度变化的问题
    window.addEventListener('scroll', scrollEvent, false);

    document.body.addEventListener('touchmove', clearIntervalTimer, false);
}

window.scrollAnimate = scrollAnimate;

module.exports = window.scrollAnimate;