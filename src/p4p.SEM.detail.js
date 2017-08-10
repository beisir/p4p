/**
 * [cookieUtil 引入cookie模块]
 * @type {[type]}
 */
var cookieUtil = require('./cookie');

/**
 * [加载顶部工具条]
 */
HC.HUB.addScript('http://style.org.hc360.com/js/build/source/widgets/flowconfig/hc.flowconfig.min.js', function() {
	HC.W.load('topnav', function() {
		var topNavList = $('.webTopNav')[0];
		topnav.init(false);
		$('#wrapInner').append($('.webTopNav'));
		topNavList.style.top = '0';
		topNavList.style.position = 'static';
	});
});

/**
 * [resizeImg 重置图片大小]
 * @param  {Object} img [图片元素]
 * @param  {Number} oAW [最大宽度]
 * @param  {Number} oAH [最大高度]
 */
window.resizeImg = function(img, oAW, oAH) {
	var oimgW = img.width,
		oimgH = img.height,
		oimg = img,
		oY = (oimgH / oimgW).toFixed(2),
		oX = (oimgW / oimgH).toFixed(2);
	if (oimgW <= oAW && oimgH <= oAH) { //图片高和宽比指定的宽高都小
		oimg.style.height = oimgH + 'px';
		oimg.style.width = oimgW + 'px';
	} else if (oimgW >= oAW && oimgH >= oAH) { //图片高和宽比指定的宽高都大
		if (oY * oAW >= oAH) { //图片高比宽大
			oimg.style.height = oAH + 'px';
			oimg.style.width = oX * oAH + 'px';
		} else { //图片高比宽小
			oimg.style.height = oY * oAH + 'px';
			oimg.style.width = oAW + 'px';
		}
	} else if (oimgW > oAW && oimgH < oAH) { //图片宽比指定宽大，高比指定的小
		oimg.style.height = oY * oAW + 'px';
		oimg.style.width = oAW + 'px';
	} else if (oimgW < oAW && oimgH > oAH) { //图片宽比指定宽小，高比指定的大
		oimg.style.height = oAH + 'px';
		oimg.style.width = oX * oAH + 'px';
	}
};

/**
 * [imgonerror 图片加载失败回调]
 * @param  {[type]} img [description]
 * @return {[type]}     [description]
 */
window.imgonerror = function(img) {
	img.src = "http://style.org.hc360.com/images/detail/mysite/siteconfig/SY-shop/no-pic.png";
	img.onerror = null;
};

/**
 * [hcclick webTrends用户行为检测方法]
 */
window.hcclick = function(param) {
	if (document.images) {
		var rannumber = Math.round(Math.random() * 10000);
		(new Image()).src = "http://log.info.hc360.com/click.htm" + param + "&rannumber=" + rannumber;
	}
	return true;
};

/**
 * [loginDialogDeferred 加载登录框脚本延迟对象]
 */
var loginDialogDeferred = $.Deferred();
HC.HUB.addScript("http://style.org.hc360.cn/js/module/detail/hc.login.pop.min.js", function() {
	loginDialogDeferred.resolve();
});

/**
 * [toAjaxshoucang description]
 * @return {[type]} [description]
 */
function toAjaxshoucang() {
	var url = "http://my.b2b.hc360.com/my/turbine/action/favorites.FavoritesAction/eventsubmit_doAddinfonew/doAddinfonew?";
	url = url + "infoid=" + window.supplyBcId + "&infotype=0&buyerSourceId=" + window.buyerSourceIdStr;
	jQuery.ajax({
		type: "get",
		url: url,
		async: true,
		dataType: 'jsonp',
		jsonp: "jsoncallback",
		contentType: "application/x-www-form-urlencoded;charset=utf-8",
		timeout: 3000,
		success: function(result) {
			jQuery("._urlid").attr("href", "http://my.b2b.hc360.com/my/turbine/template/corcenter,favorites,favorites.html");
			var top = jQuery(document).scrollTop();
			jQuery('#update-shoucang').css('margin-top', top);
			if (result.code == '007') {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed").show();
				jQuery("#send-succeed-send-errow").hide();
			} else if (result.code == '006') {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed-send-errow").show();
				jQuery("#send-succeed").hide();
			} else if (result.code == '012') {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed").hide();
				jQuery("#send-succeed-send-errow-gsx").show();
			} else if (result.code == '013') {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed").hide();
				jQuery("#send-succeed-send-errow-ggsx").show();
			} else if (result.code == '004') {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed").hide();
				jQuery("#send-succeed-send-errow-bq").show();
			} else if (result.code == '005') {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed").hide();
				jQuery("#send-succeed-send-errow-bcz").show();
			} else {
				jQuery("#update-shoucang").show();
				jQuery("#send-succeed").hide();
				jQuery("#send-succeed-send-errow-qt").show();
			}
		}
	});
}

