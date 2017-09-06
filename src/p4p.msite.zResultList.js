/**
 * Created by HC360 on 2017/5/23.
 */

var p4pBusinessLogic = require('./p4p.base'),
    /**
     * [_initSwipeEntity 初始化元素滚动插件]
     */
   _initSwipeEntity = function(elementEntity,_this) {


                    /**
                     * [判断竖排元素是否已初始化滚动组件]
                     */
                    if (elementEntity.data('inited')) {
                        return;
                    }

                    /**
                     * [初始化竖排滚动插件]
                     */
                    var swiperEntity = new Swiper(elementEntity, {
                        pagination: '.swiper-pagination',
                        paginationClickable: true,
                        slidesPerView: 'auto',
                        onInit: function() {
                            elementEntity.data('inited', true).find(".tabTt span:eq(0)").addClass('cur').siblings().removeClass('cur');
                        },

                        /**
                         * [onTransitionEnd 切换结束后执行相关业务逻辑，onSlideChangeEnd事件存在切换到最后一个的时候不触发的情况]
                         */
                        onTransitionEnd: function() {

                            /**
                             * [_index 获取实际显示帧索引]
                             * @type {Number}
                             */
                            var _index = swiperEntity.activeIndex;
                            if ((_index === (swiperEntity.slides.length - 2)) && swiperEntity.isEnd) {
                                _index++;
                            }
                            /**
                             * 发送当前展示产品的曝光数据
                             */
                            _this.cache.prolist[_index] && _this.sendExpoData([_this.cache.prolist[_index]]);

                            //渲染当前页效果样式
                            elementEntity.find(".tabTt span:eq(" + _index + ")").addClass('cur');
                            elementEntity.find(".tabTt span:eq(" + _index + ")").siblings().removeClass('cur');
                        }
                    });
                },
     _template=[
             '<div>',
             '<ul class="p4pCon2 swiper-wrapper">',
             '{{each products as product i}}',
             '<li class="swiper-slide">',
                 '<div class="ListImgBox">',
                     '{{ if (product.searchResultfoIsRecomHQ==1) }}<em class="yzIco"></em>{{/if}}',
                     '{{ if (product.searchResultfoIsRecomHQ==0) }}<em class="recomicon"></em>{{/if}}',
                     '<a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}"></a>',
                 '</div>',
                 '<div class="ImgBot">',
                     '<p class="til"><a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">{{product.searchResultfoTitle}}</a></p>',
                     '<p class="comp"><a href="//m.hc360.com/b2b/{{product.searchResultfoUserName}}/">{{product.searchResultfoCompany}}</a></p>',
                     '<div class="icoBox">',
                         '<em class="ico1"></em>',
                         '<em class="ico4"></em>',
                     '</div>',
                     '<div class="priBox">￥{{product.searchResultfoUnitPrice}}</div>',
                     '<div class="qtBox"><a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" rel="nofollow" onclick="sendUserlogsElement(\'UserBehavior_p4p_zmobile\');" target="_blank" >询价</a></div>',
                     '<p class="adTxt">广告</p>',
                 '</div>',
             '</li>',
             '{{/each}}',
             '</ul>',
            '<p class="tabTt">',
             '{{each products as product i}}',
             '<span></span>',
             '{{/each}}',
            '</p>',
            '</div>'
     ];


var p4pBusinessLogicEntity=new p4pBusinessLogic({
    /***
     * 外层包裹元素
     */
    wrap: $('#SwiperWrap'),
    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [referrer 曝光、点击来源参数]
     * @type {Number}
     */
    referrer: 37,
    /**
     * [keyword 搜索关键词]
     * @type {String}
     */
    keyword: _keyWord,

    /**
     * [cache 数据缓存]
     * @type {Object}
     */
    cache: $.extend(true,{},window.p4pbclist) || {},
    /****
     * [template 模板HTML]
     */
    template: _template.join(""),
    /**
     * [preventDefaultLinkRedirect 阻止点击计费元素默认行为，以免在未完成计费前页面跳转导致计费失败]
     * @type {Boolean}
     */
    preventDefaultLinkRedirect: true,

    /**
     * [autoSendExpoData 不自动发送曝光数据，以期在拖动时发送指定商品的曝光数据]
     * @type {Boolean}
     */
    autoSendExpoData:false,

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
/**
 * 派发数据加载完成事件,处理data数据
 */
p4pBusinessLogicEntity.addEventListener('onDataReady',function (data) {
    var  _prolist=[];
    /**
     * [过滤出推荐的P4P商品]
     */
    $.each(data.searchResultInfo, function (index, product) {
        if (Number(product.searchResultfoIsRecomHQ) != 1&&_prolist.length<5) {
            _prolist.push(product);
        }
    });
    data.searchResultInfo=_prolist;
});

/****
 * 监听渲染dom结束事件
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    var _this=this;

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

    /**
     * 渲染结束后发送第一个商品的曝光数据
     */
    _this.sendExpoData([_this.cache.prolist[0]]);

    /**
     * 多个产品时，需要初始化滚动插件
     */
    if (_this.cache.prolist.length > 1) {

        /**
         * 初始化元素滚动插件
         */
        _initSwipeEntity(targetElement,_this);
    }

});

p4pBusinessLogicEntity.init();


/****
 *  初始化下面列表的P4P实例
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

