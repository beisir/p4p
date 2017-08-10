/**
 * [deferredDOMContentLoaded 监听 DOMContentLoaded 的延迟对象。]
 * [声明该延迟对象主要是为了解决在 DOMContentLoaded 事件中发送P4P曝光数据的问题。因为P4P曝光数据需要获取页面底部脚本 hc.control.js 初始化的 Page_ID 属性]
 * @type {Object}
 */
var deferredDOMContentLoaded = $.Deferred();

/**
 * [监听 DOMContentLoaded 事件，并解决延迟对象]
 */
$(function() {
    deferredDOMContentLoaded.resolve();
});

/**
 * [p4pBusinessLogic p4p业务对象]
 * @return {Object} [p4p业务对象实例]
 */
function p4pBusinessLogic(options) {
    var _this = this;

    /**
     * 扩展业务对象属性
     */
    $.extend(true, _this, {

        /**
         * [listener 事件监听缓存对象]
         * @type {Object}
         */
        listener: {},

        /**
         * [service 服务默认配置]
         * @type {Object}
         */
        service: {

            /**
             * [data 数据服务默认配置]
             * @type {Object}
             */
            data: {
                url: 'http://s.hc360.com/getmmtlast.cgi',
                data: {
                    w: '',
                    mc: 'seller',
                    sys: 'ls',
                    p4p: '1'
                },
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                timeout: 3000
            },

            /**
             * [click 点击服务默认配置]
             * @type {Object}
             */
            click: {
                url: 'http://p4pserver.org.hc360.com/p4pserver/doAnticheating',
                data: {},
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                cache: false,
                timeout: 3000
            }
        },

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: null,

        /**
         * [target 广告位元素]
         * @type {Object}
         */
        target: null,

        /**
         * [targetRenderCallback 广告位元素渲染到页面的回调函数]
         * @param  {Object} targetHTML [广告位元素]
         */
        targetRenderCallback: function(targetHTML) {
            return $(targetHTML).appendTo(_this.wrap);
        },

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a,button',

        /**
         * [antiCheating 是否开启防作弊]
         * @type {Boolean}
         */
        antiCheating: true,

        /**
         * [cache 数据缓存]
         * @type {Object}
         */
        cache: null,

        /**
         * [referrer 曝光、点击来源参数]
         * @type {Number}
         */
        referrer: 0,

        /**
         * [keyword 搜索关键词]
         * @type {String}
         */
        keyword: '',

        /**
         * [template 渲染模板HTML]
         * @type {String}
         */
        template: '',

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} elemnet [被点击元素]
         * @return {Number}         [数据缓存索引值]
         */
        getClickElementCacheIndexCallback: function(element) {
            return element.closest('li').index();
        },

        /**
         * [preventDefaultLinkRedirect 是否取消默认行为链接跳转]
         * 这个配置项主要作用是为了确保点击在当前页面打开的链接时，计费请求已正常结束，进而由 preventDefaultLinkRedirectCallBack 实现跳转 
         * @type {Boolean}
         */
        preventDefaultLinkRedirect: false,

        /**
         * [preventDefaultLinkRedirectCallBack 取消被点击链接的默认行为后，如果跳转的回调函数，在 preventDefaultLinkRedirect 为 true 的时候起作用]
         * @param  {Object} element [被点击元素]
         * @param  {String} href    [被点击元素链接地址]
         */
        preventDefaultLinkRedirectCallBack: function(element, href) {},

        /**
         * [autoSendExpoData 是否自动发送曝光数据]
         * @type {Boolean}
         */
        autoSendExpoData: true,

        /**
         * [templateEngine 导入模板引擎]
         * @type {Object}
         */
        templateEngine: require('template')

    }, options);
}

/**
 * [init 初始化]
 */