/**
 * [Favorite_purchase description]
 * @param {[type]} isbusin [description]
 */
function Favorite_purchase(isbusin) {
	var data = inquiryParamVO;
	var url = "http://detail.b2b.hc360.com/detail/turbine/action/ajax.Favorite_PurchaseAction/eventsubmit_doFavorite/doFavorite?";
	jQuery.ajax({
		type: "get",
		url: url,
		data: data,
		dataType: 'jsonp',
		jsonp: "jsoncallback",
		timeout: 3000,
		success: function(result) {
			url = "http://my.b2b.hc360.com/my/turbine/action/favorites.Favorite_PurchaseAction/eventsubmit_doPerform/doPerform?";
			result.contact = encodeURIComponent(window.companyContactor);
			result.CompanyName = encodeURIComponent(window.infoname);
			result.comeUrl = window.location.href;
			result.isbusin = isbusin;
			result.buyerSourceId = "_";
			if (isbusin == 1 || isbusin == 2) {
				result.type = 13;
			} else {
				result.type = 14;
			}
			if (isbusin == 2 || isbusin == 3) {
				result.supcatName = encodeURIComponent(window.lastClass);
			}
			if (isbusin == 3) {
				result.inquiryNum = $('#buyNumber').val();
			}
			jQuery.ajax({
				type: "get",
				url: url,
				data: result,
				dataType: 'jsonp',
				jsonp: "jsoncallback",
				timeout: 3000,
				success: function(result1) {}
			});
		}
	});
}

/**
 * [closeshoucang 关闭收藏后的弹出框]
 * @return {[type]} [description]
 */
window.closeshoucang = function() {
	jQuery("#update-shoucang").hide();
};

/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [监听DOMContentLoaded事件]
 */
