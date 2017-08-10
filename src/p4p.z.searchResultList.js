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
     * [showProductDetail 搜索结果页商机鼠标悬浮显示商机鼠标悬浮框信息]
     * @param  {Object}   element  [鼠标悬浮元素]
     * @param  {Object}   data     [鼠标悬浮元素数据对象]
     * @param  {Function} callback [渲染回调函数]
     */
     searchProDel= require('./p4p.search.showProductDetail');

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
    var containerWidth = option.container.width(),
        itemWidth = item.width() + parseInt(item.css('margin-left'), 10) + parseInt(item.css('margin-right'), 10),
        perPageCount = Math.floor(containerWidth / itemWidth),
        totalPageCount = Math.ceil((totalItemsCount / perPageCount) - 1),
        currentPageIndex = 0;

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
/****
 * 创建p4p实例
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
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
    cache: window.p4pbclist || {},
    /**
     * [referrer 曝光、点击来源参数]
     * @type {Number}
     */
    referrer: 30,
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
            _proList = (window.p4pbclist || {}).searchResultInfo;
        if(_proList){
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

/****
 * 监听渲染dom结束事件
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    var _this = this;
    /****
     * 发送监测点
     */
    targetElement.on('click', 'a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_zsearch');
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
            _proList =_this.cache.prolist;
        if(_proList){
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
 * 初始化p4p
 */
p4pBusinessLogicEntity.init();


$(function () {
    /**
     * [加载顶部工具条]
     */
    HC.HUB.addScript('http://style.org.hc360.com/js/build/source/widgets/flowconfig/hc.flowconfig.min.js', function () {
        HC.W.load('topnav', function () {
            var topNavList = $('.webTopNav')[0];
            topnav.init(false);
            $('#wrapInner').append($('.webTopNav'));
            topNavList.style.top = '0';
            topNavList.style.position = 'static';
        });
    });
    /***
     * 初始化热门推荐左右滚动
     */
    slider({
        container: $('.picBoxBot'),
        leftBtn: $('.left-i'),
        rightBtn: $('.right-i')
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
     * [绑定元素鼠标悬浮非p4p事件，显示商品详细信息]
     */
    $('.wrap-grid').on('mouseover', 'li div[data-name="picArea"]', function (event) {
        var str='',
            li_data = {},
            li = $(event.currentTarget).closest('li'),
            _index=li.index()-$('.wrap-grid').find('li[data-p4p=true]').length+1, //当前非p4p的索引值
            _bcid = li.attr('data-businid'),
            _proList =(window.searchResultList||{}).searchResultInfo;
        if(li.attr('data-p4p')){
            return;
        }
        if(_proList){
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
        if(li_data.searchResultfoZy){
            str+=li_data.searchResultfoZy+":"
        }
        /***
         * 十强勋章
         */
        if(li_data.searchResultfoTenMedal ){
            str+='1'
        }else {
            str+='0'
        }
        searchProDel.companyinfo($(this), li_data.searchResultfoUserName,_index,window.pageIndex,_bcid,str);
    });


    /**
     * [callback 渲染分页按钮]
     */
    HC.HUB.addScript('http://style.org.hc360.com/js/build/source/widgets/$.Pagination.min.js', function () {
        var pageSize = Number(window.pageSize) || 1,
            pageIndex = (Number(window.pageIndex) || 1) - 1,
            recordCount = Number(window.recordCount) || 1,
            keyword = window.keyword || "";

        $('.s-mod-page').pagination(recordCount, {
            items_per_page: pageSize,  //每页显示的条目数
            num_display_entries: 4, //连续分页主体部分显示的分页条目数
            current_page: pageIndex, //当前选中的页面
            num_edge_entries: 2, //两侧显示的首尾分页的条目数
            load_first_page: false,
            link_to: "javascript:;", //分页的链接
            prev_text: "上一页",
            next_text: "下一页",
            ellipse_text: "...",  // 省略的页数用什么文字表示
            prev_show_always: true,  //是否显示“前一页”分页按钮
            next_show_always: true,
            callback: function (pageindex) {
                var url = ' http://z.hc360.com/p4psearch/search.html?key=';
                url += keyword + '&page=' + (pageindex+1) + '&p4psize=' + window.p4pSize  + '&recordCount=' + recordCount;
                window.location.href = url;
            }
        });
    });


});