p4pBusinessLogic.prototype.init = function() {
    var _this = this,
        _deferred = _this.getDataDeferred();


    /**
     * [wrap 初始化包裹元素]
     * @type {Object}
     */
    if (Object.prototype.toString.call(_this.wrap) === '[object Function]') {
        _this.wrap = _this.wrap.call(null);
    }

    /**
     * [加载数据]
     */
    $.when(_deferred).done(function(data) {

        /**
         * 派发数据加载完成事件
         */
        _this.__dispatchEvent('onDataReady', data);

        /**
         * [cache 缓存P4P数据]
         * @type {Object}
         */
        _this.cache = data || {};

        /**
         * [prolist 缓存P4P商品数据列表]
         * @type {Array}
         */
        _this.cache.prolist = _this.cache.searchResultInfo || [];

        /**
         * [若返回数据记录数为0不进行任何操作]
         */
        if ((_this.cache.prolist || []).length === 0) {
            return;
        }

        /**
         * 开始渲染页面并初始化 target 属性，该属性指向刚创建的DOM元素对象
         */
        _this.render();

        /**
         * 绑定元素点击事件用于发送点击计费请求
         */
        _this.bindEvent();

        /**
         * [自动发送曝光数据时，直接发送曝光数据]
         */
        if (_this.autoSendExpoData) {
            deferredDOMContentLoaded.done(function() {
                _this.sendExpoData(_this.cache.prolist);
            });
        }
    }).fail(function() {

        /**
         * 派发数据加载完成事件
         */
        _this.__dispatchEvent('onDataFail', arguments);
    });
};

/**
 * [render 渲染页面]
 */
p4pBusinessLogic.prototype.render = function() {
    var _this = this,

        /**
         * [_template 渲染模板HTML]
         * @type {String}
         */
        _template = _this.template,

        /**
         * [_template_params 渲染模板参数]
         * @type {Object}
         */
        _template_params = {
            products: _this.cache.prolist || []
        },

        /**
         * [_template_render_html 渲染完成后的HTML]
         * @type {String}
         */
        _template_render_html = '';

    /**
     * 预处理数据
     */
    _this.pretreatData();

    /**
     * 派发开始渲染事件
     */
    _this.__dispatchEvent('onStartRender', _template, _template_params);

    /**
     * [若模板内容不为空，则进行渲染操作]
     */
    if ($.trim(_template).length !== 0) {

        /**
         * [返回渲染结果字符串]
         * @type {String}
         */
        _template_render_html = _this.templateEngine.render(_template)(_template_params);

        /**
         * 通过回调函数将广告位元素更新到广告位包裹元素
         */
        _this.target = _this.targetRenderCallback && _this.targetRenderCallback.call(_this, _template_render_html);
    }

    /**
     * 派发结束渲染事件
     */
    _this.__dispatchEvent('onEndRender', _this.target);
};

/**
 * [pretreatData 预处理数据]
 */
