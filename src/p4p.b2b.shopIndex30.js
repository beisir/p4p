/**
 * Created by HC360 on 2017/6/7.
 */
/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例 优品推荐]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
    params_p4p:{ sys: 'detail',bus:'p4pForHomepage' },
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: (window.searchVal || $('title:eq(0)').text() || ""),
    
    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 7,

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $("#ypBanner"),

    /**
     * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
     * @type {String}
     */
    template: '',

    /**
     * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
     * @type {[type]}
     */
    cache: window.p4pbclist || {},

    /**
     * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
     * @param  {Object} element [被点击元素]
     * @return {Number}         [数据缓存中的索引值]
     */
    getClickElementCacheIndexCallback: function (element) {
        return element.closest('li').data('index');
    }
});
/**
 * [监听数据就绪事件]
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
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
        _tempHTMLArray = [];

    /* [创建以商机id的列表索引，以便于判断指定商机id是否存在于当前列表中]
     */
    for (var i = 0; i < _prolist.length; i++) {
        _prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
    }

    /**
     * [查找包裹元素中P4P商品DOM元素,若这些区域中的商品存在于数据集中,则绑定点击事件发送相关数据]
     */
    _this.wrap.find(".proTopRecomCon ul li").each(function (index, element) {
        var _elementEntity = $(element),
            _bcid = parseInt(_elementEntity.attr('data-p4p-bcid')) || 0,
            _bcindex = _prolist['bcid_' + _bcid.toString()];

        /**
         * [若当前商品存在商机id，且该商机id存在于全局P4P数据集中，则在该元素上保存商机id、商机id位于P4P数据集中的索引值，并设置P4P商机标记。]
         */
        if (_bcid && _bcindex >= 0) {
            _elementEntity.data({
                id: _bcid,
                index: _bcindex
            }).attr('data-p4p-mark', '');
        }
    });

    /**
     * [target 初始化P4P广告位包裹元素，将只对该包裹元素下的可点击计费元素进行事件绑定]
     * @type {Object}
     */
    _this.target = _this.wrap.find('[data-p4p-mark]');
});

/**
 * [监听渲染结束事件]
 * @param  {Object} targetElement [广告位元素]
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    var _this = this;

    /**
     * [绑定监测点点击事件]
     */
    targetElement.on("click", '.recomImgBox a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_shopIndex30_img');
        } catch (ex) {
        }
    });
    targetElement.on("click", '.recomName a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_shopIndex30_title');
        } catch (ex) {
        }
    });
});

/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();

if ($("#homeRelatedMod").length > 0) {
    initRelated();
}

/**
 * [homeRelatedModDeferred 定义 猜你正在找 模块数据延迟对象]
 */
window.homeRelatedModDataDeferred = $.Deferred();

