/**
 * Created by HC360 on 2017/8/31.
 */
var p4pBusinessLogic = require('./p4p.base'),
  templateEngine = require('template'),
  searchTemplate = [
    '<ul>',
    '{{each products as product i}}',
    '<li>',
    '<div class="proImg"><a href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank" title=""><img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}"></a></div>',
    '<div class="proBot">',
    '<dl>',
    '<dt><span class="seaNewPrice">{{#product.pretreatPrice}}</span></dt>',
    '<dd class="newName"><a href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank" title="{{product.searchResultfoTitle}}">{{#product.pretreatTitle}}</a></dd>',
    '<dd class="newCname"><p><a href="{{product.pretreatShopUrl}}" target="_blank" title="{{ product.searchResultfoCompany }}">{{ product.searchResultfoCompany }}</a></p>',
    '{{if (pretreatResultfoAs) }}',
    '<div class="newNameRight"><a href="//{{product.searchResultfoUserName}}.b2b.hc360.com/shop/mmtdocs.html" target="_blank" class="mmtIco" title="认证会员">{{product.searchResultfoMmtYearAge}}年</a></div>',
    '{{/if}}',
    '</dd>',
    '<dd class="newBotBox">',
    '<div class="nBotLeft"><div class="areaBox" title="{{product.pretreatArea}}"><span>{{product.pretreatArea}}</span></div>',
    '{{if (preSearchResultfoauthInfo) }}',
    '<a class="newIco100" title="企业信息真实性已认证" target="_blank" href="//{{product.searchResultfoUserName}}.b2b.hc360.com/shop/mmtdocs.html"></a>',
    '{{/if}}',
    '</div>',
    '{{if (product.searchResultfoQq!="") }}',
    '<div class="nBotRight"><a class="newQQIco" href="http://wpa.qq.com/msgrd?v=3&uin={{product.searchResultfoQq}}&site=qq&menu=yes" title="QQ交谈" ><em class="qqonline">&nbsp;</em></a></div>',
    '{{/if}}',
    '</dd>',
    '</dl>',
    '</div>',
    '</li>',
    '{{/each}}',
    '</ul>'
  ].join('');
/***
 * 转换价格，亿和万
 * @param price
 * @returns {string}
 */
function ConversionPrice(price) {
  var price = Number(price),
    ConvertList = [
      {unit: '万', measure: 10000},
      {unit: '亿', measure: 10000}
    ],
    shiftUnit = {};
  while ((ConvertList.length > 0) && price >= ConvertList[0].measure && (shiftUnit = ConvertList.shift())) {
    price = price / shiftUnit.measure
  }
  return price.toFixed(2) + (shiftUnit.unit || "")
}
/***
 * 调用自然搜索结果页，渲染商品列表左侧商机
 */
$.ajax({
  url: '//s.hc360.com/getmmtlast.cgi',
  data: {
    w: window.p4pkeyword,
    sys: 'aladdin',
    bus: 'bigtitlepage',
    e: 30,
    bt: 0
  },
  dataType: 'jsonp',
  jsonp: 'jsoncallback',
  success: function (data) {
    var  prolist=data.searchResultInfo,
      /**
       * [_tempRegExp 替换标题正则表达式对象]
       * @type {RegExp}
       */
      _tempRegExp = new RegExp(window.p4pkeyword, 'img');
    for (var i = 0; i < prolist.length; i++) {
      _tempEntity = prolist[i],


        //处理图片
        _tempEntity.searchResultfoImageBig = _tempEntity.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');

        //是否显示认证会员
        _tempEntity.pretreatResultfoAs = Number(_tempEntity.searchResultfoAs)>3&&Number(_tempEntity.searchResultfoMmtYearAge)!=0,
        _tempEntity.preSearchResultfoauthInfo = _tempEntity.searchResultfoauthInfo&&Number(_tempEntity.searchResultfoauthInfo)!=0,

        //标题关键字标红
        _tempEntity.pretreatTitle = _tempEntity.searchResultfoTitle.replace(_tempRegExp, '<span>' + window.p4pkeyword+ '</span>'),

        //公司链接地址
        _tempEntity.pretreatShopUrl = '//' + _tempEntity.searchResultfoUserName + '.b2b.hc360.com',

        // 价格
        _tempEntity.pretreatPrice = (parseFloat(_tempEntity.searchResultfoUnitPrice) === 0) ? '面议' : ('<s>&yen;</s>' + ConversionPrice(_tempEntity.searchResultfoUnitPrice) + ' &frasl;' + _tempEntity.searchResultfoMeasureUnit),

        //地区
        _tempEntity.pretreatArea = _tempEntity.searchResultfoZone ? ( _tempEntity.searchResultfoZone.replace('中国', '').replace(/:/g, ' ')) : '商家暂未提供';

    }

    var _template_params = {
        products: prolist || []
      },
      _template_render_html = templateEngine.render(searchTemplate)(_template_params);
    $('.proListLeft').html(_template_render_html);
  }
});


