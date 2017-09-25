/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base'),
    artTemplate = require('template');

/**
 * [仅在免费自发商铺商品大图页、3Y商铺商品大图页加载P4P模块]
 */
if ((!window.ismmt) || (Number(window.is3y) == 1)) {

    /**
     * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
     * @type {p4pBusinessLogic}
     */
    var p4pBusinessLogicEntity = new p4pBusinessLogic({

        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: (window.HC && window.HC.getCookie && window.HC.getCookie("hclastsearchkeyword") || $("#inquiryTitle").val()) || "",

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 3,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: '.RightBot a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: function () {
            return $("<div>").appendTo($("#p4p_pic"));
        },

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} element [被点击元素]
         * @return {Number}         [数据缓存中的索引值]
         */
        getClickElementCacheIndexCallback: function (element) {
            return element.attr('data-index');
        }
    });

    /**
     * [监听开始获取数据事件]
     * @param  {Object} data [商品数据]
     */
    p4pBusinessLogicEntity.addEventListener('onStartGetData', function (params) {
        var _this = this;

        /**
         * [data 扩展获取数据请求参数]
         * @type {Object}
         */
        $.extend(true, params, {
            data: {
                tsp4p: '1'
            }
        });
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
            _tempHTMLArray = [
                '<div class="ImgRightBox">',
                '	<div class="RightBot">',
                '		<em class="searchad">广告</em>',
                '		<dl>',
                '			<dd>',
                '				<div class="bwAdBox owl-carousel-wrap">',
                '					{{each products as product i}}',
                '					<div class="bImgBox">',
                '						<a data-sentLog="p4pDaTu" href="{{product.searchResultfoUrl}}" target="_blank" class="bwAdimg" data-index="{{i}}">',
                '							<img src="{{product.searchResultfoImageBig}}" alt="{{#product.pretreatTitle}}">',
                '						</a>',
                '						<div class="bImgTit">',
                '							<span></span>',
                '							<p><a data-sentLog="p4pDaTu" href="{{product.searchResultfoUrl}}" target="_blank" data-index="{{i}}">{{#product.pretreatTitle}}</a></p>',
                '						</div>',
                '					</div>',
                '					{{/each}}',
                '				</div>',
                '				<div class="bwAdBot">',
                '					<ul>',
                '						{{each products as product i}}',
                '						<li>',
                '							<a data-sentLog="p4pDaTu" href="{{product.searchResultfoUrl}}" target="_blank" data-index="{{i}}"><img src="{{product.searchResultfoImageSmall}}"></a>',
                '						</li>',
                '						{{/each}}',
                '					</ul>',
                '				</div>',
                '			</dd>',
                '		</dl>',
                '	</div>',
                '</div>'
            ],

            /**
             * [_limit P4P广告位数量上限]
             * @type {Number}
             */
            _limit = 5;

        /**
         * [根据P4P广告位数量上限截取P4P数据]
         */
        _prolist.splice(_limit, _prolist.length);

        /**
         * [template 设置模板HTML]
         * @type {String}
         */
        _this.template = _tempHTMLArray.join('');
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
        targetElement.on("click", '[data-sentLog="p4pDaTu"]', function () {
            try {
                HC.UBA.sendUserlogsElement('UserBehavior_p4p_freedetail_pic_2_tupian');
            } catch (ex) {
            }
        });

        /**
         * [异步加载图片轮播插件]
         */
        window.HC && window.HC.W && window.HC.W.load('owlcarousel', function () {

            /**
             * [owlCarouselEntity 设置图片滚动]
             * @type {Object}
             */
            _this.owlCarouselEntity = targetElement.find('.owl-carousel-wrap').owlCarousel({
                singleItem: true,
                slideSpeed: 1000,
                navigation: false,
                pagination: false
            }).data('owlCarousel');

            /**
             * [绑定缩略图联动大图事件]
             */
            targetElement.delegate('.bwAdBot li', 'mouseenter', function (event) {
                var index = $(this).index();
                _this.owlCarouselEntity.goTo(index);
            });
        });
    });

    /**
     * 开始P4P业务对象初始化
     */
    p4pBusinessLogicEntity.init();

    /**
     * P4P数据结构模板
     * @type {[*]}
     */
    var _template = [
            '{{ each products as product i }}',
            '<li data-p4p="{{i}}" bc-id="{{product.searchResultfoId}}">',
            '<dl>',
            '<dt><a href="{{product.searchResultfoUrl}}" target="_blank" ><img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}" onerror="this.src=\'//style.org.hc360.com/images/detail/mysite/siteconfig/SY-shop/no-pic.png\';this.onerror=null;"></a></dt>',
            '<dd><a href="{{product.searchResultfoUrl}}" target="_blank" >{{product.searchResultfoTitle}}</a></dd>',
            '</dl>',
            '</li>',
            '{{/each}}'
        ].join(''),
        /**
         * 搜索结果补足的html结构
         * @type {[*]}
         */
        searchTemp = [
            '{{ each products as product i }}',
            '<li bc-id="{{product.searchResultfoId}}">',
            '<dl>',
            '<dt><a href="{{product.searchResultfoUrl}}" target="_blank" ><img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}" onerror="this.src=\'//style.org.hc360.com/images/detail/mysite/siteconfig/SY-shop/no-pic.png\';this.onerror=null;"></a></dt>',
            '<dd><a href="{{product.searchResultfoUrl}}" target="_blank" >{{product.searchResultfoTitle}}</a></dd>',
            '</dl>',
            '</li>',
            '{{/each}}'
        ].join(''),
        /****
         * 左右按钮结构模板
         * @type {[*]}
         */
        btnTemp = [
            '<div class="arrowLeft" style="display:none;" id="prevBtn">',
            '<a rel="nofollow" href="javascript:;" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_supplyself_viewPics_bigimgleft_3Y\')"><em>上一件商品</em></a>',
            '</div>',
            '<div class="arrowRig" id="nextBtn">',
            '<a rel="nofollow" href="javascript:;" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_supplyself_viewPics_bigimgright_3Y\')" ><em style="display: none;">下一件商品</em></a>',
            '</div>'
        ],
        _keyWord = window.productWord || "",
        wrap = $('#largeImageP4PWrap'),
        /***
         * p4p接口数据
         */
        p4pResult = (function () {
            return $.ajax({
                url: '//s.hc360.com/getmmtlast.cgi',
                data: {
                    source: 3,
                    w: _keyWord,
                    mc: 'seller',
                    sys: 'ls',
                    p4p: '1'
                },
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                timeout: 3000
            })

        })(),
        /***
         * 搜索补足接口数据
         */
        searchResult = (function () {
            return $.ajax({
                url: "//s.hc360.com/getmmtlast.cgi",
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                data: {
                    w: _keyWord,
                    e: 4,
                    bus: 'relatedBuyerFreeList',
                    sys: 'detail',
                    ts: 1
                },
                timeout: 3000
            })
        })();

    $.when(p4pResult, searchResult).done(function (p4pObject, searchObject) {
        var p4pData = $.extend(true, {}, p4pObject[0]),
            searchData = $.extend(true, {}, searchObject[0]),
            p4pProduct = p4pData.searchResultInfo,
            searchProduct = searchData.searchResultInfo,
            limit = 3;
        /***
         * 截取上限
         */
        p4pProduct.splice(limit, p4pProduct.length);
        searchProduct.splice(limit, searchProduct.length);

        /***
         * 如果不够4条数据，不渲染左右按钮和产品列表
         */
        if (p4pProduct.length + searchProduct.length < limit) {
            return
        }
        /***
         * 添加左右按钮结构
         */
        wrap.prepend(btnTemp.join(''));

        /**
         * 初始化P4P实例对象
         */
        var p4pBusinessImagListEntity = new p4pBusinessLogic({
            /***
             * 关键词
             */
            keyword: _keyWord,
            /***
             * 广告包裹元素
             */
            wrap: wrap,
            /***
             * p4p来源
             */
            referrer: 3,
            /***
             * 模板
             */
            template: _template,

            /***
             * 点击计费元素选择器
             */
            clickableElementSelector: 'a',

            cache: p4pData,

            getClickElementCacheIndexCallback: function (element) {
                return element.closest('li').attr('data-p4p')
            },
            /**
             * [targetRenderCallback 广告位元素渲染到页面的回调函数]
             * @param  {Object} targetHTML [广告位元素]
             */
            targetRenderCallback: function (targetHTML) {
                var _ul = this.wrap.find('.endProBox ul');
                return $(targetHTML).appendTo(_ul);
            },

        });

        /**
         * [监听渲染结束事件]
         * @param  {Object} targetElement [广告位元素]
         */
        p4pBusinessImagListEntity.addEventListener('onEndRender', function (targetElement) {
            var that = this,
                /***
                 * 更新需要补充的数据条数
                 * @type {number}
                 */
                supplementNumber = limit - that.cache.prolist.length;
            /**
             * [绑定监测点点击事件]
             */
            targetElement.on("click", 'a', function () {

                try {
                    HC.UBA.sendUserlogsElement('UserBehavior_p4p_freedetail_pic_1_tupian');
                } catch (ex) {
                }
            });

            /***
             * 如果需要补充自然搜索结果数据
             */
            if (supplementNumber > 0) {
                /***
                 * 截取补足的条数限制
                 */
                searchProduct.splice(supplementNumber, searchProduct.length);


                var _searchProHtml = that.templateEngine.render(searchTemp)({
                    products: searchProduct || []
                });

                wrap.find('.endProBox ul').append(_searchProHtml);
            }

        });

        /**
         * 开始P4P业务对象初始化
         */
        if (p4pProduct.length > 0) {

            /****
             * 初始化P4P实例
             */
            p4pBusinessImagListEntity.init();
            /***
             * 拷贝一份数据
             * @type {*}
             */
            var btnP4pData = $.extend(true, {}, p4pData),

                btnProduct = btnP4pData.searchResultInfo;
            /**
             * 只截取第一条数据
             */
            btnProduct.splice(1, btnProduct.length);


            /***
             * 下一件商品点击扣费
             */
            var p4pBusinessNextBtn = new p4pBusinessLogic({
                /***
                 * 关键词
                 */
                keyword: _keyWord,
                /***
                 * 广告包裹元素
                 */
                wrap: $('#nextBtnP4pWrap ul'),
                /***
                 * p4p来源
                 */
                referrer: 43,
                /***
                 * 模板
                 */
                template: _template,

                /***
                 * 点击计费元素选择器
                 */
                clickableElementSelector: 'a',

                /**
                 * [cache 缓存P4P数据]
                 * @type {Object}
                 */
                cache: btnP4pData,

                /***
                 * 是否自动发送曝光
                 */
                autoSendExpoData: false

            });
            p4pBusinessNextBtn.init();

        } else {

            var _searchProHtml = artTemplate.render(searchTemp)({
                products: searchProduct || []
            });
            wrap.find('.endProBox ul').append(_searchProHtml);
        }

    });

}

