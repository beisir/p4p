/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [监听DOMContentLoaded事件，初始化P4P业务逻辑对象]
 */
$(function() {

	/**
	 * [wrapPrevP4P 广告位包裹元素上方的百度网盟广告位包裹元素]
	 * @type {Object}
	 */
	var wrapPrevP4P = $('[data-prev-p4p]:first');

	/**
	 * 隐藏HOT商品模块
	 */
	$('#flowboxtr').hide();

	/**
	 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
	 * @type {p4pBusinessLogic}
	 */
	var p4pBusinessLogicEntity = new p4pBusinessLogic({

		/**
		 * [keyword 关键字]
		 * @type {Object}
		 */
		keyword: $("[data-p4p-keyword]:first").val() || '',

		/**
		 * [referrer 来源]
		 * @type {Number}
		 */
		referrer: 4,

		/**
		 * [clickableElementSelector 点击计费元素选择器]
		 * @type {String}
		 */
		clickableElementSelector: 'li.box1Con a',

		/**
		 * [wrap 广告位包裹元素]
		 * @type {Object}
		 */
		wrap: function() {

			/**
			 * 在指定位置创建包裹元素
			 */
			return $('<div>').insertAfter(wrapPrevP4P);
		},

		/**
		 * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
		 * @param  {Object} element [被点击元素]
		 * @return {Number}         [数据缓存中的索引值]
		 */
		getClickElementCacheIndexCallback: function(element) {
			return element.closest('li.box1Con').index();
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
			 * [_limit 展示P4P广告位数量上限]
			 * @type {Number}
			 */
			_limit = 5;

		/**
		 * [若不存在P4P数据，则显示百度网盟广告位包裹元素]
		 */
		if (!_prolist.length) {
			wrapPrevP4P.show();
			return;
		}

		/**
		 * 若存在P4P数据，则清空百度网盟广告位包裹元素
		 */
		wrapPrevP4P.empty();

		/**
		 * 根据展示P4P广告位数量上限截取数据
		 */
		_prolist.splice(_limit, _prolist.length);

		/**
		 * [logrecord_channel_identifier 获取频道用户行为分析的标识符]
		 * @type {[type]}
		 */
		var logrecord_channel_identifier = _this.parseURL(document.location.href).segments[0] || '';
		logrecord_channel_identifier = logrecord_channel_identifier === 'cp' ? logrecord_channel_identifier : 'cp_' + logrecord_channel_identifier;

		/**
		 * [renderTemplateSet 渲染模板器集合，key分别对应渲染相应商品数量]
		 * @type {Object}
		 */
		var renderTemplateSet = {
			1: function(data) {
				var _tempHTMLArray = [
					'<div class="bwBoxCon">',
					'<div class="bwBox1">',
					'<ul>',
					'{{each products as product i}}',
					'	<li class="box1Con">',
					'		<div class="bImgBox">',
					'			<em>优质</em>',
					'			<a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')"><img src="{{product.searchResultfoImageBig}}"></a>',
					'		</div>',
					'		<div class="bwBox1List">',
					'			<div class="bwBox1Title">',
					'				<em>优质</em>',
					'				<h2><a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">{{#product.pretreatTitle}}</a></h2>',
					'				<a title="优质" class="newYZIco">优质</a>',
					'				<a title="开关拼实惠" class="newIco3">促</a>',
					'				{{if product.pretreatIsTrade}}<a title="在线交易" class="newIco4">交易</a>{{/if}}',
					'				{{if product.searchResultfoQq}}<a title="在线咨询" class="newQQIco" href="//wpa.qq.com/msgrd?v=3&uin={{product.searchResultfoQq}}&site=qq&menu=yes">交易</a>{{/if}}',
					'			</div>',
					'			<div class="rightCon">',
					'				<div class="bwParameter">',
					'					<ul>',
					'						{{each product.pretreatAttrs as attr j}}',
					'							<li class="">{{attr.name}}：<span>{{attr.value}}</span></li>',
					'						{{/each}}',
					'					</ul>',
					'				</div>',
					'				<div class="bwBox1Price">',
					'					<div class="p4pPrice"><span>商品价格：</span>{{product.pretreatPrice}}</div>',
					'					<div class="bwBox1Bot">供应商：<a href="{{product.pretreatShopUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">{{product.searchResultfoCompany}}</a></div>',
					'				</div>',
					'				<div class="bwBox1Btn">',
					'					<a href="{{product.pretreatShopUrl}}" class="itemBtn" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">进入商铺</a>',
					'					<a href="{{product.searchResultfoUrl}}" class="dBtn" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">查看详情</a>',
					'				</div>',
					'			</div>',
					'		</div>',
					'	</li>',
					'{{/each}}',
					'</ul>',
					'</div>',
					'</div>'
				];
				return _tempHTMLArray;
			},
			2: function(data) {
				var _tempHTMLArray = [
					'<div class="bwBoxCon">',
					'<div class="bwBox2">',
					'	<ul>',
					'		{{each products as product i}}',
					'		<li class="box1Con">',
					'			<div class="bImgBox">',
					'				<em>优质</em>',
					'				<a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')"><img src="{{product.searchResultfoImageBig}}"></a>',
					'			</div>',
					'			<div class="bwBox1List">',
					'				<div class="bwBox1Title">',
					'					<h2><a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">{{#product.pretreatTitle}}</a></h2>',
					'					<a title="优质" class="newYZIco">优质</a>',
					'					<a title="开关拼实惠" class="newIco3">促</a>',
					'					{{if product.pretreatIsTrade}}<a title="在线交易" class="newIco4">交易</a>{{/if}}',
					'					{{if product.searchResultfoQq}}<a title="在线咨询" class="newQQIco" href="//wpa.qq.com/msgrd?v=3&uin={{product.searchResultfoQq}}&site=qq&menu=yes">交易</a>{{/if}}',
					'				</div>',
					'				<div class="rightCon">',
					'					<div class="bwParameter">',
					'						<ul>',
					'							{{each product.pretreatAttrs as attr j}}',
					'								<li class="">{{attr.name}}：<span>{{attr.value}}</span></li>',
					'							{{/each}}',
					'						</ul>',
					'					</div>',
					'					<div class="bwBox2Price"><span>商品价格：</span>{{product.pretreatPrice}}</div>',
					'					<div class="bwBox1Bot">供应商：<a href="{{product.pretreatShopUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">{{product.searchResultfoCompany}}</a>',
					'					</div>',
					'				</div>',
					'				<div class="bwBox2Btn">',
					'					<a href="{{product.pretreatShopUrl}}" class="itemBtn" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">进入商铺</a>',
					'					<a href="{{product.searchResultfoUrl}}" class="dBtn" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">查看详情</a>',
					'				</div>',
					'				<div class="bwHide" style="display: none;">',
					'					<div class="bwHideCon">',
					'						<dl>',
					'							<dt><h3>优质推荐</h3></dt>',
					'							<dd><a href="{{product.searchResultfoUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_big_1_tupian\')">{{#product.pretreatTitle}}</a></dd>',
					'						</dl>',
					'						<p>{{product.pretreatPrice}}</p>',
					'					</div>',
					'					<div class="bwBg"></div>',
					'				</div>',
					'			</div>',
					'		</li>',
					'		{{/each}}',
					'	</ul>',
					'</div>',
					'</div>'
				];
				return _tempHTMLArray;
			},
			3: function(data) {
				var _tempHTMLArray = [
					'<div class="bwBoxCon">',
					'<div class="bwBox3">',
					'	<ul>',
					'		{{each products as product i}}',
					'		<li class="box1Con">',
					'			<div class="bImgBox">',
					'				<em>优质</em>',
					'				<a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')"><img src="{{product.searchResultfoImageBig}}"></a>',
					'			</div>',
					'			<div class="bwBox1List">',
					'				<div class="bwBox1Title">',
					'					<h2><a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{#product.pretreatTitle}}</a></h2>',
					'				</div>',
					'				<div class="rightCon">',
					'					<div class="bwParameter">',
					'						<ul>',
					'							{{each product.pretreatAttrs as attr j}}',
					'								<li>{{attr.name}}：<span>{{attr.value}}</span></li>',
					'							{{/each}}',
					'						</ul>',
					'					</div>',
					'			  		<div class="bwBox2Price">',
					'						<span>商品价格：</span>{{product.pretreatPrice}}',
					'			  		</div>',
					'			  		<div class="bwBox1Bot">',
					'						供应商：<a href="{{product.pretreatShopUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{product.searchResultfoCompany}}</a>',
					'			  		</div>',
					'			  	</div>',
					'			  	<div class="bwHide" style="display: none;">',
					'					<div class="bwHideCon">',
					'						<dl>',
					'							<dt><h3>优质推荐</h3></dt>',
					'							<dd><a href="{{product.searchResultfoUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{#product.pretreatTitle}}</a></dd>',
					'						</dl>',
					'						<p>{{product.pretreatPrice}}</p>',
					'					</div>',
					'					<div class="bwBg"></div>',
					'				</div>',
					'			</div>',
					'		</li>',
					'		{{/each}}',
					'	</ul>',
					'</div>',
					'</div>'
				];
				return _tempHTMLArray;
			},
			4: function(data) {
				var _tempHTMLArray = [
					'<div class="bwBoxCon">',
					'<div class="bwBox4">',
					'	<ul>',
					'		{{each products as product i}}',
					'		<li class="box1Con">',
					'			<div class="bImgBox">',
					'				<em>优质</em>',
					'				<a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')"><img src="{{product.searchResultfoImageBig}}"></a>',
					'			</div>',
					'			<div class="bwBox1List">',
					'				<div class="bwBox1Title">',
					'					<h2><a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{#product.pretreatTitle}}</a></h2>',
					'				</div>',
					'				<div class="rightCon">',
					'					<div class="bwBox2Price">',
					'						<span>商品价格：</span>{{product.pretreatPrice}}',
					'					</div>',
					'					<div class="bwBox1Bot">供应商：<a href="{{product.pretreatShopUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{product.searchResultfoCompany}}</a></div>',
					'				</div>',
					'				  <div class="bwHide" style="display: none;">',
					'					<div class="bwHideCon">',
					'						<dl>',
					'							<dt><h3>优质推荐</h3></dt>',
					'							<dd><a href="{{product.searchResultfoUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{#product.pretreatTitle}}</a></dd>',
					'						</dl>',
					'						<p> {{product.pretreatPrice}}</p>',
					'					</div>',
					'					<div class="bwBg"></div>',
					'				</div>',
					'			</div>',
					'		</li>',
					'		{{/each}}',
					'	</ul>',
					'</div>',
					'</div>'
				];
				return _tempHTMLArray;
			},
			5: function(data) {
				var _tempHTMLArray = [
					'<div class="bwBoxCon">',
					'<div class="bwBox5">',
					'	<ul>',
					'		{{each products as product i}}',
					'		<li class="box1Con">',
					'			<div class="bImgBox">',
					'				<em>优质</em>',
					'				<a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')"><img src="{{product.searchResultfoImageBig}}"></a>',
					'			</div>',
					'			<div class="bwBox1List">',
					'				<div class="bwBox1Title">',
					'					<h2><a href="{{product.searchResultfoUrl}}" target="_blank" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{#product.pretreatTitle}}</a></h2>',
					'				</div>',
					'				<div class="rightCon">',
					'					<div class="bwBox2Price">',
					'						<span>商品价格：</span>{{product.pretreatPrice}}',
					'					</div>',
					'				</div>',
					'				  <div class="bwHide" style="display: none;">',
					'					<div class="bwHideCon">',
					'						<dl>',
					'							<dt><h3>优质推荐</h3></dt>',
					'							<dd><a href="{{product.searchResultfoUrl}}" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_p4p_' + logrecord_channel_identifier + '_1_tupian\')">{{product.searchResultfoTitle}}</a></dd>',
					'						</dl>',
					'						<p> {{product.pretreatPrice}}</p>',
					'					</div>',
					'					<div class="bwBg"></div>',
					'				</div>',
					'			</div>',
					'		</li>',
					'		{{/each}}',
					'	</ul>',
					'</div>',
					/**
					 * [在P4P商品数据小于广告位数量上限时，填充百度网盟广告位包裹元素]
					 * @type {String}
					 */
					'{{if products.length < ' + _limit + ' }}<div id="DOMBUA"></div>{{/if}} ',
					'</div>'
				];
				return _tempHTMLArray;
			}
		};

		/**
		 * [template 设置模板HTML，这里一直显示显示最多数量商品的模板是后续需求修改，填充少于最多数量商品时，会通过异步添加百度网盟广告的方式补全广告位]
		 * @type {String}
		 */
		_this.template = renderTemplateSet[5]().join('');
	});

	/**
	 * [监听渲染结束事件]
	 * @param  {Object} targetElement [广告位元素]
	 */
	p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
		var _this = this,

			/**
			 * [_limit 展示P4P广告位数量上限]
			 * @type {Number}
			 */
			_limit = 5;

		/**
		 * [绑定元素事件]
		 */
		targetElement.on('mouseover', ".bwBox1,.bwBox2 ul li,.bwBox3 ul li,.bwBox4 ul li,.bwBox5 ul li", function() {
			$(this).addClass("bwHover");
		}).on('mouseout', ".bwBox1,.bwBox2 ul li,.bwBox3 ul li,.bwBox4 ul li,.bwBox5 ul li", function() {
			$(this).removeClass("bwHover");
		}).on('mouseenter', '.box1Con .bImgBox', function() {
			$(this).parent().find('.bwHide').slideDown(100);
			$(this).find('em').hide(10);
		}).on('mouseleave', ".box1Con", function() {
			$(this).find('.bwHide').slideUp(100);
			$(this).find('em').show(10);
		});

		/**
		 * [若实际展示的P4P广告位数量大于广告位数量上限，则不进行后续的百度网盟广告不全逻辑]
		 */
		if (_this.cache.prolist.length >= _limit) {
			return;
		}

		/**
		 * [百度网盟广告数量、微门户频道映射关系]
		 * @type {Object}
		 */
		var baiduADMapping = {
			comp: {
				'1': 'u2800838',
				'2': 'u2792668',
				'3': 'u2792671',
				'4': 'u2792672'
			},
			cp: {
				'1': 'u2800834',
				'2': 'u2792637',
				'3': 'u2792651',
				'4': 'u2792666'
			},
			price: {
				'1': 'u2800861',
				'2': 'u2792687',
				'3': 'u2792690',
				'4': 'u2792693'
			},
			pic: {
				'1': 'u2800867',
				'2': 'u2792704',
				'3': 'u2792708',
				'4': 'u2792710'
			},
			hots: {
				'1': 'u2801561',
				'2': 'u2792727',
				'3': 'u2792734',
				'4': 'u2792740'
			}
		};

		/**
		 * [pathname 判断当前页面对应的频道]
		 * @type {String}
		 */
		var pathname = window.location.pathname;
		if (pathname.indexOf('/comp/') != -1) {
			pathname = 'comp';
		} else if (pathname.indexOf('/cp/') != -1) {
			pathname = 'cp';
		} else if (pathname.indexOf('/price/') != -1) {
			pathname = 'price';
		} else if (pathname.indexOf('/pic/') != -1) {
			pathname = 'pic';
		} else {
			pathname = 'hots';
		}

		/**
		 * [异步加载相应广告位]
		 */
		baiduADMapping[pathname][_this.cache.prolist.length] && $.getScript("//cbjs.baidu.com/js/m.js", function() {
			BAIDU_CLB_fillSlotAsync(baiduADMapping[pathname][_this.cache.prolist.length], "DOMBUA");
		});
	});

	/**
	 * 开始P4P业务对象初始化
	 */
	p4pBusinessLogicEntity.init();
});