/**
 * Created by HC360 on 2017/5/16.
 */


/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base'),

    _temp = require('template'),

    /***
     * 当前页面的p4p数据集合
     */
    _data = {},

    /***
     * html结构数组
     * @type {[*]}
     * @private
     */
    _tempHTMLArray = [
        '{{each products as product i}}',
        '<li>',
        '<a href="{{product.searchResultfoUrl}}">',
        '<div class="productImg">',
        '<img src="{{product.searchResultfoImageBig}}" />',
        '</div>',
        '<div class="productCon">',
        '<div class="productName">{{product.searchResultfoTitle}}</div>',
        '<div class="companyName">公司：{{product.searchResultfoCompany}}</div>',
        '<div class="mainProducts">',
        '<div>所在地：{{product.searchResultfoZone}}</div>',
        '<div>品牌：{{product.searchResultfoBrand}}</div>',
        '</div>',
        '</div>',
        '</a>',
        '</li>',
        '{{/each}}'
    ];

/**
 * [页面上调用了一个接口，根据接口返回的title字段，来初始化p4p，如果接口失败则不实例化p4p ]
 * @type {p4pBusinessLogic}
 */
window.deffer.done(function (data) {
    var
        /****
         * 搜索商品当前页面开始的条数索引
         * @type {{}}
         */
        searchPage = 0,
        /***
         * p4p商品在当前页面是第几屏，点击换一批，相当于切换一屏
         */
        _index = 0,
        /***
         * 一屏最多显示几条数据
         */
        _limit = 5,
        /***
         * 关键词
         * @type {string}
         * @private
         */
        _keyWord = data.p4pcoreKeyword || '',


        /***
         *  实例化P4P基础业务逻辑对象实例
         */
        p4pBusinessLogicEntity = new p4pBusinessLogic({

            /**
             * [keyword 关键字]
             * @type {Object}
             */
            keyword: _keyWord,

            /**
             * [referrer 来源]
             * @type {Number}
             */
            referrer: 38,

            /**
             * [clickableElementSelector 点击计费元素选择器]
             * @type {String}
             */
            clickableElementSelector: 'a',

            /**
             * [wrap 广告位包裹元素]
             * @type {Object}
             */
            wrap: $('.productMessage'),

            /****
             *  模板数据
             */
            template: _tempHTMLArray.join(''),

            /***
             * 默认不发送曝光
             */
            autoSendExpoData:false,

            /**
             * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
             * @param  {Object} element [被点击元素]
             * @return {Number}         [数据缓存中的索引值]
             */
            getClickElementCacheIndexCallback: function (element) {
                return element.closest('li').index();
            },
            targetRenderCallback: function (targetHTML) {
                return $(targetHTML).appendTo($(this.wrap).empty());
            },
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
                var href = element.attr('href');
                if ($.trim(href).length !== 0) {
                    window.location.href = href;
                }
            }
        });
    /***
     * 监听渲染数据开始事件
     */
    p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
        var proList = data.searchResultInfo;

        /***
         * 首次调用P4P接口
         */
        if (!data.load) {
            /***
             * 将数据缓存在_data变量里
             * @type {*}
             * @private
             */
            _data = $.extend(true, {}, {load: 1}, data);
            /***
             * 截取后的数据覆盖data对象
             * @type {*}
             */
            data.searchResultInfo = proList.splice(_index * _limit, _limit);
        }


        /***
         * 如果当前数据小于5条则用搜索补足
         */
        if (data.searchResultInfo.length < 5) {
            searchComplement(5-data.searchResultInfo.length);
        }

    });
    /***
     * 监听渲染数据结束事件
     */
    p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
        /****
         * 发送监测点
         */
        targetElement.on('click', 'a', function () {
            try {
                window.sendexposurelog&&sendexposurelog('UserBehavior_p4p_weixin_purchase');
            } catch (e) {
                console.error(e);
            }
        });
    });
    /***
     * 监听绑定事件结束事件
     */
    p4pBusinessLogicEntity.addEventListener('onEndBindEvent', function () {
        var that = this;
        /***
         * 清除expo对象，重新创建表单
         * @type {undefined}
         */
        that.expo=undefined;
        /***
         * 发送曝光
         */
        that.sendExpoData(that.cache.prolist);
    });

    /***
     * 点击换一批
     */
    $('#changeMessage').click(function () {
        var proData = $.extend(true, {}, _data),
            proList = proData.searchResultInfo || [];

        /***
         * 加载过数据,点击换一批，判断是否没有p4p商品，如果没有，直接调用搜索数据补充
         */
        if (proData && proData.load == 1) {
            _index++;
            proData.searchResultInfo = proList.splice(_index * _limit, _limit);
            if (proData.searchResultInfo.length == 0) {
                searchComplement();
                return;
            }
            p4pBusinessLogicEntity.cache = proData;
        }
        p4pBusinessLogicEntity.init();
    });
    $('#changeMessage').trigger('click');

    /****
     * 搜索数据补足
     */
    function searchComplement(_e) {
        var /** 当前页还剩下多少条数据 **/
            pageSize = _e ? _e : 5;
        /***
         * 如果缓存搜索数据，调用搜索接口
         */
        $.ajax({
            url: "//s.hc360.com/cgi-bin/getmmtlast.cgi",
            method: 'get',
            data: {
                w: _keyWord,
                sys: 'mobile',
                bus: 'hcmpcg',
                ts: 1,
                n: searchPage * 5 + 1,  //从第几条开始
                e: pageSize  //显示多少条
            },
            dataType: 'jsonp',
            jsonp: 'jsoncallback',
            success: function (data) {
                var searchInfo=data.searchResultInfo,
                    _html = _temp.render(_tempHTMLArray.join(''))({products: data.searchResultInfo});
                /***
                 * 如果没有数据，弹出提示框
                  */
                if(searchInfo.length==0){
                    if(_e==5){
                        /***
                         * 如果p4p和搜索都没有数据
                         */
                        $('.productMore').hide();
                        return;
                    }
                    window.maskOpen&& window.maskOpen('相关产品已全部推荐');
                    return false;
                }
                /***
                 * 如果调用的数据小于5条，补充数据就追加到当前div里面
                 */
                if (pageSize < 5) {
                    $('.productMessage').append(_html);
                } else {
                    $('.productMessage').html(_html);
                }
            },
            error:function () {
                window.maskOpen&& window.maskOpen('网络获取异常')
            }
        });

        /**
         * 当前页数加1
         */
        searchPage++;
    }

});

