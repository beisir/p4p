//M站点击流 
var p4pBusinessLogic = require('./p4p.base');

var _keyword = $("#p4pKeyword").val();
if(_keyword==""){
    $(".tjPro").hide();
}else{



var p4pBusinessLogicEntity = new p4pBusinessLogic({
    
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: _keyword,

    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 69,

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
    wrap: $('.tjPro'),

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
    // _prolist=$.map(_prolist,function (product) {
    //     if (Number(product.searchResultfoIsRecomHQ) === 1) {
    //         return product;
    //     }
    // }),

    /**
     * [_tempHTMLArray 临时HTML数组]
     * @type {Array}
     */
    _tempHTMLArray = [
        '<ul class="b2b_p4p_clickstream">',
        '{{each products as product i}}',
        '<li data-index="{{i}}">',
        '<a target="_blank" href="//m.hc360.com/supplyself/{{ product.searchResultfoId }}.html" title="{{ product.searchResultfoTitle }}">',
        '<div class="imgCon"><p><img src="{{ product.searchResultfoImageBig }}" alt="{{ product.searchResultfoTitle }}" title="{{ product.searchResultfoTitle }}"></p><span></span></div>',
        '<p class="til">{{ product.searchResultfoCompany }}</p><p class="price">&yen;{{ product.searchResultfoUnitPrice }}</p>',
        '</a>',
        '</li>',
        '{{/each}}',
        '</ul>'
    ],
      
    /**
     * [_limit P4P广告位数量上限]
     * @type {Number}
     */
    _limit = 3;

    /**
     * [根据P4P广告位数量上限截取P4P数据]
     */
    _prolist.splice(_limit,_prolist.length);
  
    /**
     * [P4P广告位数量不够显示一行时]
     */
    if (_prolist.length < _limit) {
        _this.template = '';
        $(".tjPro").hide();
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
            HC.UBA.sendUserlogsElement('');
        } catch (ex) {
            
        }
    });

   _this.wrap.show();
   $("#moreShopId").show();
   

});
p4pBusinessLogicEntity.init();
}