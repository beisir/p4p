/**
 * [store 引入跨浏览器存储模块]
 * @type {Object}
 */
var store = require('store');

/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [Keyword 关键字维护对象]
 */
function Keyword() {
    var _this = this;
    $.extend(true, _this, {

        /**
         * [lastsearch 最后一次搜索关键字列表，该数组从Cookie中的 hclastsearchkeyword 获取数据，由其他业务写入，无需当前对象维护其数据]
         * @type {Array}
         */
        lastsearch: [],

        /**
         * [userclick 用户点击关键字列表，该数组从本地存储中的 homepageclickedkeyword 获取数据，由当前对象维护其数据]
         * @type {Array}
         */
        userclick: [],

        /**
         * [p4pinterface p4p接口获取的关键字列表，该数组从远程接口中获取数据，无需当前对象维护其数据]
         * @type {Array}
         */
        p4pinterface: [],

        /**
         * [userclicklimit 用户点击关键字数量上限]
         * @type {Number}
         */
        userclicklimit: 20
    });

    /**
     * 开始初始化当前对象
     */
    Keyword.prototype.init.call(_this);
}

/**
 * [prototype 关键字维护对象实例方法]
 * @type {Object}
 */
Keyword.prototype = {

    /**
     * [init 初始化关键字维护对象]
     * @return {[type]} [description]
     */
    init: function() {
        var _this = this;

        /**
         * [点击首页首屏导航中的关键字、首页楼层中的关键字时更新到用户点击关键字列表]
         */
        $(document).delegate('#H_Bside a,#category a,#newBox2 .tabConList a,#newBox3 .floorCon .fRigList a', 'click', function(event) {
            var keyword = $.trim($(this).text());
            if (keyword.length) {

                /**
                 * 添加用户点击关键字
                 */
                _this.addKeyword(keyword);
            }
        });
    },

    /**
     * [getKeywordList 初始化关键字列表]
     * @return {deferreds} [关键字列表的数据延迟对象]
     */
    getKeywordDeferreds: function() {
        var _this = this;

        /**
         * 填充最后一次搜索关键字列表
         */
        var _deferred_lastsearch = $.Deferred();
        try {
            var hclastsearchkeyword = '';
            indexsearchkeyword = (window.HC.util.cookie.get('searchWord') || '').split(',').reverse()[0],
                lastsearkeyword = window.HC.util.cookie.get('hclastsearchkeyword') || '';
            hclastsearchkeyword = indexsearchkeyword || lastsearkeyword;
            hclastsearchkeyword && _this.lastsearch.push({
                keyword: hclastsearchkeyword,
                time: +new Date()
            });
            _deferred_lastsearch.resolve(_this.lastsearch);
        } catch (ex) {
            _deferred_lastsearch.resolve(_this.lastsearch);
        }

        /**
         * 从本地存储中读取数据填充用户点击关键字列表
         */
        var _deferred_userclick = $.Deferred();
        try {
            var userclickkeyword = store.get('homepageclickedkeyword') || [];

            /**
             * [清空数据]
             */
            _this.userclick.length = 0;

            /**
             * [填充数据]
             */
            for (var i = 0; i < userclickkeyword.length; i++) {
                _this.userclick.push(userclickkeyword[i]);
            }
            _deferred_userclick.resolve(_this.userclick);
        } catch (ex) {
            _deferred_userclick.resolve(_this.userclick);
        }

        /**
         * 填充p4p接口获取的关键字列表
         */
        var _deferred_interface = $.Deferred();
        $.ajax({
                url: '//champion.hc360.com/champion/p4p/getYesterdayClickTop.html',
                dataType: 'jsonp'
            })
            .done(function(keywords) {
                var _keywords = keywords || [];

                /**
                 * [清空接口关键字列表]
                 */
                _this.p4pinterface.length = 0;

                /**
                 * [将关键字填充到接口关键字列表]
                 */
                for (var i = 0; i < _keywords.length; i++) {

                    /**
                     * [处理关键字为空的情况]
                     */
                    if (!$.trim(_keywords[i].keyword).length) {
                        continue;
                    }

                    /**
                     * [将关键字填充到接口关键字列表]
                     */
                    _this.p4pinterface.push({
                        keyword: _keywords[i].keyword,
                        time: +new Date()
                    });
                }

                /**
                 * 为了让每次显示的数据不同，打乱数组顺序
                 */
                _this.p4pinterface.sort(function() {
                    return 0.5 - Math.random();
                });

                _deferred_interface.resolve();
            })
            .fail(function() {
                _deferred_interface.resolve();
            });

        return [_deferred_lastsearch, _deferred_userclick, _deferred_interface];
    },

    /**
     * [getKeywordList 获取关键字列表]
     * @return {deferreds} [组合后的关键字列表数据延迟对象]
     */
    getKeywordList: function() {
        var _this = this,
            _keywords = [],
            _deferred = $.Deferred(),
            _deferreds = _this.getKeywordDeferreds();

        /**
         * [最后一次搜索关键字列表 用户点击关键字列表任一列表不为空的时候，修改页面相关文字内容]
         */
        $.when(_deferreds[0], _deferreds[1]).done(function() {
            if (_this.lastsearch.concat(_this.userclick).length) {
                $('#proBox .proBoxTitCon h3').text('猜你喜欢');
                $('#proBox .proBoxTitCon p').text('猜你喜欢，实时推荐最适合您的单品');
                $('.l_sidebar_wrap a[title="新人专享"]').text('猜你喜欢');
            }
        });

        /**
         * [完成关键字初始化后，进行关键字组合、排重]
         */
        $.when.apply(null, _deferreds).done(function() {

            /**
             * [_hash 用于辅助排重]
             * @type {Object}
             */
            var _hash = {},
                _arr = _this.lastsearch.concat(_this.userclick).concat(_this.p4pinterface);

            /**
             * [按照最后一次搜索关键字列表 用户点击关键字列表 p4p接口获取的关键字列表的顺序组合关键字并排重]
             */
            for (var i = 0; i < _arr.length; i++) {
                if (!_hash[_arr[i].keyword]) {
                    _hash[_arr[i].keyword] = true;
                    _keywords.push(_arr[i]);
                }
            }
        }).always(function() {

            /**
             * 任何情况下都解决延迟对象
             */
            _deferred.resolve(_keywords);
        });

        return _deferred;
    },

    /**
     * [uniqueKeywordList 将用户点击关键字列表按照时间排序并去重]
     * @return {Array} [处理后的新数组]
     */
    uniqueKeywordList: function(arr) {
        var _this = this,
            _target = [],
            _hash = {},
            _limit = _this.userclicklimit;

        /**
         * [按添加时间排序]
         */
        arr.sort(function(a, b) {
            return b.time - a.time;
        });

        /**
         * [获取去重后的数组]
         */
        for (var i = 0; i < arr.length; i++) {
            if (!_hash[arr[i].keyword]) {
                _target.push(arr[i]);
                _hash[arr[i].keyword] = true;
            }
        }

        /**
         * 删除多余项
         */
        _target.splice(_limit, arr.length);
        return _target;
    },

    /**
     * [addKeyword 添加用户点击关键字]
     */
    addKeyword: function(keyword) {
        var _this = this;

        /**
         * [keyword 将关键字添加到用户点击关键字列表]
         * @type {[type]}
         */
        _this.userclick.push({
            keyword: keyword,
            time: +new Date()
        });

        /**
         * [对用户点击关键字列表进行排序去重]
         */
        _this.userclick = _this.uniqueKeywordList(_this.userclick);

        /**
         * 将用户点击关键字列表写入本地存储
         */
        try {

            /**
             * [若用户点击关键字列表为空，则删除本地存储]
             */
            if (!_this.userclick.length) {
                store.remove('homepageclickedkeyword');
                return;
            }

            /**
             * [将用户点击关键字列表写入本地存储]
             */
            store.set('homepageclickedkeyword', _this.userclick);
        } catch (ex) {}
    }
};

