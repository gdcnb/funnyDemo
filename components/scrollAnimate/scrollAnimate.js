/**
 * 页面滚动动画插件，提供一个页面元素的id号,之后它会滚动到该元素的位置
 * @param domId css选择器
 */
function scrollAnimate(domId) {
    var targetDom = document.querySelector(domId),
        viewH = window.innerHeight,
        pageH = document.body.offsetHeight,
        scrollH = document.body.scrollHeight;

    clearInterval(targetDom.timer);
    // private function
    /**
     * 获取滚动条需要滚动的距离，正数为向下滚动，负数为向上滚动
     * @param elem
     * @returns {number}
     */
    function getScrollDistance(elem) {
        var distance = elem.offsetTop, //元素外边框距离父元素内边框距离
            parent = elem.offsetParent,
            scrollY = document.body.scrollTop;

        while(parent){
            distance += parent.clientTop; //加上父元素边框宽度
            distance += parent.offsetTop; //加上父元素外边框到下个包含元素内边框距离
            parent = parent.offsetParent;
        }

        return distance - scrollY;
    }

    //只有页面高度比
    if((pageH > viewH) && targetDom) {
        targetDom.timer = setInterval(function(){
            var scrollDistance = getScrollDistance(targetDom),
                speed = scrollDistance > 0 ? Math.ceil(scrollDistance/5) : Math.floor(scrollDistance/5);

            //窗口高度会受到手机地址栏的影响，所以每次执行都重新拿一下值
            viewH = window.innerHeight;

            if(scrollDistance === 0){
                clearInterval(targetDom.timer);
            } else {
                document.body.scrollTop += speed;

                //TODO 手机上的地址栏会影响viewH的高度从而引发bug
                var checkH = document.body.scrollTop + viewH;
                if(checkH >= scrollH) { //当需要滚动的模块在最后一屏时结束运动
                    alert('scrollDistance=' + scrollDistance + '; viewH=' + viewH + 'checkH=' + checkH + '; pageH=' + pageH);
                    clearInterval(targetDom.timer);
                }
            }
        }, 20);
    }
}

window.scrollAnimate = scrollAnimate;

module.exports = window.scrollAnimate;