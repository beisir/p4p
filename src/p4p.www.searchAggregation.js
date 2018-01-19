/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base'),
    /****
     * 引入模板引擎
     */
    templateEngine = require('template'),
    /**
     * [showProductDetail  导入搜索结果页商机鼠标悬浮显示商机鼠标悬浮框信息]
     * @param  {Object}   element  [鼠标悬浮元素]
     * @param  {Object}   data     [鼠标悬浮元素数据对象]
     * @param  {Function} callback [渲染回调函数]
     */
    searchProDel = require('./p4p.search.showProductDetail'),

    /****
     * 后端初始化的p4p数据集合
     * @type {{}}
     */
    p4pProduct = (window.p4pbclist || {}),

    /***
     * 截取第一个p4p数据
     * @type {T}
     */
    firstSearchResult = (p4pProduct.searchResultInfo || []).shift();

/**
 * [注册全局方法，用于发送 webtrends 用户行为分析日志]
 */
window.hcclick = function (param) {
    if (document.images) {
        var rannumber = Math.round(Math.random() * 10000);
        (new Image()).src = "//log.info.hc360.com/click.htm" + param + "&rannumber=" + rannumber;
    }
    return true;
};

/****
 * 底部左右滚动
 */
window.slider = function (option) {
    var LEFT = -1,
        RIGHT = 1,
        itemBox = option.container.find('ul'),
        totalItemsCount = itemBox.find('li').length,
        item = itemBox.find('li:first');
    /****
     * 小于一屏，隐藏左右按钮
     */
    if (option.limit && totalItemsCount == option.limit) {
        option.leftBtn.hide();
        option.rightBtn.hide();
    }
    var containerWidth = option.container.width(),//外层div总宽度
        itemWidth = item.width() + parseInt(item.css('margin-left'), 10) + parseInt(item.css('margin-right'), 10), //每个li的宽度
        perPageCount = Math.floor(containerWidth / itemWidth), //外层div可以放多少个li
        totalPageCount = Math.ceil((totalItemsCount / perPageCount) - 1), //总共可以滚动几屏
        currentPageIndex = 0;  //当前在第几屏幕

    function move(direction) {
        var limitedPageIndex;
        if (direction === RIGHT) {
            limitedPageIndex = totalPageCount;
        }
        if (direction === LEFT) {
            limitedPageIndex = 0;
        }

        if (currentPageIndex === limitedPageIndex) {
            return;
        }
        currentPageIndex += direction;
        itemBox.animate({'margin-left': -containerWidth * currentPageIndex}, 200);
    }

    option.leftBtn.click(function () {
        move(LEFT);
    });

    option.rightBtn.click(function () {
        move(RIGHT);
    })
};

    /***
     *  获取url的的查询参数clickreferer，根据查询参数来初始化优质推荐的referrer  56  57
     */
 var _params= (p4pBusinessLogic.prototype.parseURL(document.URL)||{}).params,
    clickreferer=(_params||{}).clickreferer,
    _referrer;
/***
 * 根据url的参数初始化referrer值
 */
switch (clickreferer){
      case '20':
        _referrer =21;
        break;
      case '36':
        _referrer =39;
        break;
      case '53':
        _referrer =55;
        break;
      case '42':
       _referrer=58;
       break;
    }
/****
 * 创建p4p实例
 */
var  p4pBusinessLogicEntity = new p4pBusinessLogic({
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
        cache: p4pProduct,
        /**
         * [referrer 曝光、点击来源参数]
         * @type {Number}
         */
        referrer: _referrer,
        /**
         * [keyword 搜索关键词]
         * @type {String}
         */
        keyword: (window.p4pkeyword || ""),
        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} elemnet [被点击元素]
         * @return {Number}         [数据缓存索引值]
         */
        getClickElementCacheIndexCallback: function (element) {
            var _index,
                _bcid = element.closest('li').attr('data-businid'),
                _proList = p4pProduct.searchResultInfo;
            if (_proList) {
                $.each(_proList, function (index, val) {
                    if (val.searchResultfoId == _bcid) {
                        _index = index;
                        return false;
                    }
                });
            }
            return _index;
        }
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
        encodeURIComponent(_querystring.kid) || '0',
        _querystring.match || '0',
        _querystring.confr || '0'
    ];
});

