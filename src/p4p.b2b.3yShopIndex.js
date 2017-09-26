/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例 为您推荐]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
	params_p4p:{ sys: 'detail3y',bus:'p4p' },
	/**
	 * [keyword 关键字]
	 * @type {Object}
	 */
	keyword: (window.keywordNew || $.trim($("title:eq(0)").text()) || ""),

	/**
	 * [referrer 来源]
	 * @type {Number}
	 */
	referrer: 7,

	/**
	 * [clickableElementSelector 点击计费元素选择器]
	 * @type {String}
	 */
	clickableElementSelector: 'li[data-p4p-mark] a',

	/**
	 * [wrap 广告位包裹元素]
	 * @type {Object}
	 */
	wrap: $("#forRecommend"),

	/**
	 * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
	 * @type {String}
	 */
	template: '',

	/**
	 * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
	 * @type {[type]}
	 */
	cache: window.p4pbclist || {},

	/**
	 * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
	 * @param  {Object} element [被点击元素]
	 * @return {Number}         [数据缓存中的索引值]
	 */
	getClickElementCacheIndexCallback: function(element) {
		return element.closest('li').data('index');
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
		_prolist = _data.searchResultInfo || [];

	/* [创建以商机id的列表索引，以便于判断指定商机id是否存在于当前列表中]
	 */
	for (var i = 0; i < _prolist.length; i++) {
		_prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
	}

	/**
	 * [查找包裹元素中P4P商品DOM元素,若这些区域中的商品存在于数据集中,则绑定点击事件发送相关数据]
	 */
	_this.wrap.find("li").each(function(index, element) {
		var _elementEntity = $(element),
			_bcid = parseInt(_elementEntity.attr('data-p4p-bcid')) || 0,
			_bcindex = _prolist['bcid_' + _bcid.toString()];

		/**
		 * [若当前商品存在商机id，且该商机id存在于全局P4P数据集中，则在该元素上保存商机id、商机id位于P4P数据集中的索引值，并设置P4P商机标记。]
		 */
		if (_bcid) {
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
 * [监听渲染结束事件]
 * @param  {Object} targetElement [广告位元素]
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
	var _this = this;

	/**
	 * [绑定监测点点击事件]
	 */
	targetElement.on("click", 'a', function() {
		try {
			HC.UBA.sendUserlogsElement('UserBehavior_p4p_sy_freedetail_supplyself_2_tupian');
		} catch (ex) {}
	});
});


/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();


/**
 * [渲染 猜你喜欢 模块P4P内容，因该模块的数据延迟对象是在 DOMContentLoaded 事件中注册的，所以监听该延迟对象的解决状态也需要定义到 DOMContentLoaded 事件中]
 */
$(function() {

	/**
	 * [dataDeferred 获取数据延迟对象，若不存在直接返回]
	 * @type {Object}
	 */
	var dataDeferred = window.homeRelatedModDataDeferred;
	if (!dataDeferred) {
		return;
	}

	/**
	 * [在延迟对象被解决后，渲染 猜你喜欢 模块P4P内容]
	 */
	$.when(dataDeferred).done(function(data) {

		/**
		 * [_tempHTMLArray 临时模板HTML数组]
		 * @type {Array}
		 */
		var _tempHTMLArray = [
			'{{each products as product i}}',
			'<li data-index="{{i}}" style="display:none">',
			'    <a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_spsy_{{i+1}}_tupian&quot;)" title="{{product.searchResultfoTitle}}" href="{{product.searchResultfoUrl}}" target="_blank">',
			'        <img alt="{{product.searchResultfoTitle}}" name="{{product.searchResultfoTitle}}" src="{{product.searchResultfoImageBig}}" height="200" width="200">',
			'    </a>',
			'    <div class="A-title">',
			'        <a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_spsy_{{i+1}}_title&quot;)" title="{{product.searchResultfoTitle}}" href="{{product.searchResultfoUrl}}" target="_blank">{{product.searchResultfoTitle}}</a>',
			'    </div>',
			'    <div class="price red">{{product.pretreatPrice}}</div>',
			'</li>',
			'{{/each}}'
		];

		/**
		 * [homeRelatedModP4PBusinessLogicEntity 实例化P4P基础业务逻辑对象实例 猜你喜欢]
		 * @type {p4pBusinessLogic}
		 */
		var homeRelatedModP4PBusinessLogicEntity = new p4pBusinessLogic({
			params_p4p:{ sys: 'detail3y',bus:'p4p' },
			/**
			 * [keyword 关键字]
			 * @type {Object}
			 */
			keyword: (window.areaName || ""),

			/**
			 * [referrer 来源]
			 * @type {Number}
			 */
			referrer: 7,

			/**
			 * [clickableElementSelector 点击计费元素选择器]
			 * @type {String}
			 */
			clickableElementSelector: 'a,button',

			/**
			 * [wrap 广告位包裹元素]
			 * @type {Object}
			 */
			wrap: $('div[typenod="goods-ulList"] > ul'),

			/**
			 * [template 渲染模板HTML]
			 * @type {String}
			 */
			template: _tempHTMLArray.join(''),

			/**
			 * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
			 * @type {[type]}
			 */
			cache: data || {},

			/**
			 * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
			 * @param  {Object} element [被点击元素]
			 * @return {Number}         [数据缓存中的索引值]
			 */
			getClickElementCacheIndexCallback: function(element) {
				return element.closest('[data-index]').attr('data-index');
			}
		});

		/**
		 * [监听渲染结束事件]
		 * @param  {Object} targetElement [广告位元素]
		 */
		homeRelatedModP4PBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
			var _this = this;

			/**
			 * [使图片列表中的图片自适应]
			 */
			_this.resizeImage(targetElement.find('img'), function() {
				return $(this).closest('img');
			});
		});

		/**
		 * 开始P4P业务对象初始化
		 */
		homeRelatedModP4PBusinessLogicEntity.init();
	});
});