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
	 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
	 * @type {p4pBusinessLogic}
	 */
	var p4pBusinessLogicEntity = new p4pBusinessLogic({

		/**
		 * [keyword 关键字]
		 * @type {Object}
		 */
		keyword: $("#p4pkeyword").val() || '',

		/**
		 * [referrer 来源]
		 * @type {Number}
		 */
		referrer: 13,

		/**
		 * [clickableElementSelector 点击计费元素选择器]
		 * @type {String}
		 */
		clickableElementSelector: 'a,button',

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
		},

		/**
		 * [wrap 广告位包裹元素]
		 * @type {Object}
		 */
		wrap: $('[data-p4p-wrap]'),

		/**
		 * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
		 * @param  {Object} element [被点击元素]
		 * @return {Number}         [数据缓存中的索引值]
		 */
		getClickElementCacheIndexCallback: function(element) {
			return element.closest('li').attr('data-index');
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
			_limit = 5,

			/**
			 * 根据解析页面地址来判断页面类型
			 */
			_urlAttrs = _this.parseURL(window.location.href),

			/**
			 * [_columnMapping URL地址规则及模板HTML函数映射对象]
			 * @type {Object}
			 */
			_columnMapping = {

				/**
				 * [hot 热门推荐]
				 * @type {Object}
				 */
				hot: {
					regexp: new RegExp('\/cp\/' + _urlAttrs.file, 'ig'),
					html: function() {
						var _tempHTMLArray = [

							/**
							 * 以下HTML模板是多个商品占一行的模板
							 */
							'<article class="p4pBox">',
							'    <ul class="p4pCon2 swiper-wrapper">',
							'        {{each products as product i}}',
							'        <li data-index="{{i}}" class="swiper-slide">',
							'            <div class="ListImgBox">',
							'            	<em class="yzIco"></em>',
							'                <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">',
							'                    <img src="{{product.searchResultfoImageSmall}}">',
							'                </a>',
							'            </div>',
							'            <div class="ImgBot">',
							'                </p>',
							'                <p class="til">',
							'                    <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)" title="{{product.searchResultfoTitle}}" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html">{{#product.pretreatTitle}}</a>',
							'                </p>',
							'                <p class="comp"><a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)" href="//m.hc360.com/b2b/{{product.searchResultfoUserName}}/">{{product.searchResultfoCompany}}</a></p>',
							'                <div class="icoBox">',
							'                    <em class="ico1"></em>',
							'                    <em class="ico4"></em>',
							'                </div>',
							'                <div class="priBox">&yen;{{product.searchResultfoUnitPrice}}</div>',
							'                <div class="qtBox">',
							'                    <a rel="nofollow" target="_blank" href="javascript:void(0)" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;);alertInquiryInfo(&quot;{{product.searchResultfoProviderid}}&quot;,&quot;{{product.searchResultfoId}}&quot;,&quot;{{product.searchResultfoText}}&quot;,&quot;{{product.searchResultfoUserName}}&quot;,&quot;supply&quot;)">询价',
							'                    </a>',
							'                </div>',
							'                <p class="adTxt">广告</p>',
							'            </div>',
							'        </li>',
							'        {{/each}}',
							'    </ul>',
							'    <p class="tabTt">',
							'        {{each products as product i}}',
							'        <span></span>',
							'        {{/each}}',
							'    </p>',
							'</article>'

							/**
							 * 以下HTML模板是每个商品占满一行的模板
							 */
							// '{{each products as product i}}',
							// '<li data-index="{{i}}">',
							// '    <em class="yzIco">{{product.pretreatIconText}}</em>',
							// '    <em class="mAd">广告</em>',
							// '    <div class="ListImgBox">',
							// '        <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">',
							// '            <img src="{{product.searchResultfoImageSmall}}">',
							// '        </a>',
							// '    </div>',
							// '    <div class="ImgBot">',
							// '        <p><a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)"  data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html">{{product.searchResultfoTitle}}</a></p>',
							// '        <div class="priBox">',
							// '            <dl>',
							// '                <dd>&yen;{{product.searchResultfoUnitPrice}}<span>&frasl;{{product.searchResultfoMeasureUnit}}</span></dd>',
							// '            </dl>',
							// '        </div>',
							// '        <div class="icoBox">',
							// '            <dl>',
							// '                <dd>',
							// '                    <em class="ico2"></em>',
							// '                    <em class="ico4"></em>',
							// '                </dd>',
							// '                <dd>{{product.pretreatArea}}</dd>',
							// '            </dl>',
							// '        </div>',
							// '        <div class="qtBox">',
							// '            <dl>',
							// '                <dd>',
							// '                    <a class="ImgBoxXJ" rel="nofollow" target="_blank" href="javascript:void(0)" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;);alertInquiryInfo(&quot;{{product.searchResultfoProviderid}}&quot;,&quot;{{product.searchResultfoId}}&quot;,&quot;{{product.searchResultfoText}}&quot;,&quot;{{product.searchResultfoUserName}}&quot;,&quot;supply&quot;)">询价</a>',
							// '                    <a href="tel:{{product.searchResultfoTelephone}}" rel="nofollow" class="ImgBoxTel" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)"></a>',
							// '                </dd>',
							// '            </dl>',
							// '        </div>',
							// '    </div>',
							// '</li>',
							// '{{/each}}'
						];
						return _tempHTMLArray;
					},

					/**
					 * [callback 将创建完的DOM元素渲染到页面的回调函数]
					 * @return {Function} [description]
					 */
					callback: function(targetHTML) {
						return $(targetHTML).insertBefore(this.wrap);
					},

					/**
					 * [autoSendExpoData 不自动发送曝光数据，以期在拖动时发送指定商品的曝光数据]
					 * @type {Boolean}
					 */
					autoSendExpoData: false
				},

				/**
				 * [info 报价信息]
				 * @type {Object}
				 */
				info: {
					regexp: new RegExp('\/cp\/jiage\/' + _urlAttrs.file, 'ig'),
					html: function() {
						var _tempHTMLArray = [

							/**
							 * 以下HTML模板是多个商品占一行的模板
							 */
							'<article class="p4pBox">',
							'    <ul class="offerP4p swiper-wrapper">',
							'        {{each products as product i}}',
							'        <li data-index="{{i}}" class="swiper-slide">',
							'            <em class="yzIco"></em>',
							'            <em class="mAd">广告</em>',
							'            <div class="ListImgBox">',
							'                <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_tupian_1_tupian&quot;)" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}"></a>',
							'            </div>',
							'            <div class="ImgBot2">',
							'                <p class="Tab2Name">',
							'                    <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_1_tupian&quot;)" title="{{product.searchResultfoTitle}}" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html">{{#product.pretreatTitle}}</a>',
							'                </p>',
							'                <p class="Tab2Price">参考价<span>&yen;{{product.searchResultfoUnitPrice}}</span><em class="flat"></em></p>',
							'                <p class="BotBtn2">',
							'                    <button type="button" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_price_1_tupian&quot;);alertInquiryInfo(&quot;{{product.searchResultfoProviderid}}&quot;,&quot;{{product.searchResultfoId}}&quot;,&quot;{{product.searchResultfoText}}&quot;,&quot;{{product.searchResultfoUserName}}&quot;,&quot;jiage&quot;)">实时报价</button>',
							'                </p>',
							'            </div>',
							'        </li>',
							'        {{/each}}',
							'    </ul>',
							'    <p class="tabTt">',
							'        {{each products as product i}}',
							'        <span></span>',
							'        {{/each}}',
							'    </p>',
							'</article>'

							/**
							 * 以下HTML模板是每个商品占满一行的模板
							 */
							// '{{each products as product i}}',
							// '<li data-index="{{i}}">',
							// '    <em class="yzIco">{{product.pretreatIconText}}</em>',
							// '    <em class="mAd">广告</em>',
							// '    <div class="ListImgBox">',
							// '        <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_price_1_tupian&quot;)" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageSmall}}"></a>',
							// '    </div>',
							// '    <div class="ImgBot2">',
							// '        <p class="Tab2Name"><a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_price_1_tupian&quot;)"  data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html">{{product.searchResultfoTitle}}</a></p>',
							// '        <p class="Tab2Price">参考价<span>&yen;{{product.searchResultfoUnitPrice}}</span><em class="flat"></em></p>',
							// '        <p class="BotBtn2">',
							// '            <button type="button" onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_price_1_tupian&quot;);alertInquiryInfo(&quot;{{product.searchResultfoProviderid}}&quot;,&quot;{{product.searchResultfoId}}&quot;,&quot;{{product.searchResultfoText}}&quot;,&quot;{{product.searchResultfoUserName}}&quot;,&quot;jiage&quot;)">实时报价</button>',
							// '        </p>',
							// '    </div>',
							// '</li>',
							// '{{/each}}'
						];
						return _tempHTMLArray;
					},

					/**
					 * [callback 将创建完的DOM元素渲染到页面的回调函数]
					 * @return {Function} [description]
					 */
					callback: function(targetHTML) {
						return $(targetHTML).insertBefore(this.wrap);
					},

					/**
					 * [autoSendExpoData 不自动发送曝光数据，以期在拖动时发送指定商品的曝光数据]
					 * @type {Boolean}
					 */
					autoSendExpoData: false
				},

				/**
				 * [img 精选图片]
				 * @type {Object}
				 */
				img: {
					regexp: new RegExp('\/cp\/tupian\/' + _urlAttrs.file, 'ig'),
					html: function() {
						var _tempHTMLArray = [
							'{{each products as product i}}',
							'<li data-index="{{i}}">',
							'    <div class="ListImgBox">',
							'        <em class="yzIco">{{product.pretreatIconText}}</em>',
							'        <em class="mAd">广告</em>',
							'        <a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_tupian_1_tupian&quot;)" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}"></a>',
							'    </div>',
							'    <div class="ImgBot">',
							'        <p><a onclick="sendUserlogsElement(&quot;UserBehavior_p4p_m_cp_tupian_1_tupian&quot;)" data-query="sendClickInfo" href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html">{{product.searchResultfoTitle}}</a></p>',
							'    </div>',
							'</li>',
							'{{/each}}'
						];
						return _tempHTMLArray;
					},

					/**
					 * [callback 将创建完的DOM元素渲染到页面的回调函数]
					 * @return {Function} [description]
					 */
					callback: function(targetHTML) {
						return $(targetHTML).prependTo(this.wrap);
					},

					/**
					 * [autoSendExpoData 自动发送曝光数据]
					 * @type {Boolean}
					 */
					autoSendExpoData: true
				}
			};

		/**
		 * 根据展示P4P广告位数量上限截取数据
		 */
		_prolist.splice(_limit, _prolist.length);

		/**
		 * [非M站直接返回]
		 */
		if (_urlAttrs.host !== 'm.hc360.com') {
			return;
		}

		/**
		 * [根据URL规则设置对应模板HTML，若未匹配上后续逻辑会判断模板为空时不进行渲染逻辑]
		 */
		for (var _columnName in _columnMapping) {
			if (_columnMapping[_columnName].regexp.test(_urlAttrs.path)) {

				/**
				 * [template 设置模板HTML]
				 * @type {String}
				 */
				_this.template = _columnMapping[_columnName].html().join('');

				/**
				 * [targetRenderCallback 设置模板HTML渲染到页面的回调函数]
				 * @type {Function}
				 */
				_this.targetRenderCallback = _columnMapping[_columnName].callback;

				/**
				 * [autoSendExpoData 设置是否自动发送曝光数据]
				 * @type {Boolean}
				 */
				_this.autoSendExpoData = _columnMapping[_columnName].autoSendExpoData;

				/**
				 * 设置页面标识，以在渲染结束后区分热门推荐、报价信息、精选图片
				 */
				_this[_columnName] = true;
				break;
			}
		}
	});

	/**
	 * [监听渲染结束事件]
	 * @param  {Object} targetElement [广告位元素]
	 */
	p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
		var _this = this;

		/**
		 * [在 精选图片 页，且存在指定ID的百度广告元素，将百度广告移动到列表前 6 个产品以后]
		 */
		if (_this.img) {
			var wrap = $('#wrapbaidu');
			wrap.length && wrap.insertAfter($('.fListBox ul').children('li:lt(6):last'));
		}

		/**
		 * [在 热门推荐 报价信息 页，执行以下业务逻辑]
		 */
		if (_this.hot || _this.info) {

			/**
			 * 发送第一个商品的曝光数据
			 */
			_this.sendExpoData([_this.cache.prolist[0]]);

			/**
			 * 多个产品时，需要初始化滚动插件
			 */
			if (_this.cache.prolist.length > 1) {

				/**
				 * [加载swiper组件]
				 */
				$.getScript('//style.org.hc360.com/js/M-hc/mIndex/swiper.min.js', function() {

					/**
					 * 初始化元素滚动插件
					 */
					var swiperEntity = new Swiper(targetElement, {
						pagination: '.swiper-pagination',
						paginationClickable: true,
						slidesPerView: 'auto',
						onInit: function() {
							targetElement.data('inited', true).find(".tabTt span:eq(0)").addClass('cur').siblings().removeClass('cur');
						},

						/**
						 * [onTransitionEnd 切换结束后执行相关业务逻辑，onSlideChangeEnd事件存在切换到最后一个的时候不触发的情况]
						 */
						onTransitionEnd: function() {

							/**
							 * [_index 获取实际显示帧索引]
							 * @type {Number}
							 */
							var _index = swiperEntity.activeIndex;
							if ((_index === (swiperEntity.slides.length - 2)) && swiperEntity.isEnd) {
								_index++;
							}

							/**
							 * 将当前帧数发送到用户行为分析
							 */
							window.sendUserlogsElement && window.sendUserlogsElement('UserBehavior_p4p_m_cp_Slide_' + _index);

							/**
							 * 发送当前展示产品的曝光数据
							 */
							_this.cache.prolist[_index] && _this.sendExpoData([_this.cache.prolist[_index]]);

							/**
							 * [渲染当前页效果样式]
							 */
							targetElement.find(".tabTt span:eq(" + _index + ")").addClass('cur');
							targetElement.find(".tabTt span:eq(" + _index + ")").siblings().removeClass('cur');
						}
					});
				});
			}

		}
	});

	/**
	 * 开始P4P业务对象初始化
	 */
	p4pBusinessLogicEntity.init();
});