/**
 * [监听创建点击参数开始事件，向点击参数对象中添加新字段]
 * @param  {Object} _params [参数对象]
 * @param  {Object} _data   [商品参数对象]
 */
p4pBusinessLogicEntity.addEventListener('onStartBuildClickParams', function (_params, _data) {
    /**
     * [_querystring 由后台解析的查询参数对象]
     * @type {Object}
     */
    var _querystring = window.requesParamsVo || {};

    /**
     * [keywordextend 以下为当前项目点击扩展参数]
     */
    _params.keywordextend = encodeURIComponent(_querystring.kid) || '0';
    _params.match = _querystring.match || '0';
    _params.confr = _querystring.confr || '0';
});
/****
 * 监听渲染dom结束事件
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    var _this = this;
    /****
     * 发送监测点
     */
    targetElement.on('click', '.nImgBox', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_juhe_page_img');
        } catch (e) {
            console.error(e);
        }
    });
    targetElement.on('click', '.newName a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_juhe_page_title');
        } catch (e) {
            console.error(e);
        }
    });
    targetElement.on('click', '.newCname a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_juhe_page_comp');
        } catch (e) {
            console.error(e);
        }
    });
    targetElement.on('click', '.newImgAlert a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_juhe_page_dianpu');
        } catch (e) {
            console.error(e);
        }
    });
    targetElement.on('click', '.main_pro a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_juhe_page_product');
        } catch (e) {
            console.error(e);
        }
    });

    /**
     * [绑定元素鼠标悬浮事件，显示商品详细信息]
     */
    $('.wrap-grid').on('mouseover', 'li[data-p4p=true] div[data-name="picArea"]', function (event) {
        var li_data = {},
            li = $(event.currentTarget).closest('li'),
            _bcid = li.attr('data-businid'),
            _proList = _this.cache.prolist;
        if (_proList) {
            $.each(_proList, function (index, val) {
                if (val.searchResultfoId == _bcid) {
                    li_data = val;
                    return false;
                }
            });
        }

        /****
         * 显示店铺标签和悬浮商铺信息
         */
        $(this).parent('[data-name="proItem"]').addClass("hover2");
        $(this).children(".newImgAlert").show();

        /**
         * [显示鼠标悬浮框]
         */
        searchProDel.showProductDetail(li, li_data, function (templateHTML, templateDate) {
            /**
             * [_tempHTML 获取渲染后的HTML]
             * @type {String}
             */
            var _tempHTML = templateEngine.render(templateHTML)({
                product: templateDate
            });

            /**
             * [将渲染后的HTML渲染到页面]
             * @type {String}
             */
            $(_tempHTML).appendTo(li.find('[data-name="proItem"]'));
        });
    });

});


/****
 * p4pbclist.searchResultInfo是当前页面所有p4p的集合，第一条是顶部的，其他的是优质推荐和下面滚动的
 * 如果后端初始化的p4p截取顶部一条后，大于等于1，则初始化优质推荐的p4p实例，
 */
if (p4pProduct.searchResultInfo.length >= 1) {
    p4pBusinessLogicEntity.init();
}


/****
 * 创建顶部p4p实例
 */
var  topP4pBusinessLogicEntity = new p4pBusinessLogic({

    /***
     * 外层包裹元素
     */
    wrap: $('.BoxTop'),

    /**
     * [referrer 曝光、点击来源参数]
     * @type {Number}
     */
    referrer: clickreferer || '',
    /**
     * [keyword 搜索关键词]
     * @type {String}
     */
    keyword: (window.p4pkeyword || ""),
    /**
     * [cache 数据缓存]
     * @type {Object}
     */
    cache: p4pProduct,
    /***
     *  是否自动发送曝光
     */
    autoSendExpoData: false,


});
/**
 * [监听创建曝光参数事件，向曝光参数中对象中添加新字段]
 * @param  {Object} _paramsObject [参数对象]
 * @param  {Object} _data         [商品参数对象]
 */