p4pBusinessLogic.prototype.pretreatData = function() {
    var _this = this,

        /**
         * [_tempRegExp 替换标题正则表达式对象]
         * @type {RegExp}
         */
        _tempRegExp = new RegExp(_this.keyword, 'img'),

        /**
         * P4P商品数据项
         */
        _tempEntity;

    for (var i = 0; i < _this.cache.prolist.length; i++) {
        _tempEntity = _this.cache.prolist[i],
            _tempEntity.pretreatImage = _tempEntity.searchResultfoImageBig.replace(/(?:\\.\\.)\.*/ig, '') || _tempEntity.searchResultfoImageBig || '',
            _tempEntity.pretreatIconText = (_tempEntity.searchResultfoIsRecomHQ == 0) ? "推荐" : ((_tempEntity.searchResultfoIsRecomHQ == 1) ? "优质" : ""),
            _tempEntity.pretreatTitle = _tempEntity.searchResultfoTitle.replace(_tempRegExp, '<span>' + _this.keyword + '</span>'),
            _tempEntity.pretreatAttrs = analyzeAttr(_tempEntity.searchResultfoAttr || ''),
            _tempEntity.pretreatShopUrl = 'http://' + _tempEntity.searchResultfoUserName + '.b2b.hc360.com',
            _tempEntity.pretreatPrice = (parseFloat(_tempEntity.searchResultfoUnitPrice) === 0) ? '面议' : ('&yen;' + _tempEntity.searchResultfoUnitPrice + ' &frasl;' + _tempEntity.searchResultfoMeasureUnit),
            _tempEntity.pretreatIsTrade = (parseFloat(_tempEntity.searchResultfoUnitPrice) === 0) ? false : parseInt(_tempEntity.searchResultfoTrading),
            _tempEntity.pretreatMobilePhone = _tempEntity.searchResultfoTelephone ? searchResultfoTelephone : _tempEntity.searchResultfoML,
            _tempEntity.pretreatArea = _tempEntity.searchResultfoZone.replace('中国', '').replace(/:/g, ' ') || '商家暂未提供';
    }

    /** [analyzeAttr 解析属性值] */
    function analyzeAttr(str) {
        var regExpTemp = new RegExp('([^\\;\\:]+):([^\\;\\:]+)', 'ig'),
            partternTemp, result = [];

        while (partternTemp = regExpTemp.exec(str)) {
            result.push({
                name: partternTemp[1] || '',
                value: partternTemp[2] || ''
            });
        }
        return result;
    }
};

/**
 * [getDataDeferred 获取数据延迟兑现]
 * @return {Object} [description]
 */
p4pBusinessLogic.prototype.getDataDeferred = function() {
    var _this = this,
        _deferred,
        _params = {};

    /**
     * 派发开始获取数据事件
     */
    _this.__dispatchEvent('onStartGetData', _params);

    /**
     * [若存在缓存数据，则无需从搜索接口再获取数据]
     */
    if (_this.cache) {
        _deferred = $.Deferred();
        _deferred.resolve(_this.cache);
    }

    /**
     * 从搜索接口获取数据
     */
    else {
        _deferred = _this.sendHttpRequest('data', $.extend(true, {}, {
            data: {
                source: _this.referrer,
                w: _this.keyword
            }
        }, _params));
    }

    return _deferred;
};

/**
 * [bindEvent 绑定元素点击事件]
 * @param  {String}   selector                           [元素选择器]
 * @param  {Function} getRelativePositionElementCallback [获取当前点击元素的相对位置元素回调函数，相对位置元素用于确定当前点击元素在所有P4P商品列表中的索引值]
 */
p4pBusinessLogic.prototype.bindEvent = function() {
    var _this = this;

    /**
     * [_ua 获取当前浏览器类型]
     * @type {Object}
     */
    // _ua = require('./ua').parseUA(window.navigator.userAgent);

    /**
     * [绑定相应事件]
     */
    _this.target && _this.target.on('click', _this.clickableElementSelector, function(event) {
        _this.eventHandler.call(_this, event);
    });

    /**
     * 派发绑定事件结束事件
     */
    _this.__dispatchEvent('onEndBindEvent', _this.target);

    /**
     * [UC浏览器在第一次点击进入到商品终极页后，点击浏览器后退按钮回到列表页，再点击其他P4P商品不发送计费请求。]
     * [以下代码虽然可以实现浏览器后退发送计费请求，但是后退有偶发跳转地址错误问题。]
     */
    // if (_ua.mobile) {
    //  if (_ua.ios) {
    //      $(window).on("pagehide", function() {
    //          var $body = $(document.body);
    //          $body.children().remove();
    //          setTimeout(function() {
    //              $body.append('<script type="text/javascript">window.location.reload(true);<\/script>');
    //          });
    //      });
    //  }
    //  else {
    //      $(window).on('pageshow', function(evt) {
    //          setTimeout(function() {
    //              if (evt.persisted) {
    //                  window.location.reload(true);
    //              }
    //          });
    //      });
    //  }
    // }
};