/**
 * [ScrollLoading 滚动加载业务对象]
 */
function ScrollLoading(options) {
    var _this = this;
    $.extend(true, _this, {

        /**
         * [listener 事件监听缓存对象]
         * @type {Object}
         */
        listener: {},

        /**
         * [container 包裹元素]
         */
        container: null,

        /**
         * [loadingWrap 加载中动画包裹元素]
         */
        loadingWrap: null,

        /**
         * [keywords P4P关键字列表]
         * @type {Array}
         */
        keywords: [],

        /**
         * [data 已加载数据]
         * @type {Array}
         */
        data: [],

        /**
         * [dataLimit 总共数据上限]
         * @type {Number}
         */
        dataLimit: 50,

        /**
         * [dataEachTimeLimit 每一次加载数据数量上限]
         * @type {Number}
         */
        dataLimitEachTime: 20,

        /**
         * [dataEachKeywordLimit 每个关键字最多获取的数据数量]
         * @type {Number}
         */
        dataLimitEachKeyword: 5,

        /**
         * [cache 数据缓存，在获取数据数量超过每一次加载数据上限时，暂存到该容器中]
         * @type {Array}
         */
        cache: [],

        /**
         * [p4preferrer 获取P4P数据的来源标识]
         * @type {Number}
         */
        p4preferrer: 10,

        /**
         * 滚动函数命名空间
         */
        scrollNameSpace: 'infiniteScrolling',

        /**
         * [waiting 是否等待加载，以免同时加载两次数据]
         * @type {Boolean}
         */
        waiting: false,

        /**
         * [callback 每一次获取完数据的回调函数]
         * @type {Function}
         */
        callback: null
    }, options);

    /**
     * 开始初始化当前对象
     */
    // ScrollLoading.prototype.init.call(_this);
}

