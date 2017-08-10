/**
 * Created by HC360 on 2017/5/24.
 */

var p4pBusinessLogic = require('./p4p.base');

    /****
     *  初始化猜你喜欢的P4P实例
     */
var  p4pMsiteZResultList=new p4pBusinessLogic({
    /****
     * 需要点击计费的元素
     */
    target: $('li[data-p4p="true"]'),
    /***
     * 外层包裹元素
     */
    wrap: $('body'),
    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'li[data-p4p="true"] a',
    /**
     * [cache 数据缓存]
     * @type {Object}
     */
    cache: window.p4pbclist || {},
    /**
     * [referrer 曝光、点击来源参数]
     * @type {Number}
     */
    referrer: 37,
    /**
     * [keyword 搜索关键词]
     * @type {String}
     */
    keyword: (_keyWord || ""),

    /**
     * [preventDefaultLinkRedirect 阻止点击计费元素默认行为，以免在未完成计费前页面跳转导致计费失败]
     * @type {Boolean}
     */
    preventDefaultLinkRedirect: true,

    /**
     * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
     * @param  {Object} elemnet [被点击元素]
     * @return {Number}         [数据缓存索引值]
     */
    getClickElementCacheIndexCallback: function (element) {
        var _index,
            _bcid = element.closest('li').attr('data-businid'),
            _proList = (window.p4pbclist || {}).searchResultInfo;
        if(_proList){
            $.each(_proList, function (index, val) {
                if (val.searchResultfoId == _bcid) {
                    _index = index;
                    return false;
                }
            });
        }
        return _index;
    },
    /**
     * [preventDefaultLinkRedirectCallBack 取消被点击链接的默认行为后，如果跳转的回调函数，在 preventDefaultLinkRedirect 为 true 的时候起作用]
     * @param  {Object} element [被点击元素]
     */
    preventDefaultLinkRedirectCallback: function(element) {
        var href = element.attr('href');
        if ($.trim(href).length !== 0) {
            window.location.href = href;
        }
    }
});

/****
 * 监听渲染dom结束事件
 */
p4pMsiteZResultList.addEventListener('onEndRender', function (targetElement) {
    /****
     * 发送监测点
     */
    targetElement.on('click', 'a', function () {
        try {
            window.sendUserlogsElement&&sendUserlogsElement('UserBehavior_p4p_zmobile');
        } catch (e) {
            console.error(e);
        }
    });

});
/****
 * 初始化p4p
 */
p4pMsiteZResultList.init();