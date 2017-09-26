/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
    params_p4p:{ sys: 'detail',bus:'p4p_nobusi' },
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: window.lastKeyword || "",

    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 25,

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $('.Box2Con ul'),

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
        return $(targetHTML).prependTo(_this.wrap);
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
        _data = data || {},

        /**
         * [_prolist P4P商品数据列表]
         * @type {Array}
         */
        _prolist = _data.searchResultInfo || [],

        /**
         * [_tempHTMLArray 临时HTML数组]
         * @type {Array}
         */
        _tempHTMLArray = [
            '{{each products as product i}}',
            '<li data-index="{{i}}">',
            '    <dl>',
            '        <dt class="Box2Img">',
            '            <a href="{{product.searchResultfoUrl}}" target="_blank" data-sentLog="p4pDaTu"><img src="{{product.searchResultfoImageBig}}" onerror="this.src=\'http: //b2b.hc360.com/mmtTrade/images/nopic.jpg\';this.onerror=null;" height="148px" width="148px" /></a>',
            '        </dt>',
            '        <dd class="yenNum">{{product.pretreatPrice}}</dd>',
            '        <dd class="Box2Font"><a href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}" data-sentLog="p4pDaTu">{{product.searchResultfoTitle}}</a></dd>',
            '    </dl>',
            '</li>',
            '{{/each}}'
        ],

        /**
         * [_limit P4P广告位数量上限]
         * @type {Number}
         */
        _limit = 4;

    /**
     * [根据P4P广告位数量上限截取P4P数据]
     */
    _prolist.splice(_limit, _prolist.length);

    /**
     * [P4P广告位数量不够显示一行时]
     */
    if (_prolist.length < _limit) {
        _this.template = '';
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
    var _this = this;

    /**
     * [pretreatPrice 向渲染模板数据中添加格式化后的价格数据]
     */
    $.extend(true, template_params, {
        pretreatPrice: (parseFloat(template_params.searchResultfoUnitPrice) === 0) ? '面议' : ('<s>&yen;</s>' + template_params.searchResultfoUnitPrice)
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
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_detail_yellowpage_tupian');
        } catch (ex) {}
    });
});

/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();