/**
 * [滚动加载业务对象实例方法]
 * @type {Object}
 */
ScrollLoading.prototype = {

    /**
     * [init 滚动加载对象初始化]
     */
    init: function() {
        var _this = this,
            _window = $(window);

        /**
         * [不存在P4P包裹元素，或不存在关键字]
         */
        if ((!_this.container.length) || (!_this.keywords.length)) {
            return;
        }

        /**
         * [绑定窗口滚动事件]
         */
        _window.bind('scroll.' + _this.scrollNameSpace, _this.throttle(function() {

            /**
             * [判断是否滚动到元素底部]
             */
            if (_this.hasScrolledBottom(_this.container) && (!_this.waiting)) {

                /**
                 * [若不存在关键字，或当前数据数量大于等于数据数量上限时，停止获取数据，解绑窗口滚动事件]
                 */
                if ((!_this.keywords.length) || (_this.data.length >= _this.dataLimit)) {
                    _window.unbind('.' + _this.scrollNameSpace);
                    return;
                }

                /**
                 * [waiting 暂定加载数据]
                 * @type {Boolean}
                 */
                _this.waiting = true;

                /**
                 * 显示加载中
                 */
                _this.loadingWrap.show();

                /**
                 * 获取一次数据
                 */
                _this.getData(_this.cache).done(function(data) {

                    /**
                     * 将获取到的数据填充到对象实例上
                     */
                    _this.data = _this.data.concat(data);

                    /**
                     * 派发开始发送曝光数据事件
                     */
                    _this.__dispatchEvent('onDataLoaded', data);

                }).always(function() {

                    /**
                     * [waiting 可以准备加载数据]
                     * @type {Boolean}
                     */
                    _this.waiting = false;

                    /**
                     * 隐藏加载中
                     */
                    _this.loadingWrap.hide();
                });

                /**
                 * 使用完缓存的已加载数据后，清空缓存数据
                 */
                _this.cache = [];
            }
        }, 200));

        /**
         * 初始化对象时主动触发滚动事件，防止页面打开时，已满足加载条件
         */
        _window.trigger('scroll.' + _this.scrollNameSpace);
    },

    /**
     * [getData 获取P4P数据]
     * @param  {Object} loadedData [已加载但未使用的数据集]
     */
    getData: function(loadedData, deferred) {
        var _this = this,

            /**
             * [_data 本次加载数据集]
             * @type {Object}
             */
            _data = [].concat(loadedData),

            /**
             * [_callee 获取函数引用]
             * @type {Object}
             */
            _callee = arguments.callee,

            /**
             * [_deferred 定义获取]
             * @type {[type]}
             */
            _deferred = deferred || $.Deferred();

        /**
         * 根据已加载数据数量确定此次获取数据起码需要使用的关键字
         */
        var _keywords = _this.keywords.splice(0, Math.ceil((_this.dataLimitEachTime - _data.length) / _this.dataLimitEachKeyword)),

            /**
             * [_deferreds 获取数据延迟对象数组]
             * @type {Array}
             */
            _deferreds = [];

        /**
         * [关键字列表为空，解决延迟对象]
         */
        if (_keywords.length === 0) {
            _deferred.resolve(_data);
            return;
        }

        /**
         * [创建数据延迟对象列表]
         */
        $.each(_keywords, function(index, keyword) {
            var deferred = $.Deferred();
            _this.sendHttpRequest({
                data: {
                    w: keyword.keyword
                }
            }).done(function(data) {
                deferred.resolve(data, keyword.keyword, index);
            }).fail(function() {
                deferred.resolve({}, keyword.keyword, index);
            });
            _deferreds.push(deferred);
        });

        /**
         * [按照顺序填充数据到已加载数据列表中]
         */
        for (var i = 0; i < _deferreds.length; i++) {
            _deferreds[i].done(function(data, keyword, index) {
                var _tempdata = data || {},
                    _tempdatalist = _tempdata.searchResultInfo || [];


                /**
                 * 按照每个关键字最多获取的数量数量截取数据
                 */
                _tempdatalist.splice(_this.dataLimitEachKeyword, _tempdatalist.length);

                /**
                 * [扩展商品数据字段]
                 */
                for (var j = 0; j < _tempdatalist.length; j++) {

                    /**
                     * [keyword 设置当前商品对应关键字]
                     * @type {String}
                     */
                    _tempdatalist[j].keyword = keyword;

                    /**
                     * [searchResultfoGrayScale description]
                     * @type {[type]}
                     */
                    _tempdatalist[j].searchResultfoGrayScale = _tempdata.searchResultfoGrayScale;
                }

                /**
                 * 将已获取的数据添加到本次获取的数据集合中
                 */
                _keywords[index].data = _tempdatalist;
            });
        }

        /**
         * [在获取完一次数据后，使用 always 用于兼容 fail 的情况]
         */
        $.when.apply(null, _deferreds).always(function() {
            $.each(_keywords, function(index, keyword) {
                _data = _data.concat(keyword.data || []);
            });

            /**
             * [currentDataLimitEachTime 获取当前需要的数据数量]
             * @type {Number}
             */
            var currentDataLimitEachTime = Math.min(_this.dataLimitEachTime, _this.dataLimit - _this.data.length);

            /**
             * [数据数量差]
             */
            var _difference = currentDataLimitEachTime - _data.length;

            /**
             * [若存在冗余数据，将多余数据从数据集中放置到缓存对象中]
             */
            if (_difference <= 0) {
                _this.cache = _data.splice(currentDataLimitEachTime, _data.length);

                /**
                 * 解决延迟对象
                 */
                _deferred.resolve(_data);
            }

            /**
             * [处理数据不够的情况]
             */
            if (_difference > 0) {
                _callee.call(_this, _data, _deferred);
            }
        });
        return _deferred;
    },

    /**
     * [sendHttpRequest 发送获取数据请求]
     */
    sendHttpRequest: function(params) {
        var _this = this;
        return $.ajax($.extend(true, {
            url: '//s.hc360.com/getmmtlast.cgi',
            data: {
                w: '',
                mc: 'seller',
                sys: 'ls',
                p4p: '1',
                source: _this.p4preferrer
            },
            timeout: 2000, //用于JSONP失败捕获
            dataType: 'jsonp',
            jsonp: 'jsoncallback'
        }, (params || {})));
    },

    /**
     * [hasScrolledBottom 判断是否滚动元素底部]
     * @return {Boolean} [description]
     */
    hasScrolledBottom: function(_element) {
        // var _window = $(window),
        //     _body = $(window.document.body);
        // var scrollingBodyHeight = _body.height() - _element.offset().top,
        //     scrollingHeight = (_element.height() < scrollingBodyHeight) ? _element.height() : scrollingBodyHeight,
        //     windowHeight = (_element.offset().top - _window.scrollTop() > 0) ? _window.height() - (_element.offset().top - _window.scrollTop()) : _window.height();

        // return scrollingHeight <= windowHeight;


        // var $inner = $e.find('div.jscroll-inner').first(),
        //     data = $e.data('jscroll'),
        //     borderTopWidth = parseInt($e.css('borderTopWidth'), 10),
        //     borderTopWidthInt = isNaN(borderTopWidth) ? 0 : borderTopWidth,
        //     iContainerTop = parseInt($e.css('paddingTop'), 10) + borderTopWidthInt,
        //     iTopHeight = _isWindow ? _$scroll.scrollTop() : $e.offset().top,
        //     innerTop = $inner.length ? $inner.offset().top : 0,
        //     iTotalHeight = Math.ceil(iTopHeight - innerTop + _$scroll.height() + iContainerTop);

        // if (!data.waiting && iTotalHeight + _options.padding >= $inner.outerHeight()) {
        //     //data.nextHref = $.trim(data.nextHref + ' ' + _options.contentSelector);
        //     _debug('info', 'jScroll:', $inner.outerHeight() - iTotalHeight, 'from bottom. Loading next request...');
        //     return _load();
        // }

        var $window = $(window),
            $body = $(window.document.body);
        var $elementBottomOffsetTop = _element.offset().top + _element.outerHeight(),
            $windowScrollTop = $window.scrollTop(),
            $windowBottonOffsetTop = $windowScrollTop + $window.height();

        return ($elementBottomOffsetTop > $windowScrollTop) && ($elementBottomOffsetTop < $windowBottonOffsetTop);
    },

    /**
     * [throttle 函数节流]
     */
    throttle: function(fn, delay) {
        var timer = null;
        return function() {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        };
    },

    /**
     * [__getEventListener 获取指定事件类型的事件处理函数列表]
     * @param  {String} eventType [事件类型]
     * @return {Array}           [事件处理函数列表]
     */
    __getEventListener: function(eventType) {
        var _this = this;
        _this.listener[eventType] = _this.listener[eventType] ? _this.listener[eventType] : [];
        return _this.listener[eventType];
    },

    /**
     * [__dispatchEvent 派发事件]
     */
    __dispatchEvent: function() {
        var _this = this,
            _eventType = Array.prototype.shift.call(arguments),
            _listener = _this.__getEventListener(_eventType);

        for (var i = 0; i < _listener.length; i++) {
            try {
                _listener[i].apply(_this, arguments);
            } catch (ex) {}
        }
    },

    /**
     * [__removeEventListener 移除事件监听]
     * @param {String} eventType    [事件类型]
     * @param {Object} eventHandler [事件处理函数]
     * @return {Object}              [当前业务对象]
     */
    removeEventListener: function(eventType, eventHandler) {
        var _this = this,
            _listener = _this.__getEventListener(eventType);

        for (var i = 0; i < _listener.length; i++) {
            if (eventHandler === _listener[i]) {
                _listener.splice(i--, 1);
            }
        }
    },

    /**
     * [addEventListener 添加事件监听]
     * @param {String} eventTypes    [事件类型名称列表]
     * @param {Object} eventHandler [事件处理函数]
     * @return {Object}              [当前业务对象]
     */
    addEventListener: function(eventTypes, eventHandler) {
        var _this = this,
            _listener = [],
            _eventTypeList = eventTypes.split(',');

        /**
         * [循环添加不同事件类型的事件处理函数]
         */
        $.each(_eventTypeList, function(index, eventType) {

            /**
             * [过滤空事件类型名称]
             */
            if (!($.trim(eventType).length)) {
                return true;
            }

            /**
             * 获取指定事件类型的事件处理函数列表
             */
            _listener = _this.__getEventListener(eventType);

            /**
             * 将事件处理函数添加到指定事件类型的事件处理函数列表
             */
            _listener.push(eventHandler);
        });
    }
};

