/**
 * Created by HC360 on 2017/7/26.
 */

 var p4pBusinessLogic = require('./p4p.base');

var _keyword = ["LED防爆灯","LED交通信号灯","RFID标签","安防电缆厂家","安防机柜","安防门禁","安防外壳","安防外壳厂家","安防线缆","按钮开关","包装成型机","报警器","玻璃厂家","超市防盗门","车底检测仪","车牌识别厂家","触摸广告机","触摸屏","触摸屏厂家","触摸一体机","道路监控立杆","电磁屏蔽机柜","电加热管","电视墙厂家","电源线","电子围栏","对讲门禁","钢结构厂房","岗亭厂家","高清广告机","高清监视器","光纤","光纤光缆","广告机","户外广告机","机柜批发","监控电视墙","监控立杆厂家","监控台","监视器","金属探测安检门","金属探测器","酒店锁","酒店一体机","酒店智能锁","可视门禁","空气加热器","控制台","立杆","立式广告机"];

var p4pBusinessLogicEntity = new p4pBusinessLogic({
    params_p4p:{ sys: 'other',bus:'p4p_reco' },
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: _keyword[parseInt(Math.random()*49)]||'',

    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 50,

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [cache 数据缓存]
     * @type {Object}
     */
    cache: null,

    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $('#limitgou .limit_block'),

    /**
     * [autoSendExpoData 是否自动发送曝光数据]
     * @type {Boolean}
     */
    autoSendExpoData: true,

    /**
     * [targetRenderCallback 广告位元素渲染到页面的回调函数]
     * @param  {Object} targetHTML [广告位元素]
     */
    targetRenderCallback: function(targetHTML) {
        var _this = this;
        return $(targetHTML).prependTo(_this.wrap);
    }
});
p4pBusinessLogicEntity.addEventListener('onDataReady',function(data){
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
    
    /***
     * 过滤优质的P4P数据
     */
    _prolist=$.map(_prolist,function (product) {
        if (Number(product.searchResultfoIsRecomHQ) === 1) {
            return product;
        }
    }),

    /**
     * [_tempHTMLArray 临时HTML数组]
     * @type {Array}
     */
    _tempHTMLArray = [
        '<ul class="b2b_p4p_mac">',
        '{{each products as product i}}',
        '<li data-index="{{i}}">',
        '<a target="_blank" href="{{ product.searchResultfoUrl }}" title="{{ product.searchResultfoTitle }}">',
        '<p>{{ product.searchResultfoTitle }}</p>',
        '<img src="{{ product.searchResultfoImageBig }}" height="180" width="180" alt="{{ product.searchResultfoTitle }}" title="{{ product.searchResultfoTitle }}">',
        '</a>',
        '</li>',
        '{{/each}}',
        '</ul>'
    ],
      
    /**
     * [_limit P4P广告位数量上限]
     * @type {Number}
     */
    _limit = 6;

    /**
     * [根据P4P广告位数量上限截取P4P数据]
     */
    _prolist.splice(_limit,_prolist.length);
    console.info(_prolist.length);
    /**
     * [P4P广告位数量不够显示一行时]
     */
    if (_prolist.length < _limit) {
        _this.template = '';
        $("#limitgou").show();
        return;
    }

    _data.searchResultInfo = _prolist;
    /**
     * [template 设置模板HTML]
     * @type {String}
     */
    _this.template = _tempHTMLArray.join('');

});
p4pBusinessLogicEntity.addEventListener('onEndRender',function(targetElement){
    var _this = this;
    /**
     * [绑定监测点点击事件]
     */
    targetElement.on("click","a",function(){
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_anfang_recommend');
        } catch (ex) {
            
        }
    });
    $("#limitgou").show();
    $("#limitgou .limit_block ul:eq(1)").hide();
    $("#limitgou .limit_block .b2b_p4p_mac li:eq(0)").attr("class","w198");
    $("#limitgou .limit_block ul:eq(0) img").css("margin","auto");
   _this.wrap.show();
   

});
p4pBusinessLogicEntity.init();

//p4pProList

var keyword_ = [],
    key_word = [],
    omgword = [],
    allobject = {},
    mun = 0,
    keyword_ = [],
    reg = /[\u4e00-\u9fa5]{1,}/g;
$(".categoryhd h2").each(function(){
    if(keyword_.length<6){
        keyword_.push($(this).html().match(reg).join(","));
    }  
})
$(".categoryhd .catelink a").each(function(){
    key_word.push($(this).html());   
})
for(var v = 0 ; v < 6; v ++){
    allobject[v] = omgword.concat(keyword_[v],key_word.slice(mun,mun+6));
    mun+=6;
}
allobject[2][0] = keyword_[2].substring(5,11);
allobject[2].unshift(keyword_[2].substring(0,4));