//首页猜你喜欢模块
function initRelated() {

    /**
     * [btnChangeSp 获取 换一批 按钮元素]
     * @type {Object}
     */
    var /**
         * 换一换按钮
         */
        btnChangeSp = $("#inBatch"),
        /**
         * 猜你喜欢区域div
         */
        mod = $("#homeRelatedMod"),

        /**
         * 猜你喜欢商品列表显示区域
         */
        listnode = mod.find("ul"),
        /**
         * [countNum 渲染到该模块的总的商品个数]
         * @type {Number}
         */
        countNum = 0,
        /**
         * [pageTotal 总页数]
         * @type {Number}
         */
        pageTotal = 0,

        /**
         * [everyshowNum 每页显示的商品数量，通过 换一批 按钮完成翻页操作]
         * @type {Number}
         */
        everyshowNum = 5,

        /**
         * [showIndex 当前已显示到第几个商品，用于记录当前翻到第几页]
         * @type {Number}
         */
        showIndex = 5,

        /**
         * [param 获取数据请求参数对象]
         * @type {Object}
         */
        param = {
            listType: "homeRelatedList",
            username: window.userName,
            memTypeId: window.memTypeId,
            supCat: encodeURIComponent(window.searchVal),
            areaName: encodeURIComponent(window.areaName)
        },

        likeMod = "//detail.b2b.hc360.com/detail/turbine/action/ajax.SearchSupplyDetailAjaxAction/eventsubmit_doProdbysupply/doProdbysupply",
        /**
         * [userlogs 监测点名称]
         * @type {String}
         */
        userlogs = "hcdetail_enterpriselog=detail_recommend_sp";

    /**
     * [获取 猜你正在找 模块数据]
     */
    $.ajax({
        url: likeMod,
        data: param,
        timeout: 3000,
        scriptCharset: "utf-8",
        dataType: "jsonp",
        jsonp: "jsoncallback"
    }).done(function (dataArr) {

        /**
         * [未成功获取 猜你正在找 模块数据，隐藏该模块]
         */
        if (!(dataArr && (parseInt(dataArr.success) === 1))) {
            mod.hide();
            return;
        }

        /**
         * 解决 猜你正在找 模块数据延迟对象，将P4P商品数据传递给需要该数据的业务逻辑
         */
        homeRelatedModDataDeferred.resolve(dataArr.jsonP4pList || {});

        /**
         * [因返回的数据中，普通的商品数据集中也包含P4P商品数据，所以将P4P商品数据从普通的商品数据集中删除，]
         */
        var p4pData = dataArr.jsonP4pList ? dataArr.jsonP4pList.searchResultInfo : [],
            list = dataArr.productList.slice(p4pData.length),

            /**
             * [html HTML字符串]
             * @type {String}
             */
            html = "";

        /**
         * [countNum 渲染到该模块的总的商品个数]
         * @type {Number}
         */
        countNum = list.length + p4pData.length;

        /**
         * [_num 设置总页数]
         * @type {[type]}
         */
        var _num = countNum % everyshowNum;
        //总页数
        pageTotal = (_num === 0) ? (countNum / everyshowNum) : (countNum / everyshowNum) + 1;

        /**
         * [开始渲染当前模块的普通商品]
         */
        for (var i = 0; i < list.length; i++) {
            if (i < 15) {
                var obj = list[i],
                    title = decodeURIComponent(obj.title).replace(/\+/g, " "),
                    url = obj.url,
                    price = obj.price != "" ? ("&yen;" + obj.price) : "面议",
                    imgsrc = obj.imgUrlBig,
                    file = ( p4pBusinessLogic.prototype.parseURL(obj.url) || {}).file,
                    ids = file ? file.substr(0, file.indexOf('.')) : "";
                html = html + '<li style="display:none">' + "<div class='picbox'>" + "<a href='" + url + "' data-exposurelog='" + userName + "," + ids + "' title='" + title + "'  target='_blank' onclick=\"return hcclick('?" + userlogs + "');\"><img onload='resizeImg(this,150,150);' onerror='imgonerror(this)' src='" + imgsrc + "'/></a>" + "</div>" + "<p class='pay'>" + price + "</p>" + "<p class='txtoverf'>" + "<a href='" + url + "' title='" + title + "' target='_blank' onclick=\"return hcclick('?" + userlogs + "');\">" + title + "</a>" + "</p>" + "</li>";
            }
        }

        /**
         * 将普通商品渲染到模块
         */
        $.trim(html).length && listnode.append(html);

        /**
         * [存在普通商品数据或存在P4P商品数据，则显示该模块，否则隐藏该模块]
         */
        if (($.trim(html).length !== 0) || p4pData.length) {

            /**
             * 显示该模块
             */
            mod.show();

            /**
             * 显示该模块的前五个商品
             */
            listnode.find("li").each(function (index) {
                index < everyshowNum && $(this).show();
            });

            /**
             * [若该模块的商品数量小于一页，隐藏 换一批 按钮]
             */
            if (listnode.find("li").length <= everyshowNum) {
                btnChangeSp.hide();
            }
        } else {
            mod.hide();
        }
        /**
         * [绑定 换一批 按钮点击事件]
         */
        btnChangeSp.bind("click", function () {
            listnode.find('li').each(function (index) {
                var $this = $(this);
                (index < showIndex + everyshowNum && index >= showIndex) ? $this.show() : $this.hide();
            });
            showIndex += everyshowNum;
            showIndex = showIndex >= countNum ? 0 : showIndex;
        });
    }).fail(function () {
        mod.hide();
    });
}


/**
 * [在延迟对象被解决后，渲染 猜你正在找 模块P4P内容]
 */
$.when(homeRelatedModDataDeferred).done(function (data) {

    /**
     * [_tempHTMLArray 临时模板HTML数组]
     * @type {Array}
     */
    var _tempHTMLArray = [
        '{{each products as product i}}',
        '<li data-index="{{i}}" style="display:none">',
        '<div class="picbox">',
        '<a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_spsy_{{i+1}}_tupian&quot;)" onmousedown="HC.UBA.sendUserlogsElement(\'UserBehavior_supplyself_llb_2_{{i+1}}?detailbcid={{product.searchResultfoId}}\')" data-exposurelog="###gg_supplyself_llb_2_{{i+1}}?detailbcid={{product.searchResultfoId}}"  href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}" target="_blank">',
        '<img src="{{product.searchResultfoImageBig}}">',
        '</a>',
        '</div>',
        '<p class="pay">{{product.pretreatPrice}}</p>',
        '<p class="txtoverf">',
        '<a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_spsy_{{i+1}}_title&quot;)" href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}" target="_blank">{{product.searchResultfoTitle}}</a>',
        '</p>',
        '</li>',
        '{{/each}}'
    ];

    /**
     * [homeRelatedModP4PBusinessLogicEntity 实例化P4P基础业务逻辑对象实例 猜你正在找]
     * @type {p4pBusinessLogic}
     */
    var homeRelatedModP4PBusinessLogicEntity = new p4pBusinessLogic({
        params_p4p:{ sys: 'detail',bus:'p4pForHomepage' },
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: (window['areaName'] || ""),

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 7,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a,button',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $('#relatetlist > ul'),

        /**
         * [template 渲染模板HTML]
         * @type {String}
         */
        template: _tempHTMLArray.join(''),

        /**
         * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
         * @type {[type]}
         */
        cache: data || {},

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} element [被点击元素]
         * @return {Number}         [数据缓存中的索引值]
         */
        getClickElementCacheIndexCallback: function (element) {
            return element.closest('[data-index]').attr('data-index');
        }
    });

    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    homeRelatedModP4PBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
        var _this = this;

        /**
         * [使图片列表中的图片自适应]
         */
        _this.resizeImage(targetElement.find('img'), function () {
            return $(this).closest('.picbox');
        });
    });

    /**
     * 开始P4P业务对象初始化
     */
    homeRelatedModP4PBusinessLogicEntity.init();
});