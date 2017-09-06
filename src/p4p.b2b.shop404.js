/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({

	/**
	 * [keyword 关键字]
	 * @type {Object}
	 */
	keyword: (window.HC && window.HC.getCookie && window.HC.getCookie("hclastsearchkeyword")) || 'undefined',

	/**
	 * [referrer 来源]
	 * @type {Number}
	 */
	referrer: 9,

	/**
	 * [clickableElementSelector 点击计费元素选择器]
	 * @type {String}
	 */
	clickableElementSelector: 'a,button',

	/**
	 * [wrap 广告位包裹元素]
	 * @type {Object}
	 */
	wrap: $("#highQualityList"),

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
		return $(targetHTML).prependTo(this.wrap);
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
			'<li data-index="{{i}}">',
			'    <p class="pro_p">',
			'        <a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_404_{{i+1}}_tupian&quot;) title="{{product.searchResultfoTitle}}" href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html">',
			'            <img alt="{{product.searchResultfoTitle}}" src="{{product.searchResultfoImageBig}}" width="180">',
			'        </a>',
			'    </p>',
			'    <h4>',
			'        <a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_404_{{i+1}}_title&quot;) href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">{{product.searchResultfoTitle}}</a>',
			'    </h4>',
			'    <p class="pro_price">价格：<span>{{product.pretreatPrice}}</span></p>',
			'</li>',
			'{{/each}}'
		],

		/**
		 * [_limit P4P广告位数量上限]
		 * @type {Number}
		 */
		_limit = 5;

	/**
	 * [根据P4P广告位数量上限截取P4P数据]
	 */
	_prolist.splice(_limit, _prolist.length);

	/**
	 * [template 设置模板HTML]
	 * @type {String}
	 */
	_this.template = _tempHTMLArray.join('');

	/**
	 * [_tempHTMLArray 补全数据HTML]
	 * @type {Array}
	 */
	_tempHTMLArray = [
		'<li><p class="pro_p"><a title="无线电视采购 夏普60英寸" href="//b2b.hc360.com/supplyself/411422862.html" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');"><img  alt="无线电视采购 夏普60英寸" src="//img009.hc360.cn/m3/M03/3E/B1/wKhQ5lTaxsOEX2p9AAAAAEqSH10518.jpg..210x210.jpg" width="180"></a></p><h4><a href="//b2b.hc360.com/supplyself/411422862.html" title="无线电视采购 夏普60英寸" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');">无线电视采购 夏普60英寸</a></h4><p class="pro_price">价格：<span>12699 </span></p></li>',
		'<li><p class="pro_p"><a title="展厅布置" href="//b2b.hc360.com/supplyself/342998421.html" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');"><img  alt="展厅布置" src="//img009.hc360.cn/m1/M02/C2/FD/wKhQb1RkFUGEPaPdAAAAADvAhmc065.jpg..210x210.jpg" width="180"></a></p><h4><a href="//b2b.hc360.com/supplyself/342998421.html" title="展厅布置" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');">展厅布置</a></h4><p class="pro_price">价格：<span>800</span></p></li>',
		'<li><p class="pro_p"><a title="接线板、厂家批发三柱接线板及其他仪表配件" href="//b2b.hc360.com/supplyself/488629080.html" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');"><img alt="接线板、厂家批发三柱接线板及其他仪表配件" src="//img004.hc360.cn/m6/M05/FE/87/wKhQolYCIb2Ebq03AAAAAFb6E58810.jpg..210x210.jpg" width="180"></a></p><h4><a href="//b2b.hc360.com/supplyself/409067302.html" title="接线板、厂家批发三柱接线板及其他仪表配件" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');">接线板、厂家批发三柱接线板及其他仪表配件</a></h4><p class="pro_price">价格：<span>1</span></p></li>',
		'<li><p class="pro_p"><a title="聚乙再生颗粒 塑料聚乙烯再生颗粒" href="//b2b.hc360.com/supplyself/410220025.html" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');"><img alt="聚乙再生颗粒 塑料聚乙烯再生颗粒" src="//img006.hc360.cn/m4/M04/81/66/wKhQ6FTK8tOEOn_IAAAAAK8YcHk658.jpg..210x210.jpg" width="180"></a></p><h4><a href="//b2b.hc360.com/supplyself/501136350.html" title="聚乙再生颗粒 塑料聚乙烯再生颗粒" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');">聚乙再生颗粒 塑料聚乙烯再生颗粒</a></h4><p class="pro_price">价格：<span>1000</span></p></li>',
		'<li><p class="pro_p"><a title="凯翼C3（价格面议）" href="//b2b.hc360.com/supplyself/408998051.html" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_404_product\');"><img  alt="凯翼C3（价格面议·。）" src="//img007.hc360.cn/m3/M06/D8/DA/wKhQ51TAw1qEXdf1AAAAAE655DA495.jpg..210x210.jpg" width="180"></a></p><h4><a href="//b2b.hc360.com/supplyself/496320955.html" title="凯翼C3（价格面议·。） onclick=" hc.uba.senduserlogselement(&#39;userbehavior_404_product&#39;)">本厂长期批发不锈钢球体毛坯、球体毛胚|.小口径球体毛坯批发，冲压球体毛坯厂家</a></h4><p class="pro_price">价格：<span>48800</span></p></li>'
	];

	/**
	 * 根据P4P广告位数量上限、P4P数据记录数补全数据
	 */
	_this.wrap.append(_tempHTMLArray.slice(0, (_limit - _prolist.length)).join(''));
});

/**
 * [监听渲染结束事件]
 * @param  {Object} targetElement [广告位元素]
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
	var _this = this;

	/**
	 * [使图片列表中的图片自适应]
	 */
	_this.resizeImage(targetElement.find('img'), function() {
		return $(this).closest('p.pro_p');
	});
});

/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();