/**
 * [p4pBusinessLogicEntity 实例化右侧p4p示例对象]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
  params_p4p:{ sys: 'aladdin',bus:'p4p_title' },
  /**
   * [keyword 关键字]
   * @type {Object}
   */
  keyword: (window.p4pkeyword || ""),

  /**
   * [referrer 来源]
   * @type {Number}
   */
  referrer: 59,

  /**
   * [clickableElementSelector 点击计费元素选择器]
   * @type {String}
   */
  clickableElementSelector: 'a',

  /**
   * [wrap 广告位包裹元素]
   * @type {Object}
   */
  wrap: $(".proListRig"),

  /**
   * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
   * @type {String}
   */
  template: '',

  /**
   * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
   * @type {[type]}
   */
  cache: {searchResultInfo: window.p4pbclist} || {},

  /**
   * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
   * @param  {Object} element [被点击元素]
   * @return {Number}         [数据缓存中的索引值]
   */
  getClickElementCacheIndexCallback: function (element) {
    return element.closest('li').data('index');
  }
});

/**
 * [监听数据就绪事件]
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
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

  /* [创建以商机id的列表索引，以便于判断指定商机id是否存在于当前列表中]
   */
  for (var i = 0; i < _prolist.length; i++) {
    _prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
  }

  /**
   * [查找包裹元素中P4P商品DOM元素,若这些区域中的商品存在于数据集中,则绑定点击事件发送相关数据]
   */
  _this.wrap.find("li").each(function (index, element) {
    var _elementEntity = $(element),
      _bcid = parseInt(_elementEntity.attr('data-p4p-bcid')) || 0,
      _bcindex = _prolist['bcid_' + _bcid.toString()];

    /**
     * [若当前商品存在商机id，且该商机id存在于全局P4P数据集中，则在该元素上保存商机id、商机id位于P4P数据集中的索引值，并设置P4P商机标记。]
     */
    if (_bcid && _bcindex >= 0) {
      _elementEntity.data({
        id: _bcid,
        index: _bcindex
      }).attr('data-p4p-mark', '');
    }
  });

  /**
   * [target 初始化P4P广告位包裹元素，将只对该包裹元素下的可点击计费元素进行事件绑定]
   * @type {Object}
   */
  _this.target = _this.wrap.find('[data-p4p-mark]');
});


/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();


/**
 * [p4pBusinesstopEntity 实例化顶部切换产品热搜词p4p对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinesstopEntity = new p4pBusinessLogic({
  params_p4p:{ sys: 'aladdin',bus:'p4p_title' },
  /**
   * [keyword 关键字]
   * @type {Object}
   */
  keyword: (window.p4pkeyword || ""),

  /**
   * [referrer 来源]
   * @type {Number}
   */
  referrer: 60,

  /**
   * [clickableElementSelector 点击计费元素选择器]
   * @type {String}
   */
  clickableElementSelector: 'a',

  /**
   * [wrap 广告位包裹元素]
   * @type {Object}
   */
  wrap: $("[node-name='p4pTopBox']"),

  /**
   * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
   * @type {String}
   */
  template: '',


  /**
   * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
   * @type {[type]}
   */
  cache: {searchResultInfo: window.goodlist} || {},

  /**
   * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
   * @param  {Object} element [被点击元素]
   * @return {Number}         [数据缓存中的索引值]
   */
  getClickElementCacheIndexCallback: function (element) {
    return element.closest('div.p4pListCon').index();
  }
});

