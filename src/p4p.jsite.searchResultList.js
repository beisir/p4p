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
	 * [pageIndexElement 当前页码]
	 * @type {[type]}
	 */
	var pageIndexElement = $('#keywordPageNum');

	/**
	 * [若不存在页码元素，则不执行p4p业务]
	 */
	if (!(pageIndexElement.length > 0)) {
		return;
	}

	/**
	 * [若当前页码不等于1，则不执行p4p业务]
	 */
	if (Number(pageIndexElement.val()) != 1) {
		return;
	}

	/**
	 * [htmlTemplate p4p、极度标王商品模板集合]
	 * @type {Object}
	 */
	var htmlTemplate = {

			/**
			 * [htmlTemplateArray 拼接当前页面p4p商品模板]
			 * @type {Array}
			 */
			"p4p": function() {
				var htmlTemplateArray = [
					'{{each products as product i}}',
					'<li data-index={{i}}>',
					'	<div class="ListImgBox">',
					'		{{ if (product.searchResultfoIsRecomHQ==1) }}<em class="yzIco">优质</em>{{/if}}',
					'		{{ if (product.searchResultfoIsRecomHQ==0) }}<em class="yzIco">推荐</em>{{/if}}',
					'		<a href="http://js.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_js_search_2_tupian&quot;);">',
					'			<img alt="{{product.searchResultfoTitle}}" height="100" width="84" src="{{product.searchResultfoImageSmall}}">',
					'		</a>',
					'	</div>',
					'	<div class="proRigName">',
					'		<p>',
					'			<a href="http://js.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_js_search_2_tupian&quot;);">{{product.searchResultfoTitle}}</a>',
					'		</p>',
					'		<div class="proRigBot">',
					'			<dl>',
					'				<dd class="prList1">&yen;<b>{{product.searchResultfoUnitPrice}}</b><em>/{{product.searchResultfoMeasureUnit}}</em>',
					'				</dd>',
					'				<dd class="prList2"><a href="http://js.hc360.com/b2b/{{product.searchResultfoUserName}}/" title="{{product.searchResultfoCompany}}" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_js_search_2_tupian&quot;);">{{product.searchResultfoCompany}}</a><span>广告</span>',
					'				</dd>',
					'				</dd>',
					'			</dl>',
					'		</div>',
					'		<a class="ImgBoxXJ" rel="nofollow" href="http://js.hc360.com/supplyself/{{product.searchResultfoId}}.html?flag=1" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_js_search_2_tupian&quot;);">询底价</a>',
					'	</div>',
					'</li>',
					'{{/each}}'
				];
				return htmlTemplateArray.join('');
			}(),

			/**
			 * [htmlTemplateArray 拼接当前页面阿拉丁商品模板]
			 * @type {Array}
			 */
			"aladdin": function() {
				var htmlTemplateArray = [
					'{{each products as product i}}',
					'<li>',
					'	<div class="ListImgBox">',
					'		<em class="hot">HOT</em>',
					'		<a href="http://js.hc360.com/supplyself/{{product.bcid}}.html" target="_blank" title="{{product.bctitle}}">',
					'			<img alt="{{product.bctitle}}" height="100" width="84" src="{{product.bcimage}}">',
					'		</a>',
					'	</div>',
					'	<div class="proRigName">',
					'		<p>',
					'		 	<a href="http://js.hc360.com/supplyself/{{product.bcid}}.html" target="_blank" title="{{product.bctitle}}">{{product.bctitle}}</a>',
					'		</p>',
					'		<div class="proRigBot">',
					'			<dl>',
					'				<dd class="prList1">&yen;<b>{{(product.bcprice.split("/")[0] || "")}}</b>/{{(product.bcprice.split("/")[1] || "")}}',
					'				</dd>',
					'				<dd class="prList2"><a href="http://js.hc360.com/b2b/{{product.bcid}}/" target="_blank" title="{{product.shopname}}" >{{product.shopname}}</a><span>广告</span>',
					'				</dd>',
					'				</dd>',
					'			</dl>',
					'		</div>',
					'		<a class="ImgBoxXJ" rel="nofollow" href="javascript:void(0)" onclick="sendUserlogsElement(&quot;UserBehavior_js_searchsupply_inquiry_wxbw?detailuserid={{product.username}}&detailbcid={{product.bcid}}&quot;);window.open(&quot;http://js.hc360.com/supplyself/{{product.bcid}}.html?flag=1&quot;)">询底价</a>',
					'	</div>',
					'</li>',
					'{{/each}}'
				];
				return htmlTemplateArray.join('');
			}()
		},

		/**
		 * [keyword 关键字]
		 * @type {String}
		 */
		keyword = $("#keywordValue").val() || '',

		/**
		 * [deferredAladdin 定义获取阿拉丁数据延迟对象]
		 * @type {Object}
		 */
		deferredAladdin = $.ajax({
			url: 'http://champion.hc360.com/champion/mStation/getAladInfo.html',
			type: 'GET',
			dataType: 'jsonp',
			timeout: 3000,
			data: {
				keyword: encodeURIComponent(encodeURIComponent("hc360mstation" + keyword))
			},
			jsonpCallback: "callback",
			jsonp: "callback"
		});

	/**
	 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
	 * @type {p4pBusinessLogic}
	 */
	var p4pBusinessLogicEntity = new p4pBusinessLogic({

		/**
		 * [keyword 关键字]
		 * @type {Object}
		 */
		keyword: keyword,

		/**
		 * [referrer 来源]
		 * @type {Number}
		 */
		referrer: 6,

		/**
		 * [clickableElementSelector 点击计费元素选择器]
		 * @type {String}
		 */
		clickableElementSelector: 'a,button',

		/**
		 * [wrap 广告位包裹元素]
		 * @type {Object}
		 */
		wrap: $('#topHotBox'),

		/**
		 * [template 设置模板HTML]
		 * @type {String}
		 */
		template: htmlTemplate['p4p'],

		/**
		 * [targetRenderCallback 广告位元素渲染到页面的回调函数]
		 * @param  {Object} targetHTML [广告位元素]
		 */
		targetRenderCallback: function(targetHTML) {
			return $(targetHTML).prependTo(this.wrap);
		},

		/**
		 * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
		 * @param  {Object} element [被点击元素]
		 * @return {Number}         [数据缓存中的索引值]
		 */
		getClickElementCacheIndexCallback: function(element) {
			return element.closest('li').attr('data-index');
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
			 * [_limit 展示P4P广告位数量上限]
			 * @type {Number}
			 */
			_limit = 5;

		/**
		 * 根据展示P4P广告位数量上限截取数据
		 */
		_prolist.splice(_limit, _prolist.length);
	});

	/**
	 * [监听渲染结束事件]
	 */
	p4pBusinessLogicEntity.addEventListener('onEndRender', function(data) {
		var _this = this;

		/**
		 * [在P4P渲染完成后，开始极度标王业务渲染逻辑]
		 */
		deferredAladdin.done(function(data) {

			/**
			 * [未成功获取数据则直接返回]
			 */
			if (!(parseInt(data.error) === 0)) {
				return;
			}

			/**
			 * [_data 获取极度标王数据集]
			 * @type {Object}
			 */
			var _data = data.info || {};

			/**
			 * [_price 拆分商品价格和商品价格单位]
			 * @type {Array}
			 */
			var _price = _data.bcprice.split('/');

			/**
			 * [设置渲染数据]
			 */
			_data.price = parseFloat(_price[0]).toFixed(2);
			_data.priceunit = _price[1] || '';

			/**
			 * [_html 获取渲染完成后的字符串，并添加到广告位包裹元素中]
			 * @type {String}
			 */
			var _html = _this.templateEngine.render(htmlTemplate.aladdin)({
				products: [_data]
			});
			$(_html).prependTo(_this.wrap);
		});
	});

	/**
	 * 开始P4P业务对象初始化
	 */
	p4pBusinessLogicEntity.init();
});