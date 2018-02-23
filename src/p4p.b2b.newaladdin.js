/**
 * Created by HC360 on 2017/8/31.
 */
var p4pBusinessLogic = require('./p4p.base');



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

//
p4pBusinessLogicEntity.addEventListener('onEndRender',function(targetElement){
   
    /**
     * [绑定监测点点击事件]
     */
    targetElement.on("click",".proRigImg a",function(){
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_aladdinTitle_landing_two_img');
        } catch (ex) {
            
        }
    });
    targetElement.on("click",".newName a",function(){
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_aladdinTitle_landing_two_title');
        } catch (ex) {
            
        }
    });

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
//UserBehavior_p4p_aladdinTitle_landing_hotsearch
p4pBusinesstopEntity.addEventListener('onEndRender',function(targetElement){
   
    /**
     * [绑定监测点点击事件]
     */
    targetElement.on("click",".p4pImg a",function(){
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_aladdinTitle_landing_hotsearch_img');
        } catch (ex) {
            
        }
    });
    targetElement.on("click",".p4pTit a",function(){
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_aladdinTitle_landing_hotsearch_title');
        } catch (ex) {
            
        }
    });
    targetElement.on("click",".p4pRig dt a",function(){
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_aladdinTitle_landing_hotsearch_comp');
        } catch (ex) {
            
        }
    });
 

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

