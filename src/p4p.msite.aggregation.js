/**
 * Created by HC360 on 2017/4/24.
 */
/**
 * [_ua 获取当前浏览器类型]
 * @type {Object}
 */
var _ua = require('./ua').parseUA(window.navigator.userAgent),

    /****
     * 是否扣费
     * @type {boolean}
     */
    isPersisted=false,

    p4pBusinessLogic = require('./p4p.base'),
    /*****
     * 延迟对象，以便下面P4P列表和左右滑动初始化
     */
    deferredData = $.Deferred(),
    /***
     * 第一位置p4p数组
     * @type {Array}
     */
    firstP4pProductArr=[],
    /***
     * 优质P4P商品
     * @type {Array}
     */
    highQualityArr = [],
    /***
     * 推荐P4P商品
     * @type {Array}
     */
    recommendedArr = [],

    /***
     * 关键词
     * @type {p4pBusinessLogic}
     */
    _keyWord = window.keyword || '',
    /***
     * 第一位置模板数组；
     * @type {[*]}
     * @private
     */
    _template = {
        firstTempHTMLArray: [
            '<div data-p4p="true">',
            '{{each products as product i}}',
            '<div class="bigPic"><a  href="http://m.hc360.com/supplyself/{{product.searchResultfoId}}.html"><img src="{{product.searchResultfoImageBig}}"></a></div>',
            '<div class="bigRtxt">',
            '<p class="til">',
            '<a  href="http://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{ product.searchResultfoText }}"><span>{{#product.searchTitle}}</span></a>',
            '</p>',
            '<p class="price">￥<span>{{product.searchResultfoUnitPrice}}/{{product.searchResultfoMeasureUnit}}</span><em>广告</em></p>',
            '{{each product.pretreatAttrs as proattr i}}',
            '<p>{{ proattr.name }}:{{ proattr.value }}</p>',
            '{{/each}}',
            '</div>',
            '<div class="bigBtxt">',
            '<p class="comp"><a  href="http://m.hc360.com/b2b/{{product.searchResultfoUserName}}/" title="{{ product.searchResultfoCompany }}">{{ product.searchResultfoCompany }}</a></p>',
            '<div class="icoBox">',
            '<span class="ico1"></span>',
            '<span class="ico4"></span>',
            '<span class="p4pIco"></span>',
            '</div>',
            '<p class="xjBt"><a href="javascript:;"  node-name="p4pNode" rel="nofollow" target="_blank" onclick="alertInquiryInfo(\'{{product.searchResultfoProviderid}}\',\'{{product.searchResultfoId}}\',\'{{product.searchResultfoTitle}}\',\'{{product.searchResultfoUserName}}\',\'UserBehavior_m_searchsupply_inquiry\')" >询价</a></p>',
            '</div>',
            '{{/each}}',
            '</div>'
        ],
        listP4pTempArr: [
            '{{each products as product i}}',
            '<li>',
            '<div class="listImg">',
            '<a  href="http://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" ><img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}"></a>',
            '</div>',
            '<div class="listTxt">',
            '<p class="til"><a  href="http://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" ><span>{{#product.searchTitle}}</span></a></p>',
            '<p class="comp"><a  href="http://m.hc360.com/b2b/{{product.searchResultfoUserName}}/" title="{{product.searchResultfoCompany}}" >{{product.searchResultfoCompany}}</a><em>广告</em></p>',
            '<div class="icoBox">',
            '<span class="ico1"></span>',
            '<span class="ico4"></span>',
            '<span class="p4pIco"></span>',
            '</div>',
            '<div class="priBox">￥{{product.searchResultfoUnitPrice}}<span>/{{product.searchResultfoMeasureUnit}}</span></div>',
            '<div class="qtBox"><a  node-name="p4pNode"  href="javascript:;" rel="nofollow" target="_blank" onclick="alertInquiryInfo(\'{{product.searchResultfoProviderid}}\',\'{{product.searchResultfoId}}\',\'{{product.searchResultfoTitle}}\',\'{{product.searchResultfoUserName}}\',\'UserBehavior_m_searchsupply_inquiry\')" >询价</a></div>',
            '</div>',
            '</li>',
            '{{/each}}'
        ],
        sliderP4pTempArr:[
            '<div>',
            '<ul class="p4pCon2 swiper-wrapper">',
            '{{each products as product i}}',
            '<li class="swiper-slide">',
            '<div class="listImg">',
            '<a  href="http://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" ><img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}"></a>',
            '</div>',
            '<div class="listTxt">',
            '<p class="til"><a  href="http://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" ><span>{{#product.searchTitle}}</span></a></p>',
            '<p class="comp"><a  href="http://m.hc360.com/b2b/{{product.searchResultfoUserName}}/" title="{{product.searchResultfoCompany}}" >{{product.searchResultfoCompany}}</a><em>广告</em></p>',
            '<div class="icoBox">',
            '<span class="ico1"></span>',
            '<span class="ico4"></span>',
            '<span class="p4pIco"></span>',
            '</div>',
            '<div class="priBox">￥{{product.searchResultfoUnitPrice}}<span>/{{product.searchResultfoMeasureUnit}}</span></div>',
            '<div class="qtBox"><a node-name="p4pNode" href="javascript:;" rel="nofollow" target="_blank"  onclick="alertInquiryInfo(\'{{product.searchResultfoProviderid}}\',\'{{product.searchResultfoId}}\',\'{{product.searchResultfoTitle}}\',\'{{product.searchResultfoUserName}}\',\'UserBehavior_m_searchsupply_inquiry\')" >询价</a></div>',
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

        ]
    },
  /***
   * url查询参数
   */
  _params= (p4pBusinessLogic.prototype.parseURL(document.URL)||{}).params,
  clickreferer=(_params||{}).clickreferer,
  _referrer=clickreferer==56 ? 57 :32;