topP4pBusinessLogicEntity.addEventListener('onBuildExpoData', function (_paramsObject, _data) {
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
        encodeURIComponent(_querystring.kid) || '0',
        _querystring.match || '0',
        _querystring.confr || '0'
    ];
});



topP4pBusinessLogicEntity.init();


/***
 * 发送顶部第一条数据的曝光,只发曝光不处理扣费，第一条数据由后台处理扣费
 */
if (typeof firstSearchResult == "object") {
    topP4pBusinessLogicEntity.sendExpoData([firstSearchResult]);
}


$(function () {
    /**
     * [加载顶部工具条]
     */
    HC.HUB.addScript('//style.org.hc360.com/js/build/source/widgets/flowconfig/hc.flowconfig.min.js', function () {
        HC.W.load('topnav', function () {
            var topNavList = $('.webTopNav')[0];
            topnav.init(false);
            $('#wrapInner').append($('.webTopNav'));
            topNavList.style.top = '0';
            topNavList.style.position = 'static';
        });
    });

    /***
     * 渲染商品图片左右滚动
     */
    function prodocutMove(option) {
        var itemBox = option.container.find('ul'),
            itemCount = itemBox.find('li').length,
            containerWidth = option.container.width(),
            //一共有几页
            pageCount = Math.ceil(itemCount / option.limit) - 1,
            currentPage = 0;

        option.leftBtn.click(function () {
            if (currentPage == 0) {
                return
            }
            currentPage--;
            itemBox.animate({
                'margin-left': -currentPage * containerWidth
            }, 200)
        });

        option.rightBtn.click(function () {
            if (currentPage == pageCount) {
                return
            }
            currentPage++;
            itemBox.animate({
                'margin-left': -currentPage * containerWidth
            }, 200)
        });

        itemBox.find('li').mouseover(function () {
            var _src = $(this).find('img[large-src]').attr('large-src');
            $('[data-name="large-img"]').attr('src', _src);
        })

    }

    prodocutMove({
        imageElement: $('[data-name="large-img"]'),
        container: $('.tab-content-container'),
        leftBtn: $('.img-scroll-left'),
        limit: 3,
        rightBtn: $('.img-scroll-right')
    });

    /***
     * 鼠标移入商品，增加红色边框
     */
    $('[data-name="proItem"]').hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover hover2");
        $(this).find(".newImgAlert").hide();
    });


    /**
     * [绑定元素鼠标悬浮事件，显示商品详细信息]
     */
    $('.wrap-grid').on('mouseover', 'li[data-p4p=false] div[data-name="picArea"]', function (event) {
        var str = '',
            li_data = {},
            li = $(event.currentTarget).closest('li'),
            index = li.index() - $('.wrap-grid').find('li[data-p4p=true]').length + 1, //当前非p4p的索引值
            _bcid = li.attr('data-businid'),
            _proList = (window.searchResultList || {}).searchResultInfo;

        if (_proList) {
            $.each(_proList, function (index, val) {
                if (val.searchResultfoId == _bcid) {
                    li_data = val;
                    return false;
                }
            });
        }
        /****
         * 显示店铺标签和悬浮商铺信息
         */
        $(this).parent('[data-name="proItem"]').addClass("hover2");
        $(this).children(".newImgAlert").show();


        /***
         * 主营产品
         */
        if (li_data.searchResultfoZy) {
            str += li_data.searchResultfoZy + ":"
        }
        /***
         * 十强勋章
         */
        if (li_data.searchResultfoTenMedal) {
            str += '1'
        } else {
            str += '0'
        }
        searchProDel.companyinfo($(this), li_data.searchResultfoUserName, index, 1, _bcid, str);
    });

    /***
     * 初始化热门推荐左右滚动
     */
    slider({
        container: $('.picBoxBot'),
        leftBtn: $('.left-i'),
        rightBtn: $('.right-i')
    });
});
