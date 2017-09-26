(function() {

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
    //                 url: '//p4pserver.org.hc360.com/p4pserver/doAnticheatingSpe',
    //                 data: {
    //                     bcid: _p4pbcid,
    //                     keyword: encodeURIComponent(_keyword)
    //                 },
    //                 dataType: 'jsonp',
    //                 jsonp: 'jsoncallback',
    //                 cache: false,
    //                 timeout: 3000
    //             })
    //             .done(function() {
    //                 // console.log("success");
    //             })
    //             .fail(function() {
    //                 // console.log("error");
    //             })
    //             .always(function() {
    //
    //                 /**
    //                  * [_href 跳转页面地址]
    //                  * @type {String}
    //                  */
    //                 var _href = '//js.hc360.com/supplyself/' + _p4pbcid + '.html';
    //                 window.location.href = _href;
    //             });
    //     }
    // }


    /****
     * 获取图片地址，如果有图，则调用张帆接口，返回的值为keyWord，调用扣费接口
     */
     if (window.p4p_is3y=="true"&&window.p4p_picpath!="") {
        var /**
             * [_spider 是否爬虫]
             * @type {RegExp}
             */
            _spider = /spider/ig.test(window.navigator.userAgent),
            /***
             * 匹配bid的正则
             * @type {RegExp}
             */
            reg=/\/\d+/g,
            /****
             * 商机ID
             * @type {*}
             */
            result = reg.exec(document.URL),
            /***
             * bcid
             * @type {*}
             */
            bcId = result[0]&&result[0].slice(1),
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
                    title: $('.dTit a').length > 0 ?  $('.dTit a').text() : '',
                    picPath: window.p4p_picpath
                },
                jsonp: 'callback',
                cache: false,
            }).done(function (data) {
                if (data.state == 1) {
                    var _product=data.data.p4pbclist[0];
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
                            var _href = '//js.hc360.com/supplyself/' + _product.searchResultfoID + '.html';
                            window.location.href = _href;
                        });
                } else {
                    console.log(data.message);
                }

            }).fail(function () {

            });
        }

    }

    /**
     * [p4pshow 不显示P4P广告]
     * @type {Number}
     */
    var p4pshow = parseInt($('#p4pshow').val()) || 0;
    if (!p4pshow) {
        return;
    }

    /**
     * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
     * @type {p4pBusinessLogic}
     */
    var p4pBusinessLogicEntity = new p4pBusinessLogic({
        params_p4p:{ sys: 'js',bus:'p4p_reco' },
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: $('#p4pkeyword').val() || '',

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 15,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $('#storeRecommendedId ul'),

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} element [被点击元素]
         * @return {Number}         [数据缓存中的索引值]
         */
        getClickElementCacheIndexCallback: function(element) {
            return element.closest('li').attr('data-index');
        },

        /**
         * [targetRenderCallback 广告位元素渲染到页面的回调函数]
         * @param  {Object} targetHTML [广告位元素]
         */
        targetRenderCallback: function(targetHTML) {
            var _this = this;
            _this.wrap.empty();
            return $(targetHTML).appendTo(_this.wrap);
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

    /**
     * [监听数据就绪事件]
     */
    p4pBusinessLogicEntity.addEventListener('onDataReady', function(data) {
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
                '{{each products as product i}}',
                '<li data-index={{i}}>',
                '    <div class="botImgBox">',
                '        <a href="//js.hc360.com/supplyself/{{product.searchResultfoId}}.html" data-sentLog="p4pDaTu">',
                '           <img src="{{product.searchResultfoImageSmall}}">',
                '       </a>',
                '    </div>',
                '    <p class="botName">',
                '       <a href="//js.hc360.com/supplyself/{{product.searchResultfoId}}.html" data-sentLog="p4pDaTu">{{product.searchResultfoTitle}}</a>',
                '    </p>',
                '    <p class="botPrice">{{#product.pretreatPrice}}</p>',
                '</li>',
                '{{/each}}'
            ],

            /**
             * [_limit P4P广告位数量上限]
             * @type {Number}
             */
            _limit = 6;

        /**
         * [根据P4P广告位数量上限截取P4P数据]
         */
        _prolist.splice(_limit, _prolist.length);

        /**
         * [P4P广告位数量不够显示一行时]
         */
        if (_prolist.length < _limit) {
            _this.template = '';
            return;
        }

        /**
         * [template 设置模板HTML]
         * @type {String}
         */
        _this.template = _tempHTMLArray.join('');
    });

    /**
     * [监听开始渲染事件]
     */
    p4pBusinessLogicEntity.addEventListener('onStartRender', function(template, template_params) {
        var _this = this,
            _prolist = template_params.products;

        /**
         * [修改价格格式]
         */
        $.each(_prolist, function(index, product) {
            product.pretreatPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' : ('&yen;' + product.searchResultfoUnitPrice);
        });
    });


    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
        var _this = this;

        /**
         * [绑定监测点点击事件]
         */
        targetElement.on("click", '[data-sentLog="p4pDaTu"]', function() {
            try {
                window.sendUserlogsElement && sendUserlogsElement('UserBehavior_p4p_jsitedetail_tupian');
            } catch (ex) {}
        });
    });

    /**
     * 开始P4P业务对象初始化
     */
    p4pBusinessLogicEntity.init();
})();