var templateHtml = [
    '<ul class="p4p_wocuo">',
    '{{ each products as product i }}',
    '<li>',
    '<div class="txtCon">',
    '<p class="txt1"><a href="{{ product.searchResultfoUrl }}" target="_blank" title="{{ product.searchResultfoTitle }}">{{ product.searchResultfoTitle }}</a></p>',
    '<p class="txt2"><a href="{{ product.searchResultfoUrl }}" target="_blank" title="{{ product.searchResultfoTitle }}">{{ product.searchkeywordone }}</a></p>',
    '<p class="price">&yen;{{ product.searchResultfoUnitPrice }}</p>',
    '</div>',
    '<div class="imgCon">',
    '<a href="{{ product.searchResultfoUrl }}" target="_blank"><img src="{{ product.searchResultfoImageBig }}" title="{{ product.searchResultfoTitle }}"/></a>',
    '</div>',
    '</li>',
    '{{/each}}',
    '</ul>'
],
wrap_ = $('.cate-content .category_pic');

function getData(_arr){
            var _deferred=$.Deferred();

            function getP4PData(_keywords){
                var p4pResult = {},
                    limit = 6;
                if(_keywords.length<=0){
                    _deferred.resolve(p4pResult);
                    return;
                }
                var wordkey = _keywords.shift();

                $.ajax({
                    url: '//s.hc360.com/getmmtlast.cgi',
                    data: {
                        source: 3,
                        w: wordkey,
                        mc: 'seller',
                        sys: 'ls',
                        p4p: '1'
                    },
                    dataType: 'jsonp',
                    jsonp: 'jsoncallback'
                }).done(function (data) {
                    var _data = data;
                    if (_data.searchResultInfo.length > 0) {
                        for(var k = 0; k < _data.searchResultInfo.length ;k++){
                            _data.searchResultInfo[k]["searchkeywordone"] = wordkey;
                        }
                        _data.searchResultInfo = _data.searchResultInfo.splice(0, limit);
                        p4pResult = _data;
                    }
                }).always(function(){                  
                    
                        if (p4pResult.hasOwnProperty("searchResultInfo") && p4pResult.searchResultInfo.length == limit) { 
                            
                            _deferred.resolve(p4pResult);
                        }else if( _keywords.length == 0 ){
                                  
                            _deferred.resolve(p4pResult);
                        }else{
                            
                            getP4PData(_keywords);
                        }
                    
                    
                });
            }

            getP4PData(_arr);

            return _deferred;
        }
        

        var _deferreds=[];
        for(var _index in allobject){
            if(allobject.hasOwnProperty(_index)){
                _deferreds.push(
                    getData(allobject[_index])
                )
            }
        }

    $.when.apply(null,_deferreds).done(function(){
       
        var p4pData = $.extend(true, {}, arguments),
            limit = 6;
       
        for(var r in p4pData){
            /**
             * 初始化P4P实例对象
             */
            
            var p4pEntity = new p4pBusinessLogic({
                /***
                 * 关键词
                 */
                keyword: p4pData[r].searchResultInfo[0].searchkeywordone,
                /***
                 * 广告包裹元素
                 */
                wrap: wrap_[r],
                /***
                 * p4p来源
                 */
                referrer: 50,
                /***
                 * 模板
                 */
                template: templateHtml.join(''),

                /***
                 * 点击计费元素选择器
                 */
                clickableElementSelector: 'a',

                cache: p4pData[r],

                
                /**
                 * [targetRenderCallback 广告位元素渲染到页面的回调函数]
                 * @param  {Object} targetHTML [广告位元素]
                 */
                targetRenderCallback: function (targetHTML) {
                    var _this = this;
                    return $(targetHTML).prependTo(_this.wrap);
                },

            });

            /**
             * [监听渲染结束事件]
             * @param  {Object} targetElement [广告位元素]
             */
            p4pEntity.addEventListener('onEndRender', function (targetElement) {
                var that = this;
    
                /**
                 * [绑定监测点点击事件]
                 */
                targetElement.on("click", 'a', function () {

                    try {
                        HC.UBA.sendUserlogsElement('UserBehavior_p4p_anfang_recommend');
                    } catch (ex) {
                    }
                });

                
                    if (that.cache.prolist.length == limit) {
                        $(".partnone:eq(" + r + ")").hide();
                        $(".category_pic:eq(" + r + ")").addClass("p4pProList");    
                    }else{
                        $(".p4p_wocuo:eq(" + r + ")").hide();
                    }
                
                

            });
            p4pEntity.init();
        }
    });