/***
 * 初始化第一位置P4P的实例
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({

    /***
     * 外层包裹元素
     */
    wrap: $('[data-name="firstP4pProduct"]'),
    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [referrer 曝光、点击来源参数]
     * @type {Number}
     */
    referrer: clickreferer==56 ? 56: 31,
    /**
     * [keyword 搜索关键词]
     * @type {String}
     */
    keyword: _keyWord,
    /****
     * [template 模板HTML]
     */
    template: _template.firstTempHTMLArray.join(""),
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
        var nodeName=element.attr('node-name'),
            href = element.attr('href');
        if(nodeName=="p4pNode"){
            return false
        }
        if ($.trim(href).length !== 0) {
            window.location.href = href;
        }
    },

    getClickElementCacheIndexCallback:function (element) {
        return element.closest('div[data-p4p="true"]').index();
    }

});
/****
 * 监听数据获取结束
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
    var _data = $.extend(true, {}, data),
        firstData,
        _prolist = data.searchResultInfo || [];

    /***
     * 过滤优质,推荐商品
     * @type {Array}
     * @private
     */
    $.each(_prolist, function (index,product) {
        if (Number(product.searchResultfoIsRecomHQ) === 1) {
            highQualityArr.push(product);
        } else {
            recommendedArr.push(product)
        }
    });
    /***
     * 第一位置截取优质的第一个
     */
    firstData=highQualityArr.shift();

    /**
     * 解决P4P数据就绪延迟对象，以便下面继续使用这个数据
     */
    deferredData.resolve(_data);

    /***
     * 如果存在第一个位置数据
     */
    if(firstData){
        firstP4pProductArr.push(firstData);
        data.searchResultInfo=firstP4pProductArr;
    }else {
        data.searchResultInfo=[];
        $('[data-name="firstP4pProduct"]').hide();
        return false;
    }

});
/****
 * 开始渲染事件
 */
