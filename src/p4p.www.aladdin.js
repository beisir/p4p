/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [deferredSliderData P4P数据就绪延迟对象，用于在数据就绪的时候通知并传递数据开始渲染边栏的P4P轮播模块]
 * @type {Object}
 */
var deferredSliderData = $.Deferred();

/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({

	/**
	 * [keyword 关键字]
	 * @type {Object}
	 */
	keyword: $("#hc_keyword").val() || '',

	/**
	 * [referrer 来源]
	 * @type {Number}
	 */
	referrer: 2,

	/**
	 * [clickableElementSelector 点击计费元素选择器]
	 * @type {String}
	 */
	clickableElementSelector: 'a,button',

	/**
	 * [wrap 广告位包裹元素]
	 * @type {Object}
	 */
	wrap: $('#screenmain'),

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
 * [监听数据就绪事件，解决P4P数据就绪延迟对象，并传递P4P数据对象]
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function(data) {
	var _this = this;

	/**
	 * 解决P4P数据就绪延迟对象，并传递P4P数据对象的深拷贝对象
	 */
	deferredSliderData.resolve($.extend(true, {}, data));
});

/**
 * [监听数据就绪事件，根据已显示标王、推荐数量计算P4P广告位显示数量]
 * [此处广告位总数为6个，标王广告位数量最多5个。标王广告位数量不够5个时，后台会根据标王广告位数量补充推荐广告位。]
 * [P4P广告位补充规则：在可删除推荐广告位，不删除标王广告位，不超过广告位总数的前提下，补充足够多的P4P广告位。同时保持从上至下标王、P4P、推荐的广告位显示顺序]
 * @param  {Object} data [商品数据]
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function(data) {
	var _this = this,

		/**
		 * [_data 商品数据]
		 * @type {Array}
		 */
		_data = data.searchResultInfo || [],

		/**
		 * [_wrap_biaowan 标王广告位元素列表]
		 * [标王商机加特定样式 bwAdNew ，这个样式在阿拉丁着陆页没找到，也没敢删，貌似有别的页面也是用的这个脚本，但引用了不同的样式表，也许上帝知道它在什么地方定义的]
		 * @type {Object}
		 */
		_wrap_biaowan = $('[data-query="biaowang"]').closest('.itemScreenList').addClass("bwAdNew"),

		/**
		 * [_wrap_biaowan 推荐广告位元素列表]
		 * @type {Object}
		 */
		_wrap_tuijian = $('[data-query="tuijian"]').closest('.itemScreenList'),

		/**
		 * [_tempHTMLArray 模板HTML数组]
		 * @type {Array}
		 */
		_tempHTMLArray = [
			'{{each products as product i}}',
			'<div class="bwBoxCon" data-index="{{i}}">',
			'	<div class="bwBox1">',
			'		<ul>',
			'			<li class="box1Con">',
			'				<div class="bImgBox">',
			'					<em>{{product.pretreatIconText}}</em>',
			'					<a href="{{product.searchResultfoUrl}}" target="_blank"><img src="{{product.searchResultfoImageBig}}"></a>',
			'				</div>',
			'				<div class="bwBox1List">',
			'					<div class="bwBox1Title">',
			'						<em>{{product.pretreatIconText}}</em>',
			'						<h2><a target="_blank" href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}">{{#product.pretreatTitle}}</a></h2>',
			'						<a title="{{product.pretreatIconText}}" class="newYZIco">{{product.pretreatIconText}}</a>',
			'						<a title="开关拼实惠" class="newIco3">促</a>',
			'						{{if product.pretreatIsTrade}}<a title="在线交易" class="newIco4">交易</a>{{/if}}',
			'					</div>',
			'					<div class="rightCon">',
			'					<div class="bwParameter">',
			'						<ul>',
			'							{{each product.pretreatAttrs as attr j}}',
			'							<li>{{attr.name}}：{{attr.value}}</li>',
			'							{{/each}}',
			'						</ul>',
			'					</div>',
			'					<div class="bwBox1Price">',
			'						<p>{{product.pretreatPrice}}</p>',
			'						<span>起订量 ≥{{product.searchResultfoBespeakAmount}}个</span>',
			'					</div>',
			'					<div class="bwBox1Btn">',
			'						<a href="{{product.pretreatShopUrl}}" target="_blank" class="xPriceBtn">进入商铺</a>',
			'						<a href="{{product.searchResultfoUrl}}" target="_blank" class="dBtn">查看详情</a>',
			'					</div>',
			'					</div>',
			'					<div class="bwBox1Bot">',
			'						供应商：<a href="{{product.pretreatShopUrl}}" target="_blank">{{product.searchResultfoCompany}}</a>',
			'						<span>',
			'							<a rel="nofollow" target="_blank"  href="//s.hc360.com/?mc=seller&amp;w={{keyword}}&amp;z={{product.pretreatArea}}" data-useractivelogs="ald_UserBehavior_s_trade">{{product.pretreatArea}}</a>',
			'						</span>',
			'					</div>',
			'				</div>',
			'			</li>',
			'        </ul>',
			'    </div>',
			'</div>',
			'{{/each}}'
		],

		/**
		 * [_calculateNumAddible 计算可添加P4P广告位数量]
		 * @return {Number} [可添加广告位数量]
		 */
		_calculateP4PNumAddible = function() {

			/**
			 * [_limit 广告位数量上限]
			 * @type {Number}
			 */
			var _num_limit = 6,

				/**
				 * [_num_p4p 待显示的P4P广告位数量]
				 * @type {Number}
				 */
				_num_p4p = _data.length,

				/**
				 * [_num_biaowan 已显示的标王广告位数量]
				 * @type {Number}
				 */
				_num_biaowan = _wrap_biaowan.length,

				/**
				 * [_num_tuijian 已显示的推荐广告位数量]
				 * @type {Number}
				 */
				_num_tuijian = _wrap_tuijian.length,

				/**
				 * [_num_tuijian_removed 需要删除的推荐广告位数量]
				 * @type {Number}
				 */
				_num_tuijian_removed = 0,

				/**
				 * [_num_addible 可添加的广告位数量，即广告位数量上限减去不可删除的标王广告位数量]
				 * @type {Number}
				 */
				_num_addible = _num_limit - _num_biaowan,

				/**
				 * [_num_p4p_addible 实际可添加的P4P广告位数量，因为推荐广告位是可以删除的，所以这里直接取待显示的P4P广告位数量与可添加的广告位数量的最小值，根据此数量来截取P4P数据]
				 * @type {Number}
				 */
				_num_p4p_addible = Math.min(_num_p4p, _num_addible);

			/**
			 * [若实际可添加的P4P广告位数量为0，直接返回]
			 */
			if (!_num_p4p_addible) {
				return _num_p4p_addible;
			}

			/**
			 * 若实际可添加的P4P广告位数量+标王广告位数量+推荐广告位数量>6，则需要对推荐广告位进行删除
			 */
			while ((_num_tuijian) && ((_num_p4p_addible + _num_biaowan + _num_tuijian) > _num_limit)) {

				/**
				 * 更新推荐广告位数量
				 */
				_num_tuijian--;

				/**
				 * 更新需要删除的推荐广告位数量
				 */
				_num_tuijian_removed++;
			};

			/**
			 * 删除相应数量的推荐广告位
			 */
			_num_tuijian_removed && _wrap_tuijian.filter(':lt(' + _num_tuijian_removed + ')').remove();

			/**
			 * 返回实际可添加的P4P广告位数量
			 */
			return _num_p4p_addible;
		};

	/**
	 * [_num_p4p_addible 获取可添加的P4P广告位数量]
	 * @type {Number}
	 */
	var _num_p4p_addible = _calculateP4PNumAddible();

	/**
	 * [根据可添加的P4P广告位数量截取P4P数据]
	 */
	_data.splice(_num_p4p_addible, _data.length);

	/**
	 * [template 设置模板HTML]
	 * @type {String}
	 */
	_this.template = _tempHTMLArray.join('');

	/**
	 * [targetRenderCallback 为了保持从上至下标王、P4P、推荐的广告位显示顺序，将渲染回调]
	 * @return {[type]} [description]
	 */
	_this.targetRenderCallback = function(targetHTML) {

		/**
		 * [若存在标王广告位，则添加到标王广告位后面，否则添加到整个广告位包裹元素的顶部]
		 */
		if (_wrap_biaowan.length) {
			return $(targetHTML).insertAfter(_wrap_biaowan.last());
		} else {
			return $(targetHTML).prependTo(_this.wrap);
		}
	};
});