/**
 * [eventHandler 元素点击事件处理函数]
 * @return {[type]} [description]
 */
p4pBusinessLogic.prototype.eventHandler = function(event) {
    var _this = this;

    /**
     * [_tempElemnet 获取被点击元素]
     * @type {Object}
     */
    var _tempElemnet = $(event.currentTarget),

        /**
         * [_tempCacheIndex 获取被点击元素对应的数据在数据缓存中的索引值]
         * @type {Number}
         */
        _tempCacheIndex = parseInt(_this.getClickElementCacheIndexCallback.call(null, _tempElemnet)) || 0,

        /**
         * [_tempCacheData 获取被点击元素对应在数据缓存中的数据]
         * @type {Object}
         */
        _tempCacheData = _this.cache.prolist[_tempCacheIndex];

    /**
     * [数据缓存中不存在该索引值的数据时，则直接返回]
     */
    if (!_tempCacheData) {
        return;
    }

    /**
     * [取消点击元素默认行为，主要用于在确定计费请求结束后再进行页面跳转]
     */
    _this.preventDefaultLinkRedirect && event.preventDefault();

    /**
     * [若防作弊打开且当前数据项已经点击过，则直接返回]
     */
    if (_this.antiCheating && _tempCacheData.clicked) {

        /**
         * [对取消默认行为的链接使用回调函数实现链接默认行为]
         */
        if (_this.preventDefaultLinkRedirect && _this.preventDefaultLinkRedirectCallback) {
            _this.preventDefaultLinkRedirectCallback.call(_this, _tempElemnet);
        }
        return;
    }

    /**
     * [clicked 设置当前数据项已经点击过]
     * @type {Boolean}
     */
    _tempCacheData.clicked = true;

    /**
     * 派发开始发送点击数据事件
     */
    _this.__dispatchEvent('onStartSendClickParams', _tempCacheData);

    /**
     * [xhr 发送点击计费请求]
     * @type {Object}
     */
    var xhr = _this.sendHttpRequest('click', {
        data: _this.buildClickParams(_tempCacheData, _tempCacheIndex)
    });

    /**
     * [计费请求结束后处理链接跳转]
     */
    xhr.always(function() {

        /**
         * 派发完成发送点击数据事件
         */
        _this.__dispatchEvent('onEndSendClickParams', xhr);

        /**
         * [对取消默认行为的链接使用回调函数实现链接默认行为]
         */
        if (_this.preventDefaultLinkRedirect && _this.preventDefaultLinkRedirectCallback) {
            _this.preventDefaultLinkRedirectCallback.call(_this, _tempElemnet);
        }
    });
};

/**
 * [buildClickParams 创建点击商品参数对象]
 * @param  {Object} data      [缓存数据对象]
 * @param  {Number} dataIndex [缓存数据对象在数据缓存中的索引值]
 * @return {Object}           [点击商品参数对象]
 */