p4pBusinessLogicEntity.addEventListener('onStartRender', function (_template, _template_params) {
    var _this = this,
        _tempRegExp = new RegExp(_this.keyword, 'img'),
        _prolist = _template_params.products;

    /****
     *  如果是后退回来的页面不扣费，判断是否是回退回来的页面
     */
    if (_ua.mobile) {
        $(window).on('pageshow', function(evt) {
            setTimeout(function() {
                if(evt.persisted||evt.originalEvent.persisted) {
                    isPersisted=true;
                    // window.location.reload();
                }
            });
        });
    }

    //每次webview重新打开H5首页，就把server time记录本地存储
    // var REMOTE_VER = $('#SERVER_TIME').val();
    // sessionStorage.setItem('PAGEVERSION',REMOTE_VER);
    // if(REMOTE_VER){
    //     var LOCAL_VER = sessionStorage && sessionStorage.PAGEVERSION;
    //     if(LOCAL_VER && parseInt(LOCAL_VER) > parseInt(REMOTE_VER)){
    //         //说明html是从本地缓存中读取的
    //         isPersisted=true;
    //         location.reload(true);
    //     }else{
    //         //说明html是从server端重新生成的，更新LOCAL_VER
    //         sessionStorage.PAGEVERSION = REMOTE_VER;
    //     }
    // }

    /**
     * 修改数据
     */
    $.each(_prolist, function (index, product) {
        /***
         * 标题关键词加红
         * @type {*}
         */
        product.searchTitle = product.searchResultfoTitle.replace(_tempRegExp, '<em>' + _this.keyword + '</em>');

    });

});
/****
 * 监听渲染dom结束事件
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {


    var _this=this,
        _tempCacheData = _this.cache.prolist[0];

    /****
     * 发送监测点
     */
    targetElement.on('click', 'a', function () {
        try {
            window.sendUserlogsElement&&sendUserlogsElement('UserBehavior_p4p_m_juhe_page');
        } catch (e) {
            console.error(e);
        }
    });

    /****
     * 自动发送扣费请求
     */
    // if(_tempCacheData&&(!isPersisted)){
    //     _tempCacheData.clicked = true;
    //     _this.sendHttpRequest('click', {
    //         data: _this.buildClickParams(_tempCacheData, 0)
    //     });
    // }


});

/**
 * [监听创建曝光参数事件，向曝光参数中对象中添加新字段]
 * @param  {Object} _paramsObject [参数对象]
 * @param  {Object} _data         [商品参数对象]
 */
p4pBusinessLogicEntity.addEventListener('onBuildExpoData', function (_paramsObject, _data) {
    var _this = this,

        /**
         * [_querystring 由后台解析的查询参数对象]
         * @type {Object}
         */
        _querystring = window.requesParamsVo || {};

    /**
     * [_params 设置曝光数据]
     * @type {Array}
     */
    _paramsObject.params = [
        encodeURIComponent(_this.keyword),
        _data.searchResultfoId,
        (_data.searchResultfoPlanId || ''),
        (_data.searchResultfoUnitId || ''),
        _data.searchResultfoUserId,
        _data.searchResultfoProviderid,
        _this.referrer,
        _data.searchResultfoKypromote,
        ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
        encodeURIComponent(_querystring.keywordextend) || '0',
        _querystring.match || '0',
        _querystring.confr || '0'
    ];
});

/**
 * 派发构建点击计费参数结束事件,增加计费参数
 */
p4pBusinessLogicEntity.addEventListener('onAfterBuildClickParams',function (_params,_data,_index) {
     /**
     * [_querystring 由后台解析的查询参数对象]
     * @type {Object}
     */
       var _querystring = window.requesParamsVo || {};
    /*** 访前地址 **/
    _params.referer=document.referrer;
    /*** 请求ip **/
    _params.p4pip=_querystring.p4pip;
    /*** 匹配规则**/
    _params.match=_querystring.match;
    /*** 扩词 **/
    _params.keywordextend=encodeURIComponent(_querystring.keywordextend);
    /*** 点击平台 **/
    _params.confr=_querystring.confr;
});

p4pBusinessLogicEntity.init();


/****
 * 渲染p4p数据列表
 */
