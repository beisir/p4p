/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [监听DOMContentLoaded事件，初始化P4P业务逻辑对象]
 */
$(function () {

    /**
     * [pageIndexElement 当前页码]
     * @type {[type]}
     */
    var pageIndexElement = $('#keywordPageNum');

    /**
     * [若不存在页码元素，则不执行p4p业务]
     */
    if (!(pageIndexElement.length > 0)) {
        return;
    }
    /**
     * [htmlTemplate p4p模板集合]
     * @type {Object}
     */
    var htmlTemplate = {

            /**
             * [single 单个商品模板]
             * @return {String} [模板HTML]
             */
            single: function () {
                var htmlTemplateArray = [
                    '{{each products as product i}}',
                    '<li class="sty1">',
                    '<div class="ListImgBox">',
                    '<a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">',
                    '<img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}">',
                    '</a>',
                    '</div>',
                    '<div class="ImgBot">',
                    '<p class="til">',
                    '<a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.corKeyword}}">{{product.corKeyword}}</a>',
                    '</p>',
                    '<p class="comp"><a href="//m.hc360.com/b2b/{{product.searchResultfoUserName}}/" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a></p>',
                    '<div class="icoBox">',
                    '<dl>',
                    '<dd>',
                    '<em class="ico2"></em>',
                    '<em class="ico4"></em>',
                    '</dd>',
                    '</dl>',
                    '</div>',
                    '<div class="priBox">￥{{product.searchResultfoUnitPrice}} <span>/ {{product.searchResultfoMeasureUnit}}</span>',
                    '</div>',
                    '<div class="qtBox">',
                    '<a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" rel="nofollow" target="_blank" onclick="sendUserlogsElement(\'UserBehavior_p4p_m_search_xunjia\')">询价</a>',
                    '</div>',
                    '</div>',
                    '</li>',
                    '{{/each}}'

                ];
                return htmlTemplateArray.join('');
            }(),

            /**
             * [multiple 多个商品模板]
             * @return {String} [模板HTML]
             */
            multiple: function () {
                var htmlTemplateArray = [
                    '{{each products as product i}}',
                    '<li class="sty2">',
                    '<div class="listImg">',
                    '<a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html"><img src="{{product.searchResultfoImageBig}}" alt=""></a>',
                    '</div>',
                    '<dl>',
                    '<dt><a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.corKeyword}}">{{product.corKeyword}}</a></dt>',
                    '<dd><a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" onclick="sendUserlogsElement(\'UserBehavior_p4p_m_search_xunjia\')">询价</a></dd>',
                    '</dl>',
                    '</li>',
                    '{{/each}}'
                ];
                return htmlTemplateArray.join('');
            }()

        },
        /****
         * 关键词
         * @type {*}
         */
        keyWord = $("#keywordValue").val() || '',

        /****
         * 当前页数
         */
        pageIndex = pageIndexElement.val();

    /****
     * 获取核心词接口
     */
    function getCoreWord(bcIdStr) {

        /****
         *  重新拽一个p4p接口，参数是当前页面p4p的bcid以逗号拼接的字符串，返回当前p4p的商品的关键词和第二张商品图片
         */
        return $.ajax({
            url: '//p4pdetail.hc360.com/p4pdetail/common/get/businImage.html',
            method: 'get',
            async: false,
            data: {
                businId: bcIdStr.join(',')
            },
            dataType: 'jsonp',
            jsonp: 'callback'
        });
    }

    /***
     * P4P数据延迟对象
     */
    var deferr = (function () {
        return $.ajax({
            url: '//s.hc360.com/getmmtlast.cgi',
            data: {
                source: 5,
                w: keyWord,
                mc: 'seller',
                sys: 'ls',
                p4p: '1'
            },
            dataType: 'jsonp',
            jsonp: 'jsoncallback',
            timeout: 3000
        })
    })();

    $.when(deferr).done(function (data) {


        var  /***
             * 单个数据的html
             * @type {string}
             * @private
             */
            _template_Horizontally_single = '',

            /****
             * 第几个区域插入单个元素
             * @type {{single, multiple}}
             */
            single_horizontally_index,

            /****
             * 横排P4P数据
             */
            horizontalData = $.extend(true, {}, data),

            /***
             * [横排 当前页展示P4P索引开始]
             * @type {number}
             */

            horizontalIndex = (pageIndex - 1) * 9,

            /**
             * [横排 当前页展示P4P索引结束]
             * @type {Number}
             */
            horizontalLimit = pageIndex * 9,

            /****
             * 横排当前页面的P4P数据
             * @type {*}
             */
            horizontalP4PProduct = horizontalData.searchResultInfo.slice(horizontalIndex, horizontalLimit);

        /**
         * [p4pHorizontallyEntity 实例化横排P4P基础业务逻辑对象实例]
         * @type {p4pBusinessLogic}
         */
        var p4pHorizontallyEntity = new p4pBusinessLogic({
            params_p4p:{ sys: 'msite',bus:'p4p' },
            /**
             * [keyword 关键字]
             * @type {Object}
             */
            keyword: keyWord,

            /**
             * [referrer 来源]
             * @type {Number}
             */
            referrer: 5,

            /**
             * [clickableElementSelector 点击计费元素选择器]
             * @type {String}
             */
            clickableElementSelector: 'a',

            /**
             * [wrap 广告位包裹元素]
             * @type {Object}
             */
            wrap: $('.fListBox2'),

            /**
             * [targetRenderCallback 广告位元素渲染到页面的回调函数]
             * @param  {Object} targetHTML [广告位元素]
             */
            targetRenderCallback: function (targetHTML) {
                var targetDom = $(targetHTML),
                    p4pWrap = this.wrap.find('.p4pNewBox[data-name="horizontalP4P"]');
                /***
                 * 如果只有一个数据，直接插入模板
                 */
                if (this.cache.prolist.length == 1) {
                    return targetDom.appendTo(p4pWrap.eq(0).show().find('ul'));
                }

                /****
                 * 遍历p4pwrap对象，每个对象顺序插入三条对应的p4p数据，一页最多显示9条
                 */
                $.each(p4pWrap, function (index, val) {
                    if ((!single_horizontally_index) || (single_horizontally_index > index)) {
                        var p4pHtmlArr=targetDom.slice(index * 3, (index + 1) * 3);
                        if(p4pHtmlArr.length>0){
                            $(val).show().find('ul').html(p4pHtmlArr);
                        }
                    }
                    return;
                });

                return targetDom;
            },

            /**
             * [preventDefaultLinkRedirect 阻止点击计费元素默认行为，以免在未完成计费前页面跳转导致计费失败]
             * @type {Boolean}
             */
            preventDefaultLinkRedirect: true,

            /***
             * 默认使用一排两个模板样式
             */
            template: htmlTemplate.multiple,

            /**
             * [preventDefaultLinkRedirectCallBack 取消被点击链接的默认行为后，如果跳转的回调函数，在 preventDefaultLinkRedirect 为 true 的时候起作用]
             * @param  {Object} element [被点击元素]
             */
            preventDefaultLinkRedirectCallback: function (element) {
                var href = element.attr('href');
                if ($.trim(href).length !== 0) {
                    window.location.href = href;
                }
            }
        });

        /**
         * [监听数据就绪事件]
         */
        p4pHorizontallyEntity.addEventListener('onDataReady', function (data) {
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

            /****
             * 如果当前数组只有一个数据，用单个模板对象
             */
            if (_prolist.length == 1 || _prolist.length == 2) {
                _this.template = htmlTemplate.single;
            } else {
                if (_prolist.length % 3 == 1) {
                    /**
                     * 第几排插入单个模板
                     * @type {number}
                     */
                    single_horizontally_index = Math.floor(_prolist.length / 3);
                    /***
                     * 如果当前页面P4P数据是奇数，则截取偶数部分数据渲染一行两个的模板数据
                     */
                    _data.searchResultInfo = _prolist.slice(0, _prolist.length - 1);
                    /****
                     * 如果存在奇数，1个数据就直接渲染单个模板样式，多个数据，先渲染偶数模板样式，剩下一个单个模板创建dom结构返回单个模板dom对象
                     */
                    _template_Horizontally_single = _this.templateEngine.render(htmlTemplate.single)({
                        products: _prolist.slice(_prolist.length - 1)
                    })
                }else if(_prolist.length % 3 == 2){

                    /**
                     * 第几排插入单个模板
                     * @type {number}
                     */
                    single_horizontally_index = Math.floor(_prolist.length / 3);
                    /***
                     * 如果当前页面P4P数据是奇数，则截取偶数部分数据渲染一行两个的模板数据
                     */
                    _data.searchResultInfo = _prolist.slice(0, _prolist.length - 1);
                    /****
                     * 如果存在奇数，1个数据就直接渲染单个模板样式，多个数据，先渲染偶数模板样式，剩下一个单个模板创建dom结构返回单个模板dom对象
                     */
                    _template_Horizontally_single = _this.templateEngine.render(htmlTemplate.single)({
                        products: _prolist.slice(_prolist.length - 2)
                    })
                }
            }

        });
        /**
         * [监听渲染结束事件]
         */
        p4pHorizontallyEntity.addEventListener('onEndRender', function (targetElement) {
            var _this = this;

            /****
             * 如果存单个模板索引行，插入到页面上，更新target
             */
            if (single_horizontally_index > 0 && _template_Horizontally_single.length > 0) {

                var p4pWrapBox=_this.wrap.find('.p4pNewBox[data-name="horizontalP4P"]'),

                    P4PLiWrap=p4pWrapBox.eq(single_horizontally_index);

                    _targetElement_horizontal = $(_template_Horizontally_single).appendTo(P4PLiWrap.find('ul'));
                /***
                 * 更改显示状态
                 */
                P4PLiWrap.show();
                /**
                 * 更新 target 属性，使其同时包含横排、竖排DOM元素。target 元素是最后绑定事件的元素，若希望新创建的DOM元素也具备点击计费的功能就需要在这个属性中包含新创建的DOM元素
                 */
                _this.target.push(_targetElement_horizontal[0]);
            }

            /**
             * [绑定监测点点击事件]
             */
            targetElement.on("click", 'a', function () {
                try {
                    window.sendUserlogsElement && sendUserlogsElement('UserBehavior_m_searchsupply_inquiry');
                } catch (ex) {
                }
            });

        });

        /**
         *  横排P4P业务每一页最多展示8个p4p商品数据,最多展示3页
         */
        if (pageIndex <= 3) {
            /***
             * 如果当前页面没有P4P产品直接返回
             */
            if (horizontalP4PProduct.length > 0) {
                /****
                 * 横排当前页面的P4P数据的bcid
                 */
                var horizontalbcIdStr = $.map(horizontalP4PProduct, function (item) {
                        return item.searchResultfoId
                    }),
                    /****
                     * 核心词延迟对象
                     */
                    horizontallyBcidDeferre = getCoreWord(horizontalbcIdStr);


                /***
                 * 延迟对象解决,在P4P数据列表里面添加核心词字段
                 */
                $.when(horizontallyBcidDeferre).done(function (data) {
                    $.each(data, function (index, val) {
                        var bcid = val.bcid,
                            corKeyword = val.coreKeyword;
                        $.each(horizontalP4PProduct, function (index, item) {
                            if (item.searchResultfoId == bcid) {
                                item.corKeyword = corKeyword ? corKeyword : keyWord;
                                return;
                            }

                        })
                    });

                    /****
                     * 更新P4P数据列表
                     * @type {*}
                     */
                    horizontalData.searchResultInfo = horizontalP4PProduct;
                    p4pHorizontallyEntity.cache = horizontalData;

                    /****
                     * 初始化P4P实例
                     */
                    p4pHorizontallyEntity.init();
                });

            }
        }

        var /****
             * 在第几个区域插入竖排单个模板
             */
            single_vertical_index,
            /****
             * 竖排的单个模板的html
             */
            _template_vertical_single="",

            /****
             * 当前页竖排的P4P数据
             */
            verticalData = $.extend(true, {}, data),

            /***
             * [竖排 当前页展示P4P索引开始]
             * @type {number}
             */

            verticalIndex = (pageIndex - 1) * 4,


            /**
             * [竖排 当前页展示P4P索引结束]
             * @type {Number}
             */
            verticalLimit = pageIndex * 4,


            /****
             * 竖排当前页面的P4P数据
             * @type {*}
             */
            verticalP4PProduct = verticalData.searchResultInfo.slice(verticalIndex, verticalLimit);
        /**
         * [p4pHorizontallyEntity 实例化竖排P4P基础业务逻辑对象实例]
         * @type {p4pBusinessLogic}
         */
        var p4pVerticalEntity = new p4pBusinessLogic({
            params_p4p:{ sys: 'msite',bus:'p4p' },
            /**
             * [keyword 关键字]
             * @type {Object}
             */
            keyword: keyWord,

            /**
             * [referrer 来源]
             * @type {Number}
             */
            referrer: 5,

            /**
             * [clickableElementSelector 点击计费元素选择器]
             * @type {String}
             */
            clickableElementSelector: 'a',

            /**
             * [wrap 广告位包裹元素]
             * @type {Object}
             */
            wrap: $('.fListBox'),

            /***
             * p4p数据
             */
            cache: verticalData,

            /**
             * [targetRenderCallback 广告位元素渲染到页面的回调函数]
             * @param  {Object} targetHTML [广告位元素]
             */
            targetRenderCallback: function (targetHTML) {
                var targetDom = $(targetHTML),
                    p4pWrap = this.wrap.find('.p4pNewBox[data-name="verticalP4P"]');
                /***
                 * 如果只有一个数据，直接插入模板
                 */
                if (this.cache.prolist.length == 1) {
                    return targetDom.appendTo(p4pWrap.eq(0).show().find('ul'));
                }

                /****
                 * 遍历p4pwrap对象，每个对象顺序插入两条对应的p4p数据，一页最多显示8条
                 */
                $.each(p4pWrap, function (index, val) {
                    if ((!single_vertical_index) || (single_vertical_index > index)) {
                        var p4pHtmlArr=targetDom.slice(index * 3, (index + 1) * 3);
                        if(p4pHtmlArr.length>0){
                            $(val).show().find('ul').html(p4pHtmlArr);
                        }
                    }
                    return;
                });

                return targetDom;
            },

            /**
             * [preventDefaultLinkRedirect 阻止点击计费元素默认行为，以免在未完成计费前页面跳转导致计费失败]
             * @type {Boolean}
             */
            preventDefaultLinkRedirect: true,

            /***
             * 默认使用一排两个模板样式
             */
            template: htmlTemplate.multiple,

            /**
             * [preventDefaultLinkRedirectCallBack 取消被点击链接的默认行为后，如果跳转的回调函数，在 preventDefaultLinkRedirect 为 true 的时候起作用]
             * @param  {Object} element [被点击元素]
             */
            preventDefaultLinkRedirectCallback: function (element) {
                var href = element.attr('href');
                if ($.trim(href).length !== 0) {
                    window.location.href = href;
                }
            }
        });

        /**
         * [监听数据就绪事件]
         */
        p4pVerticalEntity.addEventListener('onDataReady', function (data) {
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

            /****
             * 如果当前数组只有一个数据，用单个模板对象
             */
            if (_prolist.length == 1) {
                _this.template = htmlTemplate.single;
            } else {
                if (_prolist.length % 2 == 1) {
                    /**
                     * 第几排插入单个模板
                     * @type {number}
                     */
                    single_vertical_index = Math.floor(_prolist.length / 2);
                    /***
                     * 如果当前页面P4P数据是奇数，则截取偶数部分数据渲染一行两个的模板数据
                     */
                    _data.searchResultInfo = _prolist.slice(0, _prolist.length - 1);

                    /****
                     * 如果存在奇数，1个数据就直接渲染单个模板样式，多个数据，先渲染偶数模板样式，剩下一个单个模板创建dom结构返回单个模板dom对象
                     */
                    _template_vertical_single = _this.templateEngine.render(htmlTemplate.single)({
                        products:_prolist.slice(_prolist.length - 1)
                    });
                }
            }

        });
        /**
         * [监听渲染结束事件]
         */
        p4pVerticalEntity.addEventListener('onEndRender', function (targetElement) {
            var _this = this;


            /****
             * 如果存单个模板索引行，插入到页面上，更新target
             */
            if (single_vertical_index > 0 && _template_vertical_single.length > 0) {

                var p4pWrapBox=_this.wrap.find('.p4pNewBox[data-name="verticalP4P"]'),

                    P4PLiWrap=p4pWrapBox.eq(single_vertical_index),

                    _targetElement_horizontal = $(_template_vertical_single).appendTo(P4PLiWrap.find('ul'));
                /***
                 * 更改显示状态
                 */
                P4PLiWrap.show();
                /**
                 * 更新 target 属性，使其同时包含横排、竖排DOM元素。target 元素是最后绑定事件的元素，若希望新创建的DOM元素也具备点击计费的功能就需要在这个属性中包含新创建的DOM元素
                 */
                _this.target.push(_targetElement_horizontal[0]);
            }

            /**
             * [绑定监测点点击事件]
             */
            targetElement.on("click", 'a', function () {
                try {
                    window.sendUserlogsElement && sendUserlogsElement('UserBehavior_m_searchsupply_inquiry');
                } catch (ex) {
                }
            });

        });

        /**
         *  横排P4P业务每一页最多展示8个p4p商品数据,最多展示3页
         */
        if (pageIndex <= 5) {
            /***
             * 如果当前页面没有P4P产品直接返回
             */
            if (verticalP4PProduct.length > 0) {
                /****
                 * 横排当前页面的P4P数据的bcid
                 */
                var verticalbcIdStr = $.map(verticalP4PProduct, function (item) {
                        return item.searchResultfoId
                    }),
                    /****
                     * 核心词延迟对象
                     */
                    verticalBcidDeferre = getCoreWord(verticalbcIdStr);


                /***
                 * 延迟对象解决，在P4P数据列表添加核心词字段，如果没有核心词用关键词即用户搜索词
                 */
                $.when(verticalBcidDeferre).done(function (data) {
                    $.each(data, function (index, val) {
                        var bcid = val.bcid,
                            corKeyword = val.coreKeyword;
                        $.each(verticalP4PProduct, function (index, item) {
                            if (item.searchResultfoId == bcid) {
                                item.corKeyword = corKeyword ? corKeyword : keyWord;
                                return;
                            }

                        })
                    });

                    /***
                     * 更新p4p数据
                     * @type {*}
                     */
                    verticalData.searchResultInfo = verticalP4PProduct;
                    p4pVerticalEntity.cache = verticalData;

                    /***
                     * 初始化竖排P4P实例
                     */
                    p4pVerticalEntity.init();
                });
            }
        }

    });

});