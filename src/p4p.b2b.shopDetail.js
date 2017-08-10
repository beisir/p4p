/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');


/**
 * [存在商机ID列表]
 */
if ($.trim(window.jump_p4pBcid).length) {

    /**
     * [_p4pbcidlist 获取bcid列表]
     * @type {Array}
     */
    var _p4pbcidlist = ($.trim(window.jump_p4pBcid) || '').split(','),

        /**
         * [判断当前商机是否有对应的P4P商品，如果存在的话执行如下页面跳转逻辑]
         */
        _url = p4pBusinessLogic.prototype.parseURL(document.referrer),

        /**
         * [_spider 是否爬虫]
         * @type {RegExp}
         */
        _spider = /spider/ig.test(window.navigator.userAgent);

    /**
     * [_p4pbc 随机获取商机列表中的一项]
     * @type {[type]}
     */
    var _p4pbc = _p4pbcidlist[parseInt(_p4pbcidlist.length * Math.random())] || '';

    /**
     * [_p4pbcid 当前商机对应P4P商机编号]
     * @type {Number}
     */
    var _p4pbcid = _p4pbc.split('|')[0],

        /**
         * [_keyword 当前商机对应P4P商机关键字]
         * @type {String}
         */
        _keyword = _p4pbc.split('|')[1],

        /**
         * [_out 外网是否跳转]
         * @type {[type]}
         */
        _out = _p4pbc.split('|')[2];

    /**
     * [非爬虫，存在对应P4P商机编号，存在访前，访前为内网]
     */
    if ((!_spider) && _p4pbcid && _keyword && document.referrer && (((!_out) && (/hc360.com$/.test(_url.host.toLowerCase()))) || _out)) {

        /**
         * [发送计费请求]
         */
        $.ajax({
            url: 'http://p4pserver.org.hc360.com/p4pserver/doAnticheatingSpe',
            data: {
                bcid: _p4pbcid,
                keyword: encodeURIComponent(_keyword)
            },
            dataType: 'jsonp',
            jsonp: 'jsoncallback',
            cache: false,
            timeout: 3000
        })
            .done(function() {
                // console.log("success");
            })
            .fail(function() {
                // console.log("error");
            })
            .always(function() {

                /**
                 * [_href 跳转页面地址]
                 * @type {String}
                 */
                var _href = 'http://b2b.hc360.com/supplyself/' + _p4pbcid + '.html';
                window.location.href = _href;
            });
    }

}


/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({

	/**
	 * [keyword 关键字]
	 * @type {Object}
	 */
	keyword: (HC.getCookie && HC.getCookie("hclastsearchkeyword") || $("#comTitle").text() || ""),

	/**
	 * [referrer 来源]
	 * @type {Number}
	 */
	referrer: 8,

	/**
	 * [clickableElementSelector 点击计费元素选择器]
	 * @type {String}
	 */
	clickableElementSelector: 'a',

	/**
	 * [wrap 广告位包裹元素]
	 * @type {Object}
	 */
	wrap: $('#buyerList li,#relatedList li,#highQualityList li,#otherList li'),

	/**
	 * [cache 设置缓存数据，初始化该属性后，将不自动从搜索CGI接口获取数据，适用于由后台获取数据的业务逻辑]
	 * @type {[type]}
	 */
	cache: window.p4pbclist || {},

	/**
	 * [template 渲染模板HTML，该属性为空字符串时，将不自动渲染，适用于由后台渲染的业务逻辑]
	 * @type {String}
	 */
	template: '',

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
		_prolist = _data.searchResultInfo || [],

		/**
		 * [_tempHTMLArray 临时HTML数组]
		 * @type {Array}
		 */
		_tempHTMLArray = [];

	/* [创建以商机id的列表索引，以便于判断指定商机id是否存在于当前列表中]
	 */
	for (var i = 0; i < _prolist.length; i++) {
		_prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
	}

	/**
	 * [查找包裹元素中P4P商品DOM元素,若这些区域中的商品存在于数据集中,则绑定点击事件发送相关数据]
	 */
	_this.wrap.each(function(index, element) {
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
	_this.target = _this.wrap.filter('[data-p4p-mark]');
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
			HC.UBA.sendUserlogsElement('UserBehavior_p4p_freedetail_supplyself_2_tupian');
		} catch (ex) {}
	});
});

/**
 * 开始P4P业务对象初始化
 */
p4pBusinessLogicEntity.init();