/**
 * [监听数据就绪事件]
 */
p4pBusinesstopEntity.addEventListener('onDataReady', function (data) {
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

  /* [创建以商机id的列表索引，以便于判断指定商机id是否存在于当前列表中]
   */
  for (var i = 0; i < _prolist.length; i++) {
    _prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
  }

  /**
   * [查找包裹元素中P4P商品DOM元素,若这些区域中的商品存在于数据集中,则绑定点击事件发送相关数据]
   */
  _this.wrap.find("div.p4pListCon").each(function (index, element) {
    var _elementEntity = $(element),
      _bcid = parseInt(_elementEntity.attr('data-p4p-bcid')) || 0,
      _bcindex = _prolist['bcid_' + _bcid.toString()];

    /**
     * [若当前商品存在商机id，且该商机id存在于全局P4P数据集中，则在该元素上保存商机id、商机id位于P4P数据集中的索引值，并设置P4P商机标记。]
     */
    if (_bcid && _bcindex >= 0) {
      _elementEntity.data({
        id: _bcid,
        index: _bcindex
      }).attr('data-p4p-top', '');
    }
  });

  /**
   * [target 初始化P4P广告位包裹元素，将只对该包裹元素下的可点击计费元素进行事件绑定]
   * @type {Object}
   */
  _this.target = _this.wrap.find('[data-p4p-top]');
});


/***
 * [p4pBusinesstopEntity 实例化顶部从百度进来页面的P4P对象]
 */
var p4pBusinessformBaidu = new p4pBusinessLogic({
  params_p4p:{ sys: 'aladdin',bus:'p4p_title' },
  /**
   * [keyword 关键字]
   * @type {Object}
   */
  keyword: (window.p4pkeyword || ""),

  /**
   * [referrer 来源]
   * @type {Number}
   */
  referrer: 42,

  /**
   * [wrap 广告位包裹元素]
   * @type {Object}
   */
  wrap: $("[node-name='p4pTopBox']"),

  /**
   * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
   * @type {String}
   */
  template: '',


  /**
   * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
   * @type {[type]}
   */
  cache: {searchResultInfo: window.goodlist} || {},

  /**
   * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
   * @param  {Object} element [被点击元素]
   * @return {Number}         [数据缓存中的索引值]
   */
  getClickElementCacheIndexCallback: function (element) {
    return element.closest('div.p4pListCon').index();
  }
});


/***
 * [p4pBusinesstopEntity 实例化顶部从百度进来页面的P4P对象]
 */
var p4pBusinessformSouGou = new p4pBusinessLogic({
  params_p4p:{ sys: 'aladdin',bus:'p4p_title' },
  /**
   * [keyword 关键字]
   * @type {Object}
   */
  keyword: (window.p4pkeyword || ""),

  /**
   * [referrer 来源]
   * @type {Number}
   */
  referrer: 62,

  /**
   * [wrap 广告位包裹元素]
   * @type {Object}
   */
  wrap: $("[node-name='p4pTopBox']"),

  /**
   * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
   * @type {String}
   */
  template: '',


  /**
   * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
   * @type {[type]}
   */
  cache: {searchResultInfo: window.goodlist} || {},

  /**
   * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
   * @param  {Object} element [被点击元素]
   * @return {Number}         [数据缓存中的索引值]
   */
  getClickElementCacheIndexCallback: function (element) {
    return element.closest('div.p4pListCon').index();
  }
});

/**
 * 如果是切换产品热搜词，初始化P4P业务点击扣费和曝光，referr是60，
 * 如果是从百度进入页面，刘涵扣费，referr是42，前段发曝光是42
 * 如果是搜狗进来，刘涵扣费，referr是62， 前端加62曝光
 */
if(window.datap4p == 'true'){
  //切换产品热搜词
  p4pBusinesstopEntity.init();
}else if(window.datap4p == 'false'){
    if(window.isSouGou=='true'){
      //搜狗来源
      p4pBusinessformSouGou.init();
    }else {
      //百度来源
      p4pBusinessformBaidu.init();
    }

}