p4pBusinessLogic.prototype.buildClickParams = function(data, dataIndex) {
    var _this = this,
        _params = {},
        _data = $.extend(true, {}, data),
        _index = dataIndex,
        _datalist = _this.cache.prolist;

    /**
     * 派发构建点击计费参数开始事件
     */
    _this.__dispatchEvent('onStartBuildClickParams', _params, _data);

    /**
     * [开始初始化参数对象属性值]
     */
    _params.keyword = encodeURIComponent(_this.keyword) || '',
        _params.providerid = _data.searchResultfoProviderid,
        _params.userid = _data.searchResultfoUserId || '0',
        _params.bcid = _data.searchResultfoId,
        _params.p4punique = _data.searchResultfoUnique || _data.searchResultfoUnique,
        _params.username = _data.searchResultfoUserName,
        _params.unitid = _data.searchResultfoUnitId || 0,
        _params.planid = _data.searchResultfoPlanId || 0,
        _params.price = _data.searchResultfoUseBid || 0,
        _params.islike = _data.searchResultfoMatchRule || 0,
        _params.sortpos = _index + 1,
        _params.nextprice = _datalist[_index + 1] && _datalist[_index + 1].searchResultfoUseBid || 0,
        _params.isnextlike = _datalist[_index + 1] && _datalist[_index + 1].searchResultfoMatchRule || 0,
        _params.lastPrecisePrice = 0,
        _params.clickreferer = _this.referrer,
        _params.onekeytype = _data.searchResultfoKypromote,
        _params.nextonekeytype = _datalist[_index + 1] && _datalist[_index + 1].searchResultfoKypromote,
        _params.abtest = _this.cache.searchResultfoGrayScale || 0, //是否灰度发布
        _params.pageid = ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID));

    /**
     * [若指定索引的产品为精准匹配，则 lastPrecisePrice 查找顺序从指定索引的下一个开始到末尾位置，否则，lastPrecisePrice 查找顺序从指定索引的上一个到起始位置。]
     */
    var i = _index;
    if (parseInt(_data.searchResultfoMatchRule) === 0) {
        _params.lastPrecisePrice = _data.searchResultfoUseBid; //默认值为当前索引的产品价格
        while ((++i) < _datalist.length) {
            if (parseInt(_datalist[i].searchResultfoMatchRule) === 0) {
                _params.lastPrecisePrice = _datalist[i].searchResultfoUseBid;
                break;
            }
            i++;
        }
    } else {
        while (i--) {
            if (parseInt(_datalist[i].searchResultfoMatchRule) === 0) {
                _params.lastPrecisePrice = _datalist[i].searchResultfoUseBid;
                break;
            }
        }
    }

    /**
     * 派发构建点击计费参数结束事件
     */
    _this.__dispatchEvent('onAfterBuildClickParams', _params, _data, _index);

    return _params;
};

/**
 * [sendHttpRequest 发送http请求，填充服务默认参数]
 * @param {service} [服务名称]
 * @param {params} [服务参数]
 * @return {Object} [ajax延迟对象]
 */
p4pBusinessLogic.prototype.sendHttpRequest = function(service, params) {
    var _this = this;
    return $.ajax($.extend(true, {}, (_this.service[service] || {}), (params || {})));
};

/**
 * [sendExpoData 发送曝光数据]
 * @param  {Object} data [曝光数据集]
 */