/**
 * [keywordEntity 实例化关键字维护对象]
 * @type {Keyword}
 */
var keywordEntity = new Keyword();

/**
 * [在获取关键字后加载P4P业务逻辑]
 */
$.when(keywordEntity.getKeywordList()).done(function(keywords) {

    /**
     * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
     * @type {p4pBusinessLogic}
     */
    var p4pBusinessLogicEntity = new p4pBusinessLogic({

        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: '',

        /**
         * [template 模板HTML]
         * @type {String}
         */
        template: [
            '{{each products as product i}}',
            '{{if !product.rended}}',
            '<li data-index="{{i}}" onmousedown="return hcclick(\'?hcjsy_homepage=hcjsy_homepage_waterfall_cp{{product.ubaIndex}}\')">',
            '    <div class="proImgCon">',
            '        <a href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}" target="_blank"><img src="{{product.searchResultfoImageBig}}"></a>',
            '        <em>{{product.keyword}}</em>',
            '    </div>',
            '    <dl>',
            '        <dt><a href="{{product.searchResultfoUrl}}" target="_blank">{{product.searchResultfoTitle}}</a></dt>',
            '        <dd>',
            '            <span>{{product.pretreatPrice}}</span>',
            '        </dd>',
            '    </dl>',
            '    <div class="proBoxAlert">',
            '       <a href="//s.hc360.com/?w={{product.keyword}}&mc=seller" title="发现更多的相似资源" target="_blank">',
            '           <h3>相似资源</h3>',
            '           <p>发现更多的相似资源</p>',
            '       </a>',
            '    </div>',
            '</li>',
            '{{/if}}',
            '{{/each}}'
        ].join(''),

        /**
         * [cache P4P缓存数据集]
         * @type {Object}
         */
        cache: {},

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 10,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $("#data-p4p-wrap"),

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} element [被点击元素]
         * @return {Number}         [数据缓存中的索引值]
         */
        getClickElementCacheIndexCallback: function(element) {
            return element.closest('li').attr('data-index');
        }
    });

    /**
     * [监听渲染开始事件]
     * @param  {String} template         [渲染模板HTML]
     * @param  {Object} template_params  [渲染模板参数]
     */
    p4pBusinessLogicEntity.addEventListener('onStartRender', function(template, template_params) {
        var _this = this,
            _prolist = template_params.products;

        /**
         * [过滤]
         */
        $.each(_prolist, function(index, product) {
            product.searchResultfoImageBig = product.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');
            product.pretreatPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' : ('&yen;&nbsp;' + product.searchResultfoUnitPrice);

            /**
             * [楼层监测点序号]
             */
            product.ubaIndex = ('00' + Math.ceil((index + 1) / 5)).slice(-2);
        });
    });

    /**
     * [监听创建完点击商品参数对象事件]
     */
    p4pBusinessLogicEntity.addEventListener('onAfterBuildClickParams', function(params, data) {
        var _this = this;
        params.keyword = encodeURIComponent(data.keyword) || ''; //设置关键字
        params.abtest = _this.cache.searchResultfoGrayScale || 0; //是否灰度发布
    });

    /**
     * [监听创建商品曝光参数对象事件]
     */
    p4pBusinessLogicEntity.addEventListener('onBuildExpoData', function(params, data) {
        var _this = this;
        params.params[0] = encodeURIComponent(data.keyword);
    });

    /**
     * [监听创建完商品计费参数对象事件]
     */
    p4pBusinessLogicEntity.addEventListener('onAfterBuildClickParams', function(_params, _data, _index) {
        var _this = this,
            _datalist = _this.cache.prolist;

        /**
         * [修改计费参数]
         */
        _params.lastPrecisePrice = 0,
            _params.nextprice = _datalist[_index + 1] && (_datalist[_index + 1].keyword === _data.keyword) && _datalist[_index + 1].searchResultfoUseBid || 0,
            _params.isnextlike = _datalist[_index + 1] && (_datalist[_index + 1].keyword === _data.keyword) && _datalist[_index + 1].searchResultfoMatchRule || 0,
            _params.nextonekeytype = _datalist[_index + 1] && (_datalist[_index + 1].keyword === _data.keyword) && _datalist[_index + 1].searchResultfoKypromote || 0;

        /**
         * [若指定索引的产品为精准匹配，则 lastPrecisePrice 查找顺序从指定索引的下一个开始到末尾位置，否则，lastPrecisePrice 查找顺序从指定索引的上一个到起始位置。]
         */
        var i = _index;
        if (parseInt(_data.searchResultfoMatchRule) === 0) {
            _params.lastPrecisePrice = _data.searchResultfoUseBid; //默认值为当前索引的产品价格
            while ((++i) < _datalist.length) {
                if ((parseInt(_datalist[i].searchResultfoMatchRule) === 0) && (_datalist[i].keyword === _data.keyword)) {
                    _params.lastPrecisePrice = _datalist[i].searchResultfoUseBid;
                    break;
                }
                i++;
            }
        } else {
            while (i--) {
                if ((parseInt(_datalist[i].searchResultfoMatchRule) === 0) && (_datalist[i].keyword === _data.keyword)) {
                    _params.lastPrecisePrice = _datalist[i].searchResultfoUseBid;
                    break;
                }
            }
        }
    });

    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
        var _this = this,
            _prolist = _this.cache.prolist;

        /**
         * [过滤]
         */
        $.each(_prolist, function(index, product) {
            product.rended = true;
        });

        /**
         * [绑定监测点点击事件]
         */
        _this.wrap.delegate(_this.clickableElementSelector, 'click', function(event) {
            try {
                HC.UBA.sendUserlogsElement('UserBehavior_p4p_homepage');
            } catch (ex) {}
        });

        /**
         * [绑定鼠标悬浮事件]
         */
        _this.wrap.delegate('li', 'mouseenter', function(event) {
            $(this).addClass('proHover');
        }).delegate('li', 'mouseleave', function(event) {
            $(this).removeClass('proHover');
        });
    });

    /**
     * 开始P4P业务对象初始化
     */
    p4pBusinessLogicEntity.init();

    /**
     * [scrollLoadingEntity 实例化滚动加对象]
     * @type {ScrollLoading}
     */
    var scrollLoadingEntity = new ScrollLoading({
        container: $('#data-p4p-wrap'),
        loadingWrap: $('#loadingIco'),
        keywords: keywords || [],
        p4preferrer: 10
    });

    /**
     * [监听数据加载完成时间]
     */
    scrollLoadingEntity.addEventListener('onDataLoaded', function(data) {
        var _this = this;

        /**
         * [prolist 修改P4P业务对象实例的数据属性]
         */
        p4pBusinessLogicEntity.cache.prolist = (p4pBusinessLogicEntity.cache.prolist || []).concat(data);

        /**
         * 渲染页面
         */
        p4pBusinessLogicEntity.render();

        /**
         * 渲染页面
         */
        p4pBusinessLogicEntity.bindEvent();

        /**
         * 发送曝光数据
         */
        p4pBusinessLogicEntity.sendExpoData(data);

        /**
         * 触发窗口滚动事件，更新首页左边浮动楼层导航高亮状态
         */
        $(window).trigger('scroll');
    });

    /**
     * 初始化滚动业务对象
     */
    scrollLoadingEntity.init();
});