/***
 * 绑定下一件商品按钮的点击事件
 */
$("body").on('click', '#nextBtn', function () {
    var _li = $("#nextBtnP4pWrap").find('li:first'),
        bcId = _li.attr('bc-id');
    /**
     * 如果有下一见商品的文字提示，点击扣费第一条P4P商机
     */
    if ($(this).find('em').is(":visible")) {
        bcId = bcId ? bcId : wrap.find('.endProBox li').attr('bc-id');
        if (_li.length > 0) {
            /***
             * 触发扣费请求
             */
            _li.find('a').click();
            /***
             * 移除按钮非P4P的监测点
             */
            $(this)[0].removeAttribute('onclick');
            /**
             * 发送P4P监测点
             */
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_freedetail_pic_down_tupian');
        }
        /***
         * 跳转页面地址
         */
        $(this).find('a').attr('href', '//b2b.hc360.com/viewPics/supplyself_pics/' + bcId + '.html#last='+window.supplyBcId);

    } else {
        /***
         * 显示上一个商品按钮
         */
        $("#prevBtn").show();
        /***
         * 显示P4P数据
         */
        wrap.find('.endProBox').show();

        /***
         * 显示下一件商品文字提示
         */
        $(this).find('em').show();
    }

}).on('click', '#prevBtn', function () {
    /***
     * 隐藏P4P数据
     */
    wrap.find('.endProBox').hide();
    /***
     * 隐藏下一件商品文字提示
     */
    $('#nextBtn').find('em').hide();
    /***
     * 隐藏上一个商品按钮
     */
    $(this).hide();
});