p4pBusinessLogic.prototype.sendExpoData = function(data) {
    var _this = this,

        /**
         * [_iframeName 框架name属性]
         * @type {Object}
         */
        _iframeName = ('p4p-expo-iframe' + Math.random()).replace(/\.*/ig, '');

    /**
     * 曝光数据为空直接返回
     */
    if (!data.length) {
        return;
    }

    /**
     * [是否未创建曝光表单元素]
     */
    if (!_this.expo) {

        /**
         * [拼接曝光表单元素HTML]
         * @type {String}
         */
        var _html = [
            '<div data-node-name="p4p-expo-form-wrap" style="display:none;">',
            '   <form action="http://log.org.hc360.com/logrecordservice/logrecordp4pexposure" enctype="application/x-www-form-urlencoded" method="post" target="#ifamename#">',
            '       <input name="p4pexpolog" type="hidden">',
            '   </form>',
            '   <iframe name="#ifamename#"></iframe>',
            '</div>'
        ];

        /**
         * [_formWrap 创建表单元素，有时候 wrap 为多元素，这时候为避免创建重复曝光表单元素，只将曝光表单元素创建到第一个 wrap 元素]
         * @type {Object}
         */
        var _formWrap = $(_html.join('').replace(/\#ifamename\#/ig, _iframeName)).appendTo((_this.wrap.length > 1) ? _this.wrap.first() : _this.wrap);

        /**
         * [初始化曝光相关元素配置到当前业务对象实例]
         */
        $.extend(true, _this, {
            expo: {
                form: _formWrap.find('form'),
                input: _formWrap.find('input[type="hidden"]'),
                iframe: _formWrap.find('iframe'),
                data: [] //已曝光数据集，用于多个商品单独曝光时的判重，例如M站的滚动曝光
            }
        });
    }

    /**
     * [_arr_expo_data 创建曝光数据]
     * @type {Array}
     */
    var _arr_expo_data = [],

        /**
         * 单独商品曝光数据对象
         */
        _arr_expo_data_item = {};
    for (var i = 0; i < data.length; i++) {

        /**
         * [若当前商品ID存在于已曝光产品ID列表中，则跳过当前商品，不将当前商品添加到曝光数据中]
         */
        if ($.inArray(data[i].searchResultfoId, _this.expo.data) != -1) {
            continue;
        }
        /**
         * 当前商品ID不存在于已曝光产品ID列表中，则将其加入到已曝光产品ID列表中
         */
        else {
            _this.expo.data.push(data[i].searchResultfoId);
        }

        /**
         * [_arr_expo_data_item 单独商品曝光数据对象]
         * @type {Array}
         */
        _arr_expo_data_item.params = [
            encodeURIComponent(_this.keyword),
            data[i].searchResultfoId,
            (data[i].searchResultfoPlanId || ''),
            (data[i].searchResultfoUnitId || ''),
            data[i].searchResultfoUserId,
            data[i].searchResultfoProviderid,
            _this.referrer,
            data[i].searchResultfoKypromote,
            ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
            '0', //百度SEM终极页项目 keywordextend 参数占位符
            '0', //百度SEM终极页项目 match 参数占位符
            '0' //百度SEM终极页项目 confr 参数占位符
        ];

        /**
         * 派发开始发送曝光数据事件，之所以将参数数组放到一个对象的属性上，是为了在 onBuildExpoData 事件中修改参数时能保持变量引用
         */
        _this.__dispatchEvent('onBuildExpoData', _arr_expo_data_item, data[i]);

        /**
         * 将当前商铺添加到曝光数据中
         */
        _arr_expo_data.push(_arr_expo_data_item.params.join('@@'));
    }

    /**
     * 派发开始发送曝光数据事件
     */
    _this.__dispatchEvent('onStartSendExpoData', _arr_expo_data);

    /**
     * [不存在要曝光的数据，则直接返回]
     */
    if (!_arr_expo_data.length) {
        return;
    }

    /**
     * 设置曝光表单中隐藏域的值
     */
    _this.expo.input && _this.expo.input.val(_arr_expo_data.join('#&#'));

    /**
     * 发送曝光数据
     */
    _this.expo.form.length && _this.expo.form[0].submit();
};

/**
 * [parseURL 获取URL属性]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
p4pBusinessLogic.prototype.parseURL = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function() {
            var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length,
                i = 0,
                s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/')
    };
};

/**
 * [resizeImage 图片自适应脚本]
 * @param  {Array}    imageEntityList       [图片元素列表]
 * @param  {Function} imageWrapEntityGetter [获取图片基于某元素适应的回调函数]
 */
p4pBusinessLogic.prototype.resizeImage = function(imageEntityList, imageWrapEntityGetter) {

    /**
     * [calculateImageSize 计算图片大小]
     */
    function calculateImageSize($img, $imgWidth, $imgHeight, $wrapWidth, $wrapHeight) {

        // Calculate size
        var w, h, wn, hn, ha, va, hdif, vdif,
            margT = 0,
            margL = 0,
            $imgCW = $wrapWidth,
            $imgCH = $wrapHeight;


        // Save original sizes
        if ($img.data('owidth') === undefined) $img.data('owidth', $imgWidth);
        if ($img.data('oheight') === undefined) $img.data('oheight', $imgHeight);


        // Compare ratio
        if (($imgCW / $imgCH) < ($img.data('owidth') / $img.data('oheight'))) {
            w = '100%';
            h = 'auto';
            wn = Math.floor($imgCW);
            hn = Math.floor($imgCW * ($img.data('oheight') / $img.data('owidth')));
        } else {
            w = 'auto';
            h = '100%';
            wn = Math.floor($imgCH * ($img.data('owidth') / $img.data('oheight')));
            hn = Math.floor($imgCH);
        }

        // Align X
        ha = 'center';
        hdif = $imgCW - wn;
        if (ha === 'left') margL = 0;
        if (ha === 'center') margL = hdif * 0.5;
        if (ha === 'right') margL = hdif;
        if (ha.indexOf('%') !== -1) {
            ha = parseInt(ha.replace('%', ''), 10);
            if (ha > 0) margL = hdif * ha * 0.01;
        }


        // Align Y
        va = 'center';
        vdif = $imgCH - hn;
        if (va === 'top') margT = 0;
        if (va === 'center') margT = vdif * 0.5;
        if (va === 'bottom') margT = vdif;
        if (va.indexOf('%') !== -1) {
            va = parseInt(va.replace('%', ''), 10);
            if (va > 0) margT = vdif * va * 0.01;
        }


        // Add Css
        w = wn;
        h = hn;
        $img.css({
            'width': w,
            'height': h,
            'margin-left': Math.floor(margL),
            'margin-top': Math.floor(margT)
        });
    }

    /**
     * [计算图片列表中图片尺寸]
     */
    $.each(imageEntityList, function(index, imageEntity) {
        var src = imageEntity.src || '';
        if (src) {
            var imageTemp = new Image();
            imageTemp.onload = function() {

                /**
                 * [imageWrapEntity 获取图片容器元素]
                 * @type {[type]}
                 */
                var imageWrapEntity = $(imageEntity).parent();
                if (imageWrapEntityGetter) {
                    imageWrapEntity = imageWrapEntityGetter.call(imageEntity);
                }

                /**
                 * 计算图片尺寸
                 */
                calculateImageSize($(imageEntity), this.width, this.height, imageWrapEntity.width(), imageWrapEntity.height());

                /**
                 * 销毁图片临时对象
                 */
                imageTemp = null;
            };
            imageTemp.src = src;
        }
    });
};

/**
 * [__getEventListener 获取指定事件类型的事件处理函数列表]
 * @param  {String} eventType [事件类型]
 * @return {Array}           [事件处理函数列表]
 */
p4pBusinessLogic.prototype.__getEventListener = function(eventType) {
    var _this = this;
    _this.listener[eventType] = _this.listener[eventType] ? _this.listener[eventType] : [];
    return _this.listener[eventType];
};

/**
 * [__dispatchEvent 派发事件]
 */
p4pBusinessLogic.prototype.__dispatchEvent = function() {
    var _this = this,
        _eventType = Array.prototype.shift.call(arguments),
        _listener = _this.__getEventListener(_eventType);

    for (var i = 0; i < _listener.length; i++) {
        try {
            _listener[i].apply(_this, arguments);
        } catch (ex) {}
    }
};

/**
 * [__removeEventListener 移除事件监听]
 * @param {String} eventType    [事件类型]
 * @param {Object} eventHandler [事件处理函数]
 * @return {Object}              [当前业务对象]
 */
p4pBusinessLogic.prototype.removeEventListener = function(eventType, eventHandler) {
    var _this = this,
        _listener = _this.__getEventListener(eventType);

    for (var i = 0; i < _listener.length; i++) {
        if (eventHandler === _listener[i]) {
            _listener.splice(i--, 1);
        }
    }
};

/**
 * [addEventListener 添加事件监听]
 * @param {String} eventTypes    [事件类型名称列表]
 * @param {Object} eventHandler [事件处理函数]
 * @return {Object}              [当前业务对象]
 */
p4pBusinessLogic.prototype.addEventListener = function(eventTypes, eventHandler) {
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
};

module.exports = p4pBusinessLogic;