$.when(deferredData).done(function (data) {
    /****
     * 渲染中间部分p4p数据
     * @type {[*]}
     */
    var p4plistData = $.extend(true, {}, data || {}),
        sliderP4PData = $.extend(true, {}, data || {});
    /***
     * 修改m站列表数据的
     * @type {Array.<*>}
     */
    p4plistData.searchResultInfo = highQualityArr.slice(0);
    sliderP4PData.searchResultInfo = recommendedArr.slice(0,5);
    var p4pListProduct = new p4pBusinessLogic({

        /***
         * 外层包裹元素
         */
        wrap: $('[data-name="p4pList"]'),
        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [referrer 曝光、点击来源参数]
         * @type {Number}
         */
        referrer: _referrer,
        /**
         * [cache 数据缓存]
         * @type {Object}
         */
        cache: p4plistData,
        /**
         * [keyword 搜索关键词]
         * @type {String}
         */
        keyword: _keyWord,
        /****
         * [template 模板HTML]
         */
        template: _template.listP4pTempArr.join(""),
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
            var nodeName=element.attr('node-name'),
                href = element.attr('href');
            if(nodeName=="p4pNode"){
                return false
            }
            if ($.trim(href).length !== 0) {
                window.location.href = href;
            }
        }

    });
    /****
     * 开始渲染事件
     */
    p4pListProduct.addEventListener('onStartRender', function (_template, _template_params) {
        var _this = this,
            _tempRegExp = new RegExp(_this.keyword, 'img'),
            _prolist = _template_params.products;

        /**
         * 修改数据
         */
        $.each(_prolist, function (index, product) {
            /***
             * 标题关键词加红
             * @type {*}
             */
            product.searchTitle = product.searchResultfoTitle.replace(_tempRegExp, '<em>' + _this.keyword + '</em>');
        });

    });
    /****
     * 监听渲染dom结束事件
     */
    p4pListProduct.addEventListener('onEndRender', function (targetElement) {
        /****
         * 发送监测点
         */
        targetElement.on('click', 'a', function () {
            try {
                window.sendUserlogsElement&&sendUserlogsElement('UserBehavior_p4p_m_juhe_page_next');
            } catch (e) {
                console.error(e);
            }
        });

    });
    /**
     * [监听创建曝光参数事件，向曝光参数中对象中添加新字段]
     * @param  {Object} _paramsObject [参数对象]
     * @param  {Object} _data         [商品参数对象]
     */
    p4pListProduct.addEventListener('onBuildExpoData', function (_paramsObject, _data) {
        var _this = this,

            /**
             * [_querystring 由后台解析的查询参数对象]
             * @type {Object}
             */
            _querystring = window.requesParamsVo || {};

        /**
         * [_params 设置曝光数据]
         * @type {Array}
         */
        _paramsObject.params = [
            encodeURIComponent(_this.keyword),
            _data.searchResultfoId,
            (_data.searchResultfoPlanId || ''),
            (_data.searchResultfoUnitId || ''),
            _data.searchResultfoUserId,
            _data.searchResultfoProviderid,
            _this.referrer,
            _data.searchResultfoKypromote,
            ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
            encodeURIComponent(_querystring.keywordextend) || '0',
            _querystring.match || '0',
            _querystring.confr || '0'
        ];
    });

    /**
     * 派发构建点击计费参数结束事件,增加计费参数
     */
    p4pListProduct.addEventListener('onAfterBuildClickParams',function (_params,_data,_index) {
        /**
         * [_querystring 由后台解析的查询参数对象]
         * @type {Object}
         */
        var _querystring = window.requesParamsVo || {};

        /*** 匹配规则**/
        _params.match=_querystring.match;
        /*** 扩词 **/
        _params.keywordextend=encodeURIComponent(_querystring.keywordextend);
        /*** 点击平台 **/
        _params.confr=_querystring.confr;
    });
    p4pListProduct.init();


    /****
     * 渲染左右滑动部分p4p数据
     * @type {[*]}
     */

    var p4pSilderProduct = new p4pBusinessLogic({

        /***
         * 外层包裹元素
         */
        wrap: $('[data-name="p4pSliderBox"]'),
        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [referrer 曝光、点击来源参数]
         * @type {Number}
         */
        referrer: _referrer,
        /**
         * [cache 数据缓存]
         * @type {Object}
         */
        cache: sliderP4PData,
        /**
         * [keyword 搜索关键词]
         * @type {String}
         */
        keyword: _keyWord,
        /****
         * [template 模板HTML]
         */
        template: _template.sliderP4pTempArr.join(""),
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
            var nodeName=element.attr('node-name'),
                href = element.attr('href');
            if(nodeName=="p4pNode"){
                return false
            }
            if ($.trim(href).length !== 0) {
                window.location.href = href;
            }
        }

    });
    /****
     * 开始渲染事件
     */
    p4pSilderProduct.addEventListener('onStartRender', function (_template, _template_params) {
        var _this = this,
            _tempRegExp = new RegExp(_this.keyword, 'img'),
            _prolist = _template_params.products;

        /**
         * 修改数据
         */
        $.each(_prolist, function (index, product) {
            /***
             * 标题关键词加红
             * @type {*}
             */
            product.searchTitle = product.searchResultfoTitle.replace(_tempRegExp, '<em>' + _this.keyword + '</em>');
        });

    });
    /****
     * 监听渲染dom结束事件
     */
    p4pSilderProduct.addEventListener('onEndRender', function (targetElement) {
        var _this=this;
        /****
         * 发送监测点
         */
        targetElement.on('click', 'a', function () {
            try {

               window.sendUserlogsElement&&sendUserlogsElement('UserBehavior_p4p_m_juhe_page_next');
            } catch (e) {
                console.error(e);
            }
        });

        /**
         * [_initSwipeEntity 初始化元素滚动插件]
         */
        var  _initSwipeEntity = function(elementEntity) {


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
                     * 将当前帧数发送到用户行为分析
                     */
                    window.sendUserlogsElement && window.sendUserlogsElement('UserBehavior_p4p_m_search_Slide_' + _index);

                    /**
                     * 发送当前展示产品的曝光数据
                     */
                    _this.cache.prolist[_index] && _this.sendExpoData([_this.cache.prolist[_index]]);

                    //渲染当前页效果样式
                    elementEntity.find(".tabTt span:eq(" + _index + ")").addClass('cur');
                    elementEntity.find(".tabTt span:eq(" + _index + ")").siblings().removeClass('cur');
                }
            });
        };

        /**
         * 多个产品时，需要初始化滚动插件
         */
        if (_this.cache.prolist.length > 1) {

            /**
             * 初始化元素滚动插件
             */
            _initSwipeEntity(targetElement);
        }

    });

    /**
     * [监听创建曝光参数事件，向曝光参数中对象中添加新字段]
     * @param  {Object} _paramsObject [参数对象]
     * @param  {Object} _data         [商品参数对象]
     */
    p4pSilderProduct.addEventListener('onBuildExpoData', function (_paramsObject, _data) {
        var _this = this,

            /**
             * [_querystring 由后台解析的查询参数对象]
             * @type {Object}
             */
            _querystring = window.requesParamsVo || {};

        /**
         * [_params 设置曝光数据]
         * @type {Array}
         */
        _paramsObject.params = [
            encodeURIComponent(_this.keyword),
            _data.searchResultfoId,
            (_data.searchResultfoPlanId || ''),
            (_data.searchResultfoUnitId || ''),
            _data.searchResultfoUserId,
            _data.searchResultfoProviderid,
            _this.referrer,
            _data.searchResultfoKypromote,
            ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
            encodeURIComponent(_querystring.keywordextend) || '0',
            _querystring.match || '0',
            _querystring.confr || '0'
        ];
    });

    /**
     * 派发构建点击计费参数结束事件,增加计费参数
     */
    p4pSilderProduct.addEventListener('onAfterBuildClickParams',function (_params,_data,_index) {
        /**
         * [_querystring 由后台解析的查询参数对象]
         * @type {Object}
         */
        var _querystring = window.requesParamsVo || {};

        /*** 匹配规则**/
        _params.match=_querystring.match;
        /*** 扩词 **/
        _params.keywordextend=encodeURIComponent(_querystring.keywordextend);
        /*** 点击平台 **/
        _params.confr=_querystring.confr;
    });

    p4pSilderProduct.init();
});
