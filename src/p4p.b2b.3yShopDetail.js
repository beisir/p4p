/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [存在商机ID列表]
 */
// if ($.trim(window.jump_p4pBcid).length) {
//
//     /**
//      * [_p4pbcidlist 获取bcid列表]
//      * @type {Array}
//      */
//     var _p4pbcidlist = ($.trim(window.jump_p4pBcid) || '').split(','),
//
//         /**
//          * [判断当前商机是否有对应的P4P商品，如果存在的话执行如下页面跳转逻辑]
//          */
//         _url = p4pBusinessLogic.prototype.parseURL(document.referrer),
//
//         /**
//          * [_spider 是否爬虫]
//          * @type {RegExp}
//          */
//         _spider = /spider/ig.test(window.navigator.userAgent);
//
//     /**
//      * [_p4pbc 随机获取商机列表中的一项]
//      * @type {[type]}
//      */
//     var _p4pbc = _p4pbcidlist[parseInt(_p4pbcidlist.length * Math.random())] || '';
//
//     /**
//      * [_p4pbcid 当前商机对应P4P商机编号]
//      * @type {Number}
//      */
//     var _p4pbcid = _p4pbc.split('|')[0],
//
//         /**
//          * [_keyword 当前商机对应P4P商机关键字]
//          * @type {String}
//          */
//         _keyword = _p4pbc.split('|')[1],
//
//         /**
//          * [_out 外网是否跳转]
//          * @type {[type]}
//          */
//         _out = _p4pbc.split('|')[2];
//
//     /**
//      * [非爬虫，存在对应P4P商机编号，存在访前，访前为内网]
//      */
//     if ((!_spider) && _p4pbcid && _keyword && document.referrer && (((!_out) && (/hc360.com$/.test(_url.host.toLowerCase()))) || _out)) {
//
//         /**
//          * [发送计费请求]
//          */
//         $.ajax({
//             url: '//p4pserver.org.hc360.com/p4pserver/doAnticheatingSpe',
//             data: {
//                 bcid: _p4pbcid,
//                 keyword: encodeURIComponent(_keyword)
//             },
//             dataType: 'jsonp',
//             jsonp: 'jsoncallback',
//             cache: false,
//             timeout: 3000
//         })
//             .done(function () {
//                 // console.log("success");
//             })
//             .fail(function () {
//                 // console.log("error");
//             })
//             .always(function () {
//
//                 /**
//                  * [_href 跳转页面地址]
//                  * @type {String}
//                  */
//                 var _href = '//b2b.hc360.com/supplyself/' + _p4pbcid + '.html';
//                 window.location.href = _href;
//             });
//     }
//
// }

/****
 * 获取图片地址
 */