/**
 * [监听开始渲染事件]
 */
p4pBusinessLogicEntity.addEventListener('onStartRender', function(template, template_params) {
	var _this = this;

	/**
	 * [keyword 向渲染模板数据中添加关键字数据]
	 */
	$.extend(true, template_params, {
		keyword: _this.keyword
	});
});

p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    /**
     * [绑定监测点点击事件]
     */
    targetElement.on("click", 'a', function () {
        try {
            HC&&HC.UBA&&HC.UBA.sendUserlogsElement('UserBehavior_p4p_bdald_1_tupian');
        } catch (ex) {
        }
    });

});
/**
 * 开始搜索页顶部P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();

/**
 * [在P4P数据就绪延迟对象被解决后，执行P4P边栏轮播图渲染逻辑]
 * @param  {Object} data                 [P4P数据集]
 */
$.when(deferredSliderData).done(function(data) {

	/**
	 * [_wrap 包裹元素]
	 * @type {Object}
	 */
	var _wrap = $('[data-query="p4pside"]'),

		/**
		 * [_data 先复制P4P数据对象，以免影响到其他业务的数据]
		 * @type {Object}
		 */
		_data = $.extend(true, {}, data || {}),

		/**
		 * [_prolist P4P商品数据列表]
		 * @type {Array}
		 */
		_prolist = _data.searchResultInfo || [],

		/**
		 * [limit 要展示商品数量]
		 * @type {Number}
		 */
		_limit = 4;

	/**
	 * [不存在包裹元素]
	 */
	if (!_wrap.length) {
		return;
	}

	/**
	 * [截取指定数量的P4P数据]
	 */
	_prolist.splice(_limit, _prolist.length);

	/**
	 * [若没有要展示的数据，直接返回]
	 */
	if (!_prolist.length) {
		return;
	}

	/**
	 * [_tempHTMLArray 拼接html模板]
	 * @type {Array}
	 */
	var _tempHTMLArray = [
		'<div class="adLeftPic">',
		'    <div class="bigImg">',
		'        <ul>',
		'            {{each products as product i}}',
		'            <li style="display:none" data-index="{{i}}">',
		'                <a target="_blank" href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}" />',
		'                    <p>{{product.searchResultfoTitle}}</p>',
		'                </a>',
		'            </li>',
		'            {{/each}}',
		'        </ul>',
		'    </div>',
		'    <div class="smallImg">',
		'        <ul>',
		'            {{each products as product i}}',
		'            <li data-query="smallImgP4P" data-index="{{i}}">',
		'                <a target="_blank" href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}" /></a>',
		'            </li>',
		'            {{/each}}',
		'        </ul>',
		'    </div>',
		'    <s></s>',
		'</div>'
	];

	/**
	 * [sliderP4PBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
	 * @type {p4pBusinessLogic}
	 */
	var sliderP4PBusinessLogicEntity = new p4pBusinessLogic({

		/**
		 * [keyword 关键字]
		 * @type {Object}
		 */
		keyword: $("#hc_keyword").val() || '',

		/**
		 * [referrer 来源]
		 * @type {Number}
		 */
		referrer: 2,

		/**
		 * [clickableElementSelector 点击计费元素选择器]
		 * @type {String}
		 */
		clickableElementSelector: 'a',

		/**
		 * [wrap 广告位包裹元素]
		 * @type {Object}
		 */
		wrap: _wrap,

		/**
		 * [cache P4P数据]
		 * @type {Object}
		 */
		cache: _data,

		/**
		 * [template 模板HTML]
		 * @type {String}
		 */
		template: _tempHTMLArray.join(''),

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
	sliderP4PBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
		var _this = this;

		/**
		 * [绑定监测点点击事件]
		 */
		targetElement.on("click", 'a', function() {
			try {
				HC.UBA.sendUserlogsElement('UserBehavior_p4p_bdald_1_tupian');
			} catch (ex) {}
		});

		/**
		 * 以下逻辑是从以前脚本摘过来的，未能完全理解
		 */
		$(".adLeftPic >.bigImg >ul >li").eq(0).show();

		/**
		 * [轮播图鼠标悬浮切换效果]
		 */
		targetElement.on("mouseenter", 'li[data-query="smallImgP4P"]', function() {
			$(this).addClass("on").siblings().removeClass("on");
			$(".adLeftPic >.bigImg >ul >li").eq($(this).index()).show().siblings().hide();
		});
	});

	/**
	 * 开始搜索页底部P4P业务对象初始化
	 */
	sliderP4PBusinessLogicEntity.init();
});