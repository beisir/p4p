/**
 * Created by HC360 on 2017/7/18.
 */
var p4pBusinessLogic = require('./p4p.base'),
    _title=encodeURIComponent($('meta[name="keywords"]').attr('content')),
    /****
     * 切词接口
     */
    keyWorddeffer = function () {
        return $.ajax({
            url: 'http://p4pdetail.hc360.com/p4pdetail/common/get/titleCoreKeyword.html',
            type: 'get',
            data: {
                title:_title
            },
            dataType: 'jsonp',
            jsonp: 'callback',

        })
    },
    /***
     * 优质商品推荐模板
     * @type {[*]}
     * @private
     */
    _template=[
        '{{ each products as product i }}',
        '<dl>',
            '<dt>',
                '<a href="{{product.searchResultfoUrl}}" target="_blank">',
                    '<img src="{{product.searchResultfoImageBig}}"/>',
                '</a>',
            '</dt>',
            '<dd class="firDd">',
                '<a href="{{product.searchResultfoUrl}}" target="_blank">{{product.searchResultfoTitle}}</a>',
            '</dd>',
            '<dd class="secDd">',
                '<span class="pric">{{product.pretreatPrice}}</span>',
            '</dd>',
            '<dd class="thiDd">',
                '<a href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/" target="_blank" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a>',
            '</dd>',
        '</dl>',
        '{{/each}}'
    ],
    bottomTemplate=[
        '<div class="picBoxBot"><ul>',
        '{{ each products as product i }}',
        '<li>',
            '<dl>',
                '<dt>',
                    '<div class="picBoxImgCon">',
                        '<a  class="bcId-hook"  href="{{product.searchResultfoUrl}}"  target="_blank" title="{{product.searchResultfoTitle}}">',
                            '<img src="{{#product.searchResultfoImageBig}}"  alt="{{product.searchResultfoTitle}}" >',
                        '</a>',
                    '</div>',
                '</dt>',
                '<dd class="picBoxPrice">{{#product.pretreatConversionPrice}}</dd>',
                '<dd class="picBotName">',
                    '<a href="{{product.searchResultfoUrl}}"  title="{{product.searchResultfoTitle}}" target="_blank">',
                        '<span>{{product.searchResultfoTitle}}</span>',
                '</dd>',
            '</dl>',
        '</li>',
        '{{/each}}',
        '</ul></div>',
    ],
    p4pBusinessLogicEntity,
    /***
     * P4P数据延迟对象
     * @type {[*]}
     * @private
     */
    p4pDeff=$.Deferred();


if(_title){
    var deffer=keyWorddeffer();
    deffer.done(function (result) {
        p4pBusinessLogicEntity = new p4pBusinessLogic({
            /**
             * [wrap 广告位包裹元素]
             * @type {Object}
             */
            wrap: $('[node-name="P4P-wrap"]  .p4pList'),

            /**
             * [clickableElementSelector 点击计费元素选择器]
             * @type {String}
             */
            clickableElementSelector: 'a,button',

            /**
             * [referrer 曝光、点击来源参数]
             * @type {Number}
             */
            referrer: 47,

            /**
             * [keyword 搜索关键词]
             * @type {String}
             */
            keyword: result.keyword||'',

            /**
             * [template 渲染模板HTML]
             * @type {String}
             */
            template: _template.join(''),

            getClickElementCacheIndexCallback: function(element) {
                return element.closest('dl').index();
            },
        });

        p4pBusinessLogicEntity.addEventListener('onDataReady',function (data) {
            var _data=$.extend(true,{},data),
                defferData=$.extend(true,{},data),
                _product=_data.searchResultInfo||[],
                limit=4;

            /***
             * 过滤优质的P4P数据
             */
            _product=$.map(_product,function (product) {
                if (Number(product.searchResultfoIsRecomHQ) === 1) {
                    return product;
                }
            });

            /***
             * 截取P4P上限，上限以外的数据，顺序放到延迟对象里面，给下面的P4P使用
             */
            defferData.searchResultInfo=_product.splice(limit,_product.length);

            /***
             * 如果P4P数据不够显示当前数据
             */
            if(_product.length==0){
                return;
            }
            /****
             * map生成了新数组，更新到原有的数据里面
             * @type {*}
             */
            data.searchResultInfo=_product;

            p4pDeff.resolve(defferData,result.keyword||"");
        });
        /**
         * [监听渲染结束事件，绑定元素鼠标悬浮事件]
         * @param  {Object} targetElement [广告位元素]
         */
        p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
            var _wrap=$('[node-name="P4P-wrap"]');
            /**
             * [绑定监测点点击事件]
             */
            targetElement.on("click", 'a', function () {
                try {
                    HC.UBA.sendUserlogsElement('UserBehavior_p4p_cggs');
                } catch (ex) {
                }
            });
            /***
             * 渲染完成P4P产品，显示P4P外层包裹结构
             */
            _wrap.show();

            _wrap.find('.sucTil a').attr('href','http://z.hc360.com/p4psearch/search.html?key='+result.keywordcode)
        });

        /**
         * 开始搜索页顶部P4P业务对象初始化
         */

        p4pBusinessLogicEntity.init();
    });
}

/***
 * p4p数据加载完毕,渲染底部的P4P数据
 */
$.when(p4pDeff).done(function (data,_keyword) {
    /***
     * 如果数据少于4条不展示
     */
    if(data.searchResultInfo.length<5){
        return false;
    }

    /***
     * 截取上限
     */
    data.searchResultInfo.splice(5,data.searchResultInfo.length);

   var bottomP4pEntity = new p4pBusinessLogic({
        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $('[node-name="bottomP4p-wrap"]'),

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a,button',

        /**
         * [referrer 曝光、点击来源参数]
         * @type {Number}
         */
        referrer: 47,

        /**
         * [keyword 搜索关键词]
         * @type {String}
         */
        keyword: _keyword,

        cache:data,

        /**
         * [template 渲染模板HTML]
         * @type {String}
         */
        template: bottomTemplate.join(''),
    });

    /**
     * [监听渲染开始事件]
     * @param  {String} template         [渲染模板HTML]
     * @param  {Object} template_params  [渲染模板参数]
     */
    bottomP4pEntity.addEventListener('onStartRender', function (template, template_params) {
        var _prolist = template_params.products;

        /**
         * [将缩略图修改成 220x220 尺寸]
         */
        $.each(_prolist, function (index, product) {
            product.pretreatConversionPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' : ('<em>&yen;</em>' + product.searchResultfoUnitPrice + ' &frasl;' + product.searchResultfoMeasureUnit);
        });
    });

    /**
     * [监听渲染结束事件，绑定元素鼠标悬浮事件]
     * @param  {Object} targetElement [广告位元素]
     */
    bottomP4pEntity.addEventListener('onEndRender', function (targetElement) {
        /**
         * [绑定监测点点击事件]
         */
        targetElement.on("click", 'a', function () {
            try {
                HC.UBA.sendUserlogsElement('UserBehavior_p4p_cggs');
            } catch (ex) {
            }
        });
        /***
         * 渲染完成P4P产品，显示P4P外层包裹结构
         */
        this.wrap.show();
    });

    /**
     * 开始搜索页顶部P4P业务对象初始化
     */

    bottomP4pEntity.init();
});
