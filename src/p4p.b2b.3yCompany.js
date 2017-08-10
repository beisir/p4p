/**
 * Created by HC360 on 2017/6/7.
 */
var p4pBusinessLogic = require('./p4p.base');


var templateEntity = [
        '<ul>',
        '{{each products as product i}}',
        '<li>',
        '<a href="http://b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">',
        '<img src="{{product.searchResultfoImageBig}}" height="200" width="200" alt="{{product.searchResultfoTitle}}">',
        '</a>',
        '<div class="A-title"><a href="http://b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" target="_blank">{{product.searchResultfoTitle}} </a></div>',
        '<div class="price red">{{product.pretreatPrice}}</div>',
        '</li>',
        '{{/each}}',
        '</ul>'
    ];

var  P4PBusinessLogincEntity = new p4pBusinessLogic({
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: (window.HC && window.HC.getCookie && window.HC.getCookie("hclastsearchkeyword")) || window.titleKey,

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 40,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $(".p4pListBox .goods"),

        /**
         * [template 渲染模板HTML]
         * @type {String}
         */
        template: templateEntity.join('')

    });
/****
 * 监听获取数据结束事件
 */
P4PBusinessLogincEntity.addEventListener('onDataReady', function (data) {
    var  /**
         * [_data P4P数据对象]
         * @type {Object}
         */
        _data = data || {},

        /**
         * [_prolist P4P商品数据列表]
         * @type {Array}
         */
        _prolist = _data.searchResultInfo || [];

    /**
     * [过滤出优质的P4P商品]
     */
    _prolist = $.map(_prolist, function (product) {
        if (Number(product.searchResultfoIsRecomHQ) === 1) {
            return product;
        }
    });

    /**
     * [searchResultInfo 因为 $.map 生成了新的数组，所以此处再将过滤后的数据更新到原始数据集中]
     * 最多展示8条数据，少于4个不展示
     */
    _prolist=_prolist.slice(0,8);
    if(_prolist.length<4){
        _data.searchResultInfo=[];
        this.wrap.hide();
    }else {
        _data.searchResultInfo = _prolist;
    }

});
/****
 * 监听渲染dom结束事件
 */
P4PBusinessLogincEntity.addEventListener('onEndRender', function (targetElement) {
    /****
     * 发送监测点
     */
    targetElement.on('click', 'a', function () {
        try {
            HC&&HC.UBA&&HC.UBA.sendUserlogsElement('UserBehavior_p4p_sy_freedetail_callus');
        } catch (e) {
            console.error(e);
        }
    });

});
/****
 * 初始化p4p
 */
P4PBusinessLogincEntity.init();