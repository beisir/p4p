/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [仅在免费自发商铺商品大图页、3Y商铺商品大图页加载P4P模块]
 */
if ((!window.ismmt) || (Number(window.is3y) == 1)) {

    /**
     * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
     * @type {p4pBusinessLogic}
     */
    var p4pBusinessLogicEntity = new p4pBusinessLogic({
        params_p4p:{ sys: 'detail',bus:'p4pFreeRelatedListForPicView' },
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
            return $("<div>").css({
                marginTop: "10px"
            }).appendTo($("#p4p_pic"))
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

    /****
     * 初始化页面上的后台初始化的P4P扣费请求
     */
    var staticP4pEntity = new p4pBusinessLogic({
        params_p4p:{ sys: 'detail',bus:'p4pFreeRelatedListForPicView' },
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: (window.productWord || ""),

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 3,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $('.PicLeftBox,#otherMod'),

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
            return element.closest('[p4p-bcid]').attr('p4pIndex');
        }
    });
    /**
     * [监听数据就绪事件]
     */
    staticP4pEntity.addEventListener('onDataReady', function (data) {
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
            _prolist = _data.searchResultInfo || [];

        /* [创建以商机id的列表索引，以便于判断指定商机id是否存在于当前列表中]
         */
        for (var i = 0; i < _prolist.length; i++) {
            _prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
        }

        /**
         * [查找包裹元素中P4P商品DOM元素,若这些区域中的商品存在于数据集中,则绑定点击事件发送相关数据]
         */
        _this.wrap.find("[p4p-bcid]").each(function (index, element) {
            var _elementEntity = $(element),
                _bcid = parseInt(_elementEntity.attr('p4p-bcid')) || 0,
                _bcindex = _prolist['bcid_' + _bcid.toString()];

            /**
             * [若当前商品存在商机id，且该商机id存在于全局P4P数据集中，则在该元素上保存商机id、商机id位于P4P数据集中的索引值，并设置P4P商机标记。]
             */
            if (_bcid && _bcindex >= 0) {
                _elementEntity.attr({
                    p4pIndex: _bcindex
                });
            }
        });

        /**
         * [target 初始化P4P广告位包裹元素，将只对该包裹元素下的可点击计费元素进行事件绑定]
         * @type {Object}
         */
        _this.target = _this.wrap.find('[p4pIndex]');
    });

    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    staticP4pEntity.addEventListener('onEndRender', function (targetElement) {

        /**
         * [绑定监测点点击事件]
         */
        targetElement.on("click", 'a', function () {
            try {
                HC.UBA.sendUserlogsElement('UserBehavior_p4p_freedetail_pic_2_tupian');
            } catch (ex) {
            }
        });
    });

    /**
     * 开始P4P业务对象初始化
     */

    staticP4pEntity.init();


    $(function () {
        /***
         * P4P列表
         * @type {*}
         * @private
         */
        var _li = $('[data-name="ads_baidu"]').find('ul li'),
            data=$.extend(true,{},window.p4pbclist),
            _template= [
                '{{ each products as product i }}',
                '<li>',
                '<a href="{{product.searchResultfoUrl}}" target="_blank" >{{product.searchResultfoTitle}}</a>',
                '</li>',
                '{{/each}}'
            ].join('');
            _prolist=data.searchResultInfo;
            // 上一件商品和下一件商品按钮对应P4P商机的bcid数组
            btnP4PArray=[];

        /***
         * 取出页面上第一条和第二条数据的bcid
          */
        $.each(_li.slice(0,2),function (index,val) {
            if($(val).attr('p4pindex')>=0){
                btnP4PArray.push($(val).attr('p4p-bcid'))
            }
        });

        /***
         * 没有P4P数据
         */
        if(btnP4PArray.length==0){
            return;
        }

        /***
         * 取出数组中包含第一条和第二条P4P商机的数据
         */
        _prolist=$.map(_prolist,function (product,index) {
             if(btnP4PArray[index]==product.searchResultfoId){
                 return product
            }
        });

        /***
         * map生成了新数组，覆盖原有的数据集合
         * @type {*}
         */
        data.searchResultInfo=_prolist;


        var p4pBusinessNextBtn=new p4pBusinessLogic({
            params_p4p:{ sys: 'detail',bus:'p4pFreeRelatedListForPicView' },
            /***
             * 关键词
             */
            keyword:(window.productWord || ""),
            /***
             * 广告包裹元素
             */
            wrap:$('#nextBtnP4pWrap ul'),
            /***
             * p4p来源
             */
            referrer:43,

            template:_template,
            /***
             * 点击计费元素选择器
             */
            clickableElementSelector:'a',

            /**
             * [cache 缓存P4P数据]
             * @type {Object}
             */
            cache:data,

            /***
             * 是否自动发送曝光
             */
            autoSendExpoData:false

        });

        p4pBusinessNextBtn.init();

        /***
         * 绑定大图左右按钮，如果点击左右按钮是最后一帧和第一帧，扣除P4P列表里面第一条和第二条商机的费用
         */
        $('#lastHtml,#nextHtml').click(function () {
            var _em = $(this).find('em').is(':visible'),
                _index = $(this).attr('id') == 'lastHtml' ? 0 : 1,
                target = $('#nextBtnP4pWrap ul li').eq(_index);
            if (_em && target.length> 0) {

                /***
                 * 移除按钮非P4P的监测点
                 */
                $(this)[0].removeAttribute('onclick');
                /**
                 * 发送P4P监测点
                 */
                HC.UBA.sendUserlogsElement('UserBehavior_p4p_freedetail_pic_down_tupian');

                /***
                 * 发送扣费请求
                 */
                $(target).find('a').trigger('click');

            }
        })


    })

}