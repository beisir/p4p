/**
 * Created by HC360 on 2017/7/6.
 * JS站商品大图页
 */

/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');
/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
$(function () {
    var p4pBusinessLogicEntity = new p4pBusinessLogic({
        params_p4p:{ sys: 'js',bus:'p4p_pic' },
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: $("#p4pkeyword").val() || '',

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 45,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $('#p4p_wrap ul'),

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} element [被点击元素]
         * @return {Number}         [数据缓存中的索引值]
         */
        getClickElementCacheIndexCallback: function(element) {
            return element.closest('li').attr('data-index');
        },

        /**
         * [targetRenderCallback 广告位元素渲染到页面的回调函数]
         * @param  {Object} targetHTML [广告位元素]
         */
        targetRenderCallback: function(targetHTML) {
            var _this = this;
            _this.wrap.empty();
            return $(targetHTML).appendTo(_this.wrap);
        },

        /**
         * [preventDefaultLinkRedirect 阻止点击计费元素默认行为，以免在未完成计费前页面跳转导致计费失败]
         * @type {Boolean}
         */
        preventDefaultLinkRedirect: true,

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
     * [监听数据就绪事件]
     */
    p4pBusinessLogicEntity.addEventListener('onDataReady', function(data) {
        var _this = this,

            /**
             * [_data P4P数据对象]
             * @type {Object}
             */
            _data = (data || {}).searchResultInfo || [],

            /**
             * [_tempHTMLArray 临时HTML数组]
             * @type {Array}
             */
            _tempHTMLArray = [
                '{{each products as product i}}',
                '<li data-index={{i}}>',
                    '<div class="img-box"><a href="//js.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageSmall}}" alt="{{product.searchResultfoTitle}}"></a></div>',
                    '<p class="pro-name"><a href="//js.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">{{product.searchResultfoTitle}}</a></p>',
                    '<p>{{#product.pretreatPrice}}</p>',
                '</li>',
                '{{/each}}'
            ],

            /**
             * [_limit P4P广告位数量上限]
             * @type {Number}
             */
            _limit = 4;

        /***
         * 过滤优质商品
         */
        var _prolist=$.map(_data,function (product) {
            if(Number(product.searchResultfoIsRecomHQ) === 1){
                return product
            }
         });

        /**
         * [根据P4P广告位数量上限截取P4P数据]
         */
        _prolist.splice(_limit, _prolist.length);


        /***
         * map生成新的数组，更新到data数据里面
         */
        (data || {}).searchResultInfo=_prolist;

        /**
         * [P4P广告位数量不够最少展示的上线，不渲染P4P，隐藏商机推荐]
         */
        if (_prolist.length < _limit) {
            (data || {}).searchResultInfo=[];
            $("#p4p_wrap").hide();
            return;
        }

        /**
         * [template 设置模板HTML]
         * @type {String}
         */
        _this.template = _tempHTMLArray.join('');
    });

    /**
     * [监听开始渲染事件]
     */
    p4pBusinessLogicEntity.addEventListener('onStartRender', function(template, template_params) {
        var _this = this,
            _prolist = template_params.products;

        /**
         * [修改价格格式]
         */
        $.each(_prolist, function(index, product) {
            product.pretreatPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' :'<span>&yen;<b>'+product.searchResultfoUnitPrice+'</b><em>/'+ product.searchResultfoMeasureUnit +'</em></span>';
        });
    });


    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
        var _this = this;

        /**
         * [绑定监测点点击事件]
         */
        targetElement.on("click", '[data-sentLog="p4pDaTu"]', function() {
            try {
                sendUserlogsElement&&sendUserlogsElement('UserBehavior_p4p_js_pic_big_tupian');
            } catch (ex) {}
        });
    });

    /**
     * 开始P4P业务对象初始化
     */
    p4pBusinessLogicEntity.init();
});