$(function() {

	/**
	 * [绑定收藏商品按钮点击事件]
	 */
	$('#spnFavoProd').click(function() {
		loginDialogDeferred.done(function() {
			/**
			 * [buyerIsLogin 初始化用户登录状态]
			 * @type {Boolean}
			 */
			window.buyerIsLogin = !!(cookieUtil.get('LoginID') && cookieUtil.get('HC360.SSOUser'));
			window.buyerSourceIdStr = "detail_shoucang_busin";
			if (window.buyerIsLogin) {
				jQuery('#popLogin').wijdialog('close');
				setTimeout(function() {
					toAjaxshoucang();
					Favorite_purchase(2);
				}, 100);
			} else {
				jQuery('#popLogin').wijdialog('open');
				window.callbackLogin = function() {
					jQuery('#popLogin').wijdialog('close');
					toAjaxshoucang();
					Favorite_purchase(2);
					return false;
				};
			}
		});
	});

	/**
	 * [wrapCompanyName 右侧公司名称包裹元素]
	 */
	var wrapCompanyName = $('.comply-name'),
		wrapTip = wrapCompanyName.find('.tips');

	/**
	 * [绑定右侧公司名称鼠标悬浮事件]
	 */
	wrapCompanyName.hover(function() {
		wrapTip.show();
	}, function() {
		wrapTip.hide();
	});

	/**
	 * [加载放大镜插件，并初始化商品大图区域的放大镜及图片轮播功能]
	 */
	HC.W.load('jqzoomV2', function() {
		$('#imgContainer').jqzoom({
			zoomType: 'standard',
			lens: true,
			preloadImages: false,
			timesnum: '3000',
			title: false,
			zoomWidth: 450,
			zoomHeight: 450,
			xOffset: 13,
			yOffset: -10,
			alwaysOn: false,
			wrapboxHW: {
				"width": 300,
				"height": 300
			},
			swapPic: {
				preBtn: $("#basePre"),
				nexBtn: $("#baseNex"),
				showNum: 3,
				listObj: $("#thumblist"),
				disBtnLClass: "dis-img-scroll-left",
				btnLClass: "able-img-scroll-left",
				disBtnRClass: "dis-img-scroll-right",
				btnRClass: "able-img-scroll-right",
				lastShow: $("#nextBussInfo")
			}
		});
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
		keyword: window.p4pkeyword || '',

		/**
		 * [referrer 来源]
		 * @type {Number}
		 */
		referrer: 21,

		/**
		 * [clickableElementSelector 点击计费元素选择器]
		 * @type {String}
		 */
		clickableElementSelector: 'a',

		/**
		 * [wrap 广告位包裹元素]
		 * @type {Object}
		 */
		wrap: $('[data-p4p-wrap]'),

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
			return element.closest('li').attr('data-index');
		},

		/**
		 * [_tempHTMLArray 模板HTML数组，不显示第一个]
		 * @type {String}
		 */
		template: [
			'<ul>',
			'    {{each products as product i}}',
			'    {{if i!=0}}',
			'    <li data-index="{{i}}">',
			'        <div class="item">',
			'            <div class="picmid">',
			'                <a href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}"></a>',
			'            </div>',
			'        </div>',
			'        <p class="til">',
			'            <a href="{{product.searchResultfoUrl}}" target="_blank">{{#product.pretreatTitle}}</a>',
			'        </p>',
			'        <p class="price">',
			'            <span>{{product.pretreatPrice}}</span>',
			'            {{if product.searchResultfoQq}}<a href="http://wpa.qq.com/msgrd?v=3&amp;uin={{product.searchResultfoQq}}&amp;site=qq&amp;menu=yes" rel="nofollow" target="_blank" title="QQ交谈"><em class="qqonline">&nbsp;</em></a>{{/if}}',
			'        </p>',
			'        <dl>',
			'            <dd class="state">',
			'                <span class="ctr">{{product.pretreatArea}}</span>',
			'                <span class="ico">',
			'		<a class="bzico" title="交易保障金">&nbsp;</a>',
			'		<a class="MMTico" title="认证会员">&nbsp;</a>',
			'	</span>',
			'            </dd>',
			'        </dl>',
			'    </li>',
			'    {{/if}}',
			'    {{/each}}',
			'</ul>',
		].join('')
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

		/**
		 * [若P4P数据小于1条，页面下方的 相似产品推荐 模块则不显示]
		 */
		if (_prolist.length <= 1) {
			_this.wrap.closest('div').hide();
		}
	});

	/**
	 * [监听创建曝光参数事件，向曝光参数中对象中添加新字段]
	 * @param  {Object} _paramsObject [参数对象]
	 * @param  {Object} _data         [商品参数对象]
	 */
	p4pBusinessLogicEntity.addEventListener('onBuildExpoData', function(_paramsObject, _data) {
		var _this = this,

			/**
			 * [_querystring 由后台解析的查询参数对象]
			 * @type {Object}
			 */
			_querystring = window.requesParamsVo || {},

			/**
			 * [_referrer P4P商品数据列表中的第一条商品曝光来源标识需要特别指定为 20 ]
			 * @type {[type]}
			 */
			_referrer = ($.inArray(_data, _this.cache.prolist) === 0)? 20: _this.referrer;

		/**
		 * [_params 设置曝光数据]
		 * @type {Array}
		 */
		_paramsObject.params = [
			encodeURIComponent(_this.keyword),
			_data.searchResultfoId,
			(_data.searchResultfoPlanId || ''),
			(_data.searchResultfoUnitId || ''),
			_data.searchResultfoUserId,
			_data.searchResultfoProviderid,
			_referrer,
			_data.searchResultfoKypromote,
			((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
			encodeURIComponent(_querystring.kid) || '0',
			_querystring.match || '0',
			_querystring.confr || '0'
		];
	});

	/**
	 * [监听创建点击参数开始事件，向点击参数对象中添加新字段]
	 * @param  {Object} _params [参数对象]
	 * @param  {Object} _data   [商品参数对象]
	 */
	p4pBusinessLogicEntity.addEventListener('onStartBuildClickParams', function(_params, _data) {
		var _this = this,

			/**
			 * [_querystring 由后台解析的查询参数对象]
			 * @type {Object}
			 */
			_querystring = window.requesParamsVo || {};

		/**
		 * [keywordextend 以下为当前项目点击扩展参数]
		 */
		_params.keywordextend = encodeURIComponent(_querystring.kid) || '0';
		_params.match = _querystring.match || '0';
		_params.confr = _querystring.confr || '0';
	});

	/**
	 * 开始P4P业务对象初始化
	 */
	p4pBusinessLogicEntity.init();
});