$(window).load(function () {
    var picSrc = $('.zoomPad').find('img:first').attr('src'),
        _picPath = p4pBusinessLogic.prototype.parseURL(picSrc) || {};
    if (_picPath && _picPath.file != "no_pic.jpg" && _picPath.path) {
        var /**
             * [_spider 是否爬虫]
             * @type {RegExp}
             */
            _spider = /spider/ig.test(window.navigator.userAgent),
            picPath = _picPath.path,
            endIndex = picPath.indexOf('..'),
            /****
             * 图片文件名
             * @type {string}
             */
            picName = picPath.substr(1, endIndex - 1),
            /****
             * 商机ID
             * @type {*}
             */
            bcId = $("#bcid").val(),
            /**
             * [判断当前商机是否有对应的P4P商品，如果存在的话执行如下页面跳转逻辑]
             */
            _url = p4pBusinessLogic.prototype.parseURL(document.referrer);

        if ((!_spider) && document.referrer && (/hc360.com$/.test(_url.host.toLowerCase()))) {
            /****
             * 调用张帆的接口，返回P4P数据
             */
            $.ajax({
                url: '//wsdetail.b2b.hc360.com/getP4pResult',
                dataType: 'jsonp',
                data: {
                    bcid: bcId,
                    title: $("#comTitle").length > 0 ? $("#comTitle").text() : '',
                    picPath: picName
                },
                jsonp: 'callback',
                cache: false,
            }).done(function (data) {
                if (data.state == 1) {
                    var _product = data.data.p4pbclist[0];
                    /**
                     * [发送计费请求]
                     */
                    $.ajax({
                        url: '//p4pserver.org.hc360.com/p4pserver/doAnticheatingSpe',
                        data: {
                            bcid: _product.searchResultfoID,
                            keyword: _product.searchResultfoTp
                        },
                        dataType: 'jsonp',
                        jsonp: 'jsoncallback',
                        cache: false,
                        timeout: 3000
                    })
                        .done(function () {
                            // console.log("success");
                        })
                        .fail(function () {
                            // console.log("error");
                        })
                        .always(function () {

                            /**
                             * [_href 跳转页面地址]
                             * @type {String}
                             */
                            var _href = '//b2b.hc360.com/supplyself/' + _product.searchResultfoID + '.html';
                            window.location.href = _href;
                        });
                } else {
                    console.log(data.message);
                }

            }).fail(function () {

            });
        }

    }
});
/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
    params_p4p:{ sys: 'detail3y',bus:'p4p' },
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: (HC.getCookie && HC.getCookie("hclastsearchkeyword") || $(".item-top-tit h1").text() || ""),

    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 8,

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $('#buy-3y-list li,#recommend-3y-list li,#hot-shopList li'),

    /**
     * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
     * @type {[type]}
     */
    cache: window.p4pbclist || {},

    /**
     * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
     * @type {String}
     */
    template: '',

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
    _this.wrap.each(function (index, element) {
        var _elementEntity = $(element),
            _bcid = parseInt(_elementEntity.attr('data-p4p-bcid')) || 0,
            _bcindex = _prolist['bcid_' + _bcid.toString()];

        /**
         * [若当前商品存在商机id，且该商机id存在于全局P4P数据集中，则在该元素上保存商机id、商机id位于P4P数据集中的索引值，并设置P4P商机标记。]
         */
        if (_bcid) {
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
    _this.target = _this.wrap.filter('[data-p4p-mark]');
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
    targetElement.on("click", 'a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_sy_freedetail_supplyself_2_tupian');
        } catch (ex) {
        }
    });
});

/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();

/**
 * 实例化右侧p4p广告位
 */
var p4pAdvertising = new p4pBusinessLogic({
    params_p4p:{ sys: 'detail3y',bus:'p4p' },
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: (HC.getCookie && HC.getCookie("hclastsearchkeyword") || ""),

    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 29,

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $('#p4p-Advertising ul')
});

/**
 * 数据加载完成事件
 */
p4pAdvertising.addEventListener('onDataReady', function (data) {
    var _this = this,
        /**
         * [_limit P4P广告位数量上限]
         * @type {Number}
         */
        _limit = 2,

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
            '<li>',
            '<a href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">',
            '<img src="{{product.searchResultfoImageBig}}" height="200" width="200" alt="{{product.searchResultfoTitle}}">',
            '</a>',
            '<div class="A-title">',
            '<a href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">{{product.searchResultfoTitle}}</a>',
            '<span>广告</span>',
            '</div>',
            '<div class="price red">{{product.pretreatPrice}}</div>',
            '</li>',
            '{{/each}}'
        ];

    /**
     * [过滤出优质的P4P商品]
     */
    _prolist = $.map(_prolist, function (product, index) {
        if (Number(product.searchResultfoIsRecomHQ) === 1) {
            return product;
        }
    });

    /**
     * [根据P4P广告位数量上限截取P4P数据]
     */
    _prolist.splice(_limit, _prolist.length);

    /**
     * [searchResultInfo 因为 $.map 生成了新的数组，所以此处再将过滤后的数据更新到原始数据集中]
     */
    _data.searchResultInfo = _prolist;

    if (!_prolist.length) {
        _this.template = '';
        return;
    }

    _this.template = _tempHTMLArray.join('');
});

/**
 * [监听渲染结束事件]
 * @param  {Object} targetElement [广告位元素]
 */
p4pAdvertising.addEventListener('onEndRender', function (targetElement) {
    if (this.template == '') {
        return;
    }
    //隐藏百度联盟广告
    $('#baidu278').remove();
    /***
     * 显示p4p包裹元素
     */
    $("#p4p-Advertising").show();
    /**
     * [绑定监测点点击事件]
     */
    targetElement.on("click", 'a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_sy_supplyself_2_tupian');
        } catch (ex) {
        }
    });
});

/**
 * 开始P4P业务对象初始化
 */
p4pAdvertising.init();
