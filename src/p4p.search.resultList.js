/**
 * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
 * @type {Object}
 * 目前页面有5处P4P产品，搜索条件的上方和热门推荐都是取得优质产品，顺序取，
 * 搜索结果第一行和最后一行也是取得优质产品，这两个顺序取
 * 黄展跟搜索结果第一行顺序取，但是黄展是优质和推荐不区分，例如搜索结果第一行如果显示了3条p4p，黄展从索引3开始取后面的数据
 *
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * 定义P4P搜索黄金展位渲染延迟对象，P4P搜索底部展位渲染延迟对象，P4P数据就绪延迟对象
 */
var deferredHUangzhan = $.Deferred(),
  deferredBottom = $.Deferred(),
  deferredData = $.Deferred(),
  _tempScreenWidth = window.screen.width || 0,
  apValue = window.p4pAddition||{},
  ap = [],
  huangzhanIndex = 0,//搜索结果第一行显示了p4p商品数，第一行如果显示了3条p4p，黄展从索引3开始取后面的数据
  _lineDisplayProductNum,//当前分辨率下，搜索第一行和最后一排的P4P需要展示的个数
  recommendedArr = [];//底部热门推荐的数组对象

//搜索ab测试，搜索页面扣费曝光调用P4P接口都对应加上这个参数
for (var key in apValue) {
  var str= key + '=' + apValue[key];
  ap.push(str);
}
ap=encodeURIComponent(encodeURIComponent(ap.join(',')));

/**
 * [根据当前分辨率获取一行显示的商品数]
 */
if (_tempScreenWidth >= 1440) {
  _lineDisplayProductNum = 5;
} else if (_tempScreenWidth >= 1200 && _tempScreenWidth < 1440) {
  _lineDisplayProductNum = 4;
} else {
  _lineDisplayProductNum = 3;
}

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
  while ((ConvertList.length >= 0) && price >= ConvertList[0].measure && (shiftUnit = ConvertList.shift())) {
    price = price / shiftUnit.measure
  }
  return price.toFixed(2) + (shiftUnit.unit || "")
}

/**
 * [checkByteLength 验证字符串长度，英文占1个字符，中文汉字占2个字符]
 * @param {String} str [字符串]
 * @param {Number} minLength [最小长度]
 * @param {Number} maxLength [最大长度]
 * @return {Boolean} [是否验证通过]
 */
function checkByteLength(str, minLength, maxLength) {
  if (typeof str != 'string') {
    str = str.toString();
  }
  var nlength = 0;
  for (var i = 0; i < str.length; i++) {
    if ((str.charCodeAt(i) & 0xff00) != 0) {
      nlength++;
    }
    nlength++;
  }
  return (nlength >= minLength) && (nlength <= maxLength);
}

/**
 * [scrollLoading_right_callback 右侧黄金展位区域滚动后，异步加载数据并渲染结束的回调函数]
 */
window.scrollLoading_right_callback = function () {

  /**
   * [hzBoxNew 获取黄金展位包裹元素]
   */
  var hzBoxNew = $('.hzBoxNew'),

    /**
     * [hzItemCountLimit 黄金展位商机可展示数量上限]
     * @type {Number}
     */
    hzItemCountLimit = 10,

    /**
     * [scrollLoading_right description]
     */
    scrollLoading_right = $('.scrollLoading_right'),

    /**
     * [deferredGetItemCount 定义获取实际填充到页面的广告位数量延迟对象，因为当前作用域获取不到P4P数据的问题，也就不能获取到实际渲染到黄金展位的广告位数量，所以定义延迟对象在广告位渲染完成后再执行后续滚动逻辑]
     * @type {Object}
     */
    deferredGetItemCount = $.Deferred();

  /**
   * [hzBoxNewLoaded 避免重复加载数据]
   */
  if (hzBoxNew.data('loaded')) {
    return;
  }
  hzBoxNew.data('loaded', true);

  /**
   * 将scrollLoading_right中的项添加到同步显示项的同级
   */
  scrollLoading_right.find('li').appendTo(hzBoxNew.find('ul'));

  /**
   * 删除scrollLoading_right元素
   */
  scrollLoading_right.remove();

  /**
   * [hzItemCount 获取黄金展位数量]
   */
  var hzItemCount = hzBoxNew.find('li').length;

  /**
   * [hzItemCountP4P 黄金展位剩下的广告位数目]
   * @type {Number}
   */
  var hzItemCountP4P = hzItemCount > 16 ? 0 : (16 - hzItemCount);
  if (hzItemCountP4P) {

    /**
     * 解决P4P搜索黄金展位渲染延迟对象
     */
    deferredHUangzhan.resolve(hzItemCount, hzItemCountP4P, deferredGetItemCount);
  } else {

    /**
     * 无广告位直接解决滚动逻辑延迟对象
     */
    deferredGetItemCount.resolve(hzItemCount);
  }

  /**
   * [在滚动逻辑延迟对象解决后，执行该区域的滚动渲染逻辑]
   */
  $.when(deferredGetItemCount).done(function (num) {

    /**
     * [展示商机数超过黄金展位数量上限时，该区域滚动显示]
     */
    if (num > hzItemCountLimit) {

      /**
       * [加载垂直滚动插件]
       */
      $.getScript('http://style.org.hc360.cn/js/build/source/widgets/vTicker.min.js', function () {

        /**
         * [包裹元素垂直滚动]
         */
        hzBoxNew.vTicker({
          showItems: hzItemCountLimit,
          height: 324 * hzItemCountLimit,
          pause: 7000
        });
      });
    }
  });
};

/**
 * [showProductDetail 搜索结果页商机鼠标悬浮显示商机鼠标悬浮框信息]
 * @param  {Object}   element  [鼠标悬浮元素]
 * @param  {Object}   data     [鼠标悬浮元素数据对象]
 * @param  {Function} callback [渲染回调函数]
 */
window.showProductDetail = function (element, data, callback) {

  /**
   * [li 各商品包裹元素]
   * @type {Object}
   */
  var li = element,

    /**
     * [li_data 各商品对应数据]
     * @type {Object}
     */
    li_data = data,

    /**
     * [tempHTMLArray 商品HTML模板]
     * @type {Array}
     */
    templateHTML = [
      '<div class="newShowBox">',
      '   {{if product.isShowSearchPrice}}',
      '     {{#product.intervalPriceHtml }} ',
      '    {{/if}} ',
      '    <dl>',
      '        {{if product.searchResultfotransLevelShow}}',
      '        <dt>交易等级：</dt>',
      '        <dd>',
      '            <a href="http://b2b.hc360.com/bussGrade/buss_grade.html" target="_blank">',
      '                <div class="starBox">',
      '                    {{each product.searchResultfotransLevelLength as level i}}',
      '                    <em {{if product.searchResultfotransLevelClass}}class="{{product.searchResultfotransLevelClass}}"{{/if}}></em>',
      '                    {{/each}}',
      '                </div>',
      '            </a>',
      '        </dd>',
      '        {{/if}}',
      '        {{if product.searchResultfotransCount}}',
      '        <dt>成交笔数：</dt>',
      '        <dd><a target="_blank" href="{{product.pretreatShopUrl}}/shop/show.html" p4pclickable data-sentLog="daSou">{{product.searchResultfotransCount}}笔</a></dd>',
      '        {{/if}}',
      '        {{if product.searchResultfoTp}}',
      '        <dt>主营产品：</dt>',
      '        <dd class="main_pro">',
      '            <a target="_blank" title="{{product.searchResultfoTp}}" href="{{product.pretreatShopUrl}}/shop/show.html" p4pclickable data-sentLog="daSou">{{product.pretreatMainIndustries}}</a>',
      '        </dd>',
      '        {{/if}}',
      '        {{if product.searchResultfoproductNum}}',
      '        <dt>供应产品：</dt>',
      '        <dd><a target="_blank" href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/shop/businwindow.html" p4pclickable data-sentLog="daSou">{{product.searchResultfoproductNum}}条</a></dd>',
      '        {{/if}}',
      '        {{if product.searchResultfoBm}}',
      '        <dt>经营模式：</dt>',
      '        <dd><a target="_blank" href="{{product.pretreatShopUrl}}/shop/show.html" p4pclickable data-sentLog="daSou"><span>{{product.searchResultfoBm}}</span></a></dd>',
      '        {{/if}}',
      // '        {{if product.searchResultfoCapital}}',
      // '        <dt>注册资金：</dt>',
      // '        <dd><a target="_blank" href="{{product.pretreatShopUrl}}/shop/show.html" p4pclickable data-sentLog="daSou">人民币{{product.searchResultfoCapital}}{{product.searchResultfoCapitalUnit}}</a></dd>',
      // '        {{/if}}',
      '    </dl>',
      // '    <div class="honor">',
      // '        <dl>',
      // '            <dt>商家荣誉：</dt>',
      // '            <dd>',
      // '                <a href="http://b2b.hc360.com/p4p/index.html" title="优质卖家" target="_blank" class="p4pIco2">&nbsp;</a>',
      // '                {{if product.searchResultfobw==1}}<a target="_blank" href="http://info.hc360.com/list/mvb.shtml" title="慧聪标王" class="newIco7">标王</a>{{/if}}',
      // '            </dd>',
      // '        </dl>',
      // '    </div>',
      '</div>'
    ].join('');

  /**
   * [是否存在指定索引的商品数据，若不存在则直接返回]
   */
  if (!li_data) {
    return;
  }

  /**
   * [悬浮框是否已加载，若已加载则直接返回]
   * @type {Boolean}
   */
  if (li.data('loadedCompany')) {
    // 显示相似同款
    li.find(".similars,.newImgAlert").show();
    li.find('.NewItem').addClass("hover hover2");
    return;
  }

  /**
   * 设置悬浮框正在加载
   */
  li.data('loadedCompany', true);

  /**
   * [悬浮框是否已加载，若没有加载直接显示相似同款,不用等数据渲染完毕
   * @type {Boolean}
   */
  li.find(".similars,.newImgAlert").show();
  li.find('.NewItem').addClass("hover hover2");

  // 区间价接口对象
  var spontaneouShop = $.ajax({
      url: 'http://wsdetail.b2b.hc360.com/getSupplyPrice',
      dataType: 'jsonp',
      jsonp: 'callback',
      timeout: 3000,
      data: {
        bcid: li.attr('data-businId')
      }
    }),
    // 除区间价之外的其他字段接口对象
    searchUrl = $.ajax({
      url: 'http://s.hc360.com/cgi-bin/getmmtlast.cgi',
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'jsoncallback',
      timeout: 3000,
      data: {
        w: 'site:' + (li_data.searchResultfoUserName || ''),
        c: '企业库',
        sys: 'search',
        bus: 'web',
        infotype: '1'
      }
    });
  /**
   * [获取数据并渲染悬浮框]
   */
  $.when(searchUrl, spontaneouShop).always(function (searchResult, priceResult) {
    var /*
       * 搜索接口返回的数据信息
       */
      stxt = searchResult[0],
      /*
       * 区间价返回的结果
       */
      priceResultData = priceResult[0],
      /****
       * 区间价返回的字段信息
       */
      priceData = priceResultData.data,
      /***
       * 区间价数组集合
       */
      priceArr = [],
      /***
       * 是否显示
       */
      isShowPrice = true,
      /****
       * 区间价html
       * @type {string}
       */
      innertxt = '',

      /**
       * [productExtendDetail 获取商品扩展信息数据]
       * @type {Object}
       */
      productExtendDetail = $.extend(true, {}, li_data, ((stxt.searchResultInfo || [])[0] || {})),

      /**
       * [_grade_class 交易等级区间样式配置]
       * @type {Array}
       */
      gradeClassConfig = [{
        minValue: 11,
        maxValue: 15,
        className: 'xIco'
      }, {
        minValue: 21,
        maxValue: 25,
        className: ''
      }, {
        minValue: 31,
        maxValue: 35,
        className: 'hIco'
      }],
      /***
       * 规格报价返回的字段类型，因为规格报价要特殊处理，并且后端有时候返回的字段会缺少，这里容错处理一下
       * @type {{is3y: boolean, minOrderNum: string, priceType: string, productSkuItemMOList: [*], unit: string}}
       */
      specificationsData = {
        "is3y": false,
        // 最小起订量
        "minOrderNum": "1",
        "priceType": "1",
        //规格价格列表取最低价格(unitprice)
        "productSkuItemMOList": [{
          "bcid": '',
          "skuid": '',
          "skuvalue": '',
          "storeNum": '',
          "unitprice": ''
        }],
        "unit": "个"
      };
    /***
     * 三亿和自发返回的数据不同，是三亿，则取piList字段，
     * 不是三亿判断是否是规格报价，规格报价起订量是minOrderNum，价格是productSkuItemMOList数组里面最小的价格(unitprice),混合和区间用priceMap.PriceList
     */
    if (priceResultData.state == 1) {
      if (priceData.is3y == true) {
        priceArr = priceData.piList || [];
      } else {
        //规格报价
        if (priceData.priceType == 1) {
          var cloneData = $.extend(true, specificationsData, priceData);
          if (cloneData.productSkuItemMOList) {
            var PriceArray = cloneData.productSkuItemMOList.map(function (val) {
              return val.unitprice
            });
            priceArr = [{
              intervalPriceStr: '≥' + cloneData.minOrderNum, //最小起订量
              priceHasPrecision: Math.min.apply(this, PriceArray)//价格取区间价里面最小的价格
            }];
          }
        } else {
          priceArr = (priceData.priceMap || {}).PriceListJson || [];
        }
      }

      /***
       * 如果只有一条数据，并且这条数据的价格不为0，那么就不显示区间价
       */
      if (priceArr.length == 1 && (!Number(priceArr[0].priceHasPrecision))) {
        isShowPrice = false;
      }
    } else {
      isShowPrice = false;
    }

    /***
     *
     * 拼接区间价
     */
    if (isShowPrice && priceArr.length > 0) {
      /***
       * 按照价格从高到底倒序排列
       */
      priceArr.sort(function (a, b) {
        return Number(b.priceHasPrecision) - Number(a.priceHasPrecision);
      });
      /***
       * 拼接区间价结构
       * @type {string}
       */
      innertxt += '<div class="s-priceList">';
      innertxt += '<ul class="s-price-' + priceArr.length + '">';
      $.each(priceArr, function (index, val) {
        if (val.min == 0 || val.min == "" || (!val.min)) {
          val.min = 1
        }
        var numStr = ((val.intervalPriceStr == undefined) ? '≥' + val.min : val.intervalPriceStr) + priceData.unit,
          price = Number(val.priceHasPrecision).toFixed(2);
        innertxt += '<li>';
        innertxt += '<span><a href="javascript:;" title="' + numStr + '">' + numStr + '</a></span>';
        innertxt += '<a href="javascript:;" title="&yen;' + price + '">&yen;' + ConversionPrice(val.priceHasPrecision) + '</a>';
        innertxt += '</li>';
      });
      innertxt += '</ul>';
      innertxt += '</div>';
    }
    /**
     * [isShowPrice 是否显示区间价]
     * @type {Number}
     */
    productExtendDetail.isShowSearchPrice = isShowPrice;

    /****
     * 区间价按价格降序排序
     */
    productExtendDetail.intervalPriceHtml = innertxt;

    /**
     * [searchResultfotransLevelLength 交易等级图标个数]
     * @type {Number}
     */
    productExtendDetail.searchResultfotransLevelLength = [];

    /**
     * [searchResultfotransLevel 交易等级数据类型转换]
     * @type {Number}
     */
    productExtendDetail.searchResultfotransLevel = parseInt(productExtendDetail.searchResultfotransLevel) || 0;

    /**
     * [获取交易等级样式类名]
     */
    productExtendDetail.searchResultfotransLevelClass = $.map(gradeClassConfig, function (entry, index) {
      if ((productExtendDetail.searchResultfotransLevel >= entry.minValue) && (productExtendDetail.searchResultfotransLevel <= entry.maxValue)) {
        productExtendDetail.searchResultfotransLevelLength = new Array(productExtendDetail.searchResultfotransLevel - Math.floor(productExtendDetail.searchResultfotransLevel / 10) * 10);
        return entry.className;
      }
    }).join('');

    /**
     * [searchResultfotransLevelShow 是否显示交易等级]
     * @type {Boolean}
     */
    productExtendDetail.searchResultfotransLevelShow = productExtendDetail.searchResultfotransLevel && productExtendDetail.searchResultfotransLevelLength.length;

    /**
     * [searchResultfotransCount 成交笔数数据类型转换]
     * @type {Number}
     */
    productExtendDetail.searchResultfotransCount = parseInt(productExtendDetail.searchResultfotransCount) || 0;

    /**
     * [pretreatMainIndustries 主营行业内容]
     * @type {String}
     */
    productExtendDetail.pretreatMainIndustries = '';
    var tempStr = (productExtendDetail.searchResultfoTp || '').split(",");
    for (i = 0; i < tempStr.length; i++) {
      if (checkByteLength($('<span>' + productExtendDetail.pretreatMainIndustries + tempStr[i] + '</span>').text(), 0, 40)) {
        if (checkByteLength($('<span>' + productExtendDetail.pretreatMainIndustries + tempStr[i] + '&nbsp;</span>').text(), 0, 40)) {
          productExtendDetail.pretreatMainIndustries += tempStr[i] + '&nbsp;';
        } else {
          productExtendDetail.pretreatMainIndustries += tempStr[i];
        }
      }
    }

    /**
     * [searchResultfoproductNum 供应产品数据类型转换]
     * @type {Number}
     */
    productExtendDetail.searchResultfoproductNum = parseInt(productExtendDetail.searchResultfoproductNum) || 0;

    /**
     * [searchResultfoBm 经营模式替换两边中括号]
     * @type {String}
     */
    productExtendDetail.searchResultfoBm = productExtendDetail.searchResultfoBm.replace(/[\[\]]/g, '');

    /**
     * [searchResultfoCapital 注册资金数据类型转换]
     * @type {Number}
     */
    productExtendDetail.searchResultfoCapital = parseInt(productExtendDetail.searchResultfoCapital) || 0;

    /**
     * [searchResultfoCapitalUnit 注册资金单位]
     * @type {String}
     */
    if ($.trim(productExtendDetail.searchResultfoCapitalUnit).length) {
      if (productExtendDetail.searchResultfoCapitalUnit.indexOf('人民币') != -1) {
        productExtendDetail.searchResultfoCapitalUnit = '万元';
      } else {
        productExtendDetail.searchResultfoCapitalUnit = '万' + productExtendDetail.searchResultfoCapitalUnit;
      }
    } else {
      productExtendDetail.searchResultfoCapitalUnit = '万元';
    }

    /**
     * [searchResultfobw 慧聪标王数据类型转换]
     * @type {Number}
     */
    productExtendDetail.searchResultfobw = parseInt(productExtendDetail.searchResultfobw) || 0;

    /**
     * [pretreatArea 替换省市中的空格]
     * @type {String}
     */
    productExtendDetail.pretreatArea = productExtendDetail.pretreatArea.replace(/[\s\uFEFF\xA0]/g, '');

    /**
     * 执行渲染回调函数
     */
    callback && callback(templateHTML, productExtendDetail);


  });


};

/**
 * [p4pBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({

  /**
   * [keyword 关键字]
   * @type {Object}
   */
  keyword: window.hc_keyword || '',

  /**
   * [referrer 来源]
   * @type {Number}
   */
  referrer: 1,

  /**
   * [clickableElementSelector 点击计费元素选择器]
   * @type {String}
   */
  clickableElementSelector: 'li.box1Con a',

  /**
   * [wrap 广告位包裹元素]
   * @type {Object}
   */
  wrap: $('#bwAdv'),

  /**
   * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
   * @param  {Object} element [被点击元素]
   * @return {Number}         [数据缓存中的索引值]
   */
  getClickElementCacheIndexCallback: function (element) {
    return element.closest('li.box1Con').index();
  }
});

/**
 * 监听开始获取数据事件,添加ap字段
 */
p4pBusinessLogicEntity.addEventListener('onStartGetData', function (_params) {
  _params.data =window.p4pAddition||{};
});

/**
 * [监听数据就绪事件。因为当前业务对象的后续的监听事件会修改返回数据，所以先复制出未修改的P4P数据用于P4P搜索黄金展位、P4P搜索底部展位渲染。]
 * @param  {Object} data [商品数据]
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
  var _this = this,
    p4pData = $.extend(true, {}, data),
    /**
     * [_tempHTMLArray 临时HTML数组]
     * @type {Array}
     */
    _tempHTMLArray = [],

    /**
     * [_data 商品数据]
     * @type {Array}
     */
    _data = data.searchResultInfo || [];


  /**
   * 解决P4P数据就绪延迟对象，以便向P4P搜索黄金展位、P4P搜索底部展位渲染逻辑传递数据。
   */
  deferredData.resolve(p4pData);

  /**
   * [过滤出优质的P4P商品]
   */
  var _prolist = $.map(_data, function (product, index) {
      if (Number(product.searchResultfoIsRecomHQ) === 1) {
        return product;
      }
    }),

    /**
     * 商品数据记录数
     */
    _num = _prolist.length;

  /**
   * [P4P优质个数为3个以下时，显示所有P4P商品。大于3时，显示当前分辨率下完整显示一行的商品个数]
   */
  _prolist.splice((_num <= 3 ? _num : _lineDisplayProductNum), _prolist.length);

  /****
   * 解决P4P数据就绪延迟对象后,判断页面有hidp4p标签，将data数据清空，不渲染P4P
   */
  if ($("#hidp4p").length != 0) {
    data.searchResultInfo = [];
  } else {
    /****
     * map生成了新的数组，更新到data数据里面
     * @type {Array}
     */
    data.searchResultInfo = _prolist;
  }

  /****
   * 更新第一排展示的个数
   */
  huangzhanIndex = data.searchResultInfo.length;

  /**
   * [根据P4P商品数设置模板HTML]
   * @param  {Number} _data.length [P4P商品数]
   */
  switch (huangzhanIndex) {
    case 1:
      _tempHTMLArray = [
        '<div class="bwBox1">',
        '    <ul>',
        '        {{each products as product i}}',
        '        <li class="box1Con">',
        '           <em class="searchad">广告</em>',
        '            <div class="bImgBox">',
        // '               <em>{{product.pretreatIconText}}</em>',
        '                <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}" /></a>',
        '            </div>',
        '            <div class="bwBox1List">',
        '                <div class="bwBox1Title">',
        // '                    <em>{{product.pretreatIconText}}</em>',
        '                    <h2>',
        '                       <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}">{{#product.pretreatTitle}}</a>',
        '                    </h2>',
        '                    <a title="优质" class="newYZIco">优质</a>',
        '                    <a title="开关拼实惠" class="newIco3">促</a> {{if product.pretreatIsTrade}}<a title="在线交易" class="newIco4">交易</a>{{/if}}',
        '                    <a data-sentLog="daSou" title="在线咨询" href="http://wpa.qq.com/msgrd?v=3&uin={{product.searchResultfoQq}}&site=qq&menu=yes" class="newQQIco" target="_blank">QQ</a>',
        '                </div>',
        '                <div class="rightCon">',
        '                    <div class="bwParameter">',
        '                        <ul>',
        '                            {{each product.pretreatAttrs as attr j}}',
        '                            <li>{{attr.name}}：{{attr.value}}</li>',
        '                            {{/each}}',
        '                        </ul>',
        '                    </div>',
        '                    <div class="bwBox1Price">',
        '                        <p>{{#product.pretreatPrice}}</p>',
        '                        <span>起订量 ≥{{product.searchResultfoBespeakAmount}}{{product.searchResultfoMeasureUnit}}</span>',
        '                    </div>',
        '                    <div class="bwBox1Btn">',
        '                        <a data-sentLog="daSou" href="{{product.pretreatShopUrl}}" class="xPriceBtn" target="_blank">进入商铺</a>',
        '                        <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" class="dBtn" target="_blank">查看详情</a>',
        '                    </div>',
        '                </div>',
        '                <div class="bwBox1Bot">供应商：<a data-sentLog="daSou" href="{{product.pretreatShopUrl}}" target="_blank" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a></div>',
        '            </div>',
        '        </li>',
        '        {{/each}}',
        '    </ul>',
        '</div>'
      ];
      break;

    case 2:
      _tempHTMLArray = [
        '<div class="bwBox2">',
        '    <ul>',
        '        {{each products as product i}}',
        '        <li class="box1Con">',
        '            <div class="bImgBox">',
        // '               <em>{{product.pretreatIconText}}</em>',
        '                <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}" /></a>',
        '            </div>',
        '            <div class="bwBox1List">',
        '                <div class="bwBox1Title">',
        '                    <h2>',
        '                       <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}">{{#product.pretreatTitle}}</a>',
        '                       <em class="searchad">广告</em>',
        '                    </h2>',
        '                    <div class="bwBox2Price">',
        '                        <p>{{#product.pretreatPrice}}</p>',
        '                        <a title="优质" class="newYZIco">优质</a>',
        '                        <a title="开关拼实惠" class="newIco3">促</a> {{if product.pretreatIsTrade}}<a title="在线交易" class="newIco4">交易</a>{{/if}}',
        '                        <a data-sentLog="daSou" title="在线咨询" href="http://wpa.qq.com/msgrd?v=3&uin={{product.searchResultfoQq}}&site=qq&menu=yes" class="newQQIco" target="_blank">QQ</a>',
        '                    </div>',
        '                </div>',
        '                <div class="rightCon">',
        '                    <div class="bwParameter">',
        '                        <ul>{{each product.pretreatAttrs as attr j}}',
        '                            <li>{{attr.name}}：{{attr.value}}</li>',
        '                            {{/each}}',
        '                        </ul>',
        '                    </div>',
        '                    <div class="bwBox1Bot">供应商：<a data-sentLog="daSou" href="{{product.pretreatShopUrl}}" target="_blank" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a></div>',
        '                </div>',
        '                <div class="bwBox2Btn">',
        '                    <a data-sentLog="daSou" href="{{product.pretreatShopUrl}}" class="itemBtn" target="_blank">进入商铺</a>',
        '                    <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" class="dBtn" target="_blank">查看详情</a>',
        '                </div>',
        '                <div class="bwHide" style="display:none;">',
        '                    <div class="bwHideCon">',
        '                        <dl>',
        '                            <dt>',
        '                                <h3>优质推荐</h3>',
        '                            </dt>',
        '                            <dd>',
        '                                <a data-sentLog="daSou" href="{{product.pretreatShopUrl}}" title="{{product.searchResultfoTitle}}" target="_blank">{{#product.pretreatTitle}}</a>',
        '                            </dd>',
        '                        </dl>',
        '                        <p>{{#product.pretreatPrice}}</p>',
        '                    </div>',
        '                    <div class="bwBg"></div>',
        '                </div>',
        '            </div>',
        '        </li>',
        '        {{/each}}',
        '    </ul>',
        '</div>'
      ];
      break;

    case 3:
      _tempHTMLArray = [
        '<div class="bwBox3">',
        '    <ul>',
        '        {{each products as product i}}',
        '        <li class="box1Con">',
        '            <div class="bImgBox">',
        // '               <em>{{product.pretreatIconText}}</em>',
        '                <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageBig}}" /></a>',
        '            </div>',
        '            <div class="bwBox1List">',
        '                <div class="bwBox1Title">',
        '                    <h2>',
        '                       <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank"  title="{{product.searchResultfoTitle}}">{{#product.pretreatTitle}}</a>',
        '                       <em class="searchad">广告</em>',
        '                    </h2>',
        '               </div>',
        '                <div class="rightCon">',
        '                    <div class="bwParameter">',
        '                        <ul>{{each product.pretreatAttrs as attr j}}',
        '                            <li>{{attr.name}}：{{attr.value}}</li>',
        '                            {{/each}}',
        '                        </ul>',
        '                    </div>',
        '                </div>',
        '                <div class="bwBox2Price">',
        '                    <p>{{#product.pretreatPrice}}</p>',
        '                    <a title="优质" class="newYZIco">优质</a>',
        '                    <a title="开关拼实惠" class="newIco3">促</a>',
        '                    {{if product.pretreatIsTrade}}<a title="在线交易" class="newIco4">交易</a>{{/if}}',
        '                    <a data-sentLog="daSou" title="在线咨询" href="http://wpa.qq.com/msgrd?v=3&uin={{product.searchResultfoQq}}&site=qq&menu=yes" class="newQQIco" target="_blank">QQ</a>',
        '                </div>',
        '                <div class="bwBox1Bot">供应商：<a data-sentLog="daSou" href="{{product.pretreatShopUrl}}" target="_blank" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a></div>',
        '                <div class="bwHide" style="display:none;">',
        '                    <div class="bwHideCon">',
        '                        <dl>',
        '                            <dt>',
        '                                <h3>优质推荐</h3>',
        '                            </dt>',
        '                            <dd>',
        '                               <a data-sentLog="daSou" href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}">{{#product.pretreatTitle}}</a>',
        '                           </dd>',
        '                        </dl>',
        '                        <p>{{#product.pretreatPrice}}</p>',
        '                    </div>',
        '                    <div class="bwBg"></div>',
        '                </div>',
        '            </div>',
        '        </li>',
        '        {{/each}}',
        '    </ul>',
        '</div>'
      ];
      break;

    /**
     * [在P4P商品数据大于3个时，使用和搜索结果页相同的HTML模板，且重新设置包裹元素、广告位元素渲染到页面的回调函数、广告位计费元素选择器、获取点击元素对应缓存数据回调函数]
     * @type {[type]}
     */
    default:
      _tempHTMLArray = [
        '{{each products as product i}}',
        '<li class="grid-list" data-index="{{i}}" data-businId="{{product.searchResultfoId}}" data-sellerProviderId="{{product.searchResultfoProviderid}}" data-supcatId="{{product.searchResultfoRforumclass}}" data-telPhone="{{product.searchResultfoTelephone}}">',
        '    <div class="NewItem" data-node-name="proItem">',
        '        <div class="picmid pRel" data-node-name="picArea">',
        // '            <em class="p4pYZico">{{product.pretreatIconText}}</em>',
        '            <a href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}" class="nImgBox" p4pclickable data-sentLog="daSou">',
        '                <img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}" />',
        '            </a>',
        '            <div class="{{if product.searchResultfoBrand}}similars{{else}}newImgAlert{{/if}}">',
        '                <span></span>',
        '                <a href="http://s.hc360.com/cgi-bin/simsamepar?keyword={{product.searchKeyword}}&bcid={{product.searchResultfoId}}&ssp=1" target="_blank" p4pclickable data-sentLog="daSou">相似</a>',
        '                {{if product.searchResultfoBrand}}<a href="http://s.hc360.com/cgi-bin/simsamepar?keyword={{product.searchKeyword}}&bcid={{product.searchResultfoId}}&ssp=2" target="_blank" p4pclickable data-sentLog="daSou">同款</a>{{/if}}',
        '                <a href="{{product.pretreatShopUrl}}" target="_blank" p4pclickable data-sentLog="daSou">店铺</a>',
        '            </div>',
        '        </div>',
        '        <div class="seaNewList">',
        '            <dl>',
        '                <dt>',
        '                    <span class="seaNewPrice">{{#product.pretreatPrice}}</span>',
        '                </dt>',
        '                <dd class="newName">',
        '                    <a href="http://b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank" title="{{product.searchResultfoTitle}}" p4pclickable data-sentLog="daSou">{{#product.pretreatTitle}}</a>',
        '                    <em class="searchad">广告</em>',
        '                </dd>',
        '                <dd class="newCname">',
        '                    <p>',
        '                        <a href="{{product.pretreatShopUrl}}" target="_blank" title="{{product.searchResultfoCompany}}" p4pclickable data-sentLog="daSou">{{product.searchResultfoCompany}}</a>&nbsp;',
        '                    </p>',
        '                    <div class="newNameRight">',
        '                        {{if product.searchResultfoMmtYearAge&&(product.searchResultfoMmtYearAge!=0)}}<a class="{{product.searchResultfoAsClass}}" title="{{product.searchResultfoAsName}}" target="_blank" href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/shop/mmtdocs.html" p4pclickable data-sentLog="daSou">{{product.searchResultfoMmtYearAge}}年</a>{{/if}}',
        '                        <a class="p4pIco" title="优质卖家" target="_blank" href="http://b2b.hc360.com/p4p/index.html">&nbsp;</a>',
        '                        {{if product.searchResultfobw==1}}<a target="_blank" href="http://info.hc360.com/list/mvb.shtml" title="慧聪标王" class="newBwIco"></a>{{/if}}',
        '                    </div>',
        '                </dd>',
        '                <dd class="newBotBox">',
        '                    <div class="nBotLeft">',
        '                        <div class="areaBox">',
        '                            <span title="{{product.pretreatArea}}">{{product.pretreatArea}}</span>',
        '                        </div>',
        '                        {{if product.searchResultfoauthInfo!=0}}<a class="newIco100" title="企业信息真实性已认证" target="_blank" href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/shop/mmtdocs.html">&nbsp;</a>{{/if}}',
        '                        {{if product.searchResultfoTrading==1}}<a class="newIco4" title="在线交易" target="_blank" href="http://b2b.hc360.com/mmtTrade/tran/hfb.html">&nbsp;</a>{{/if}}',
        '                    </div>',
        '                    <div class="nBotRight">',
        '                        <a title="在线咨询" class="newZXIco" onclick="onlineBox.online(&quot;{{product.searchResultfoCompany}}&quot;, &quot;{{product.searchResultfoProviderid}}&quot;); HC.UBA.sendUserlogsElement(&quot;supply_consult_p4p&quot;)"></a>',
        '                        {{if product.searchResultfoQq}}<a class="newQQIco" title="QQ交谈" target="_blank" href="http://wpa.qq.com/msgrd?v=3&amp;uin={{product.searchResultfoQq}}&amp;site=qq&amp;menu=yes" rel="nofollow" onclick="HC.UBA.sendUserlogsElement(&quot;supply_qq_p4p&quot;)">',
        '                            <em class="qqonline">&nbsp;</em>',
        '                        </a>{{/if}}',
        '                    </div>',
        '                </dd>',
        '            </dl>',
        '        </div>',
        '        <div class="Collection">',
        '            <span></span>',
        '            <a href="javascript:;" class="btnAddFavorite">收藏</a>',
        '        </div>',
        '    </div>',
        '</li>',
        '{{/each}}'
      ];

      /**
       * [若一行能够显示的数目大于直接显示商品数，用广告补全]
       */
      if (_lineDisplayProductNum > _num) {
        _tempHTMLArray.push('        <li class="grid-list">');
        _tempHTMLArray.push('            <a href="http://b2b.hc360.com/p4p/index.html" target="_blank"><img src="http://style.org.hc360.com/search/images/seaAd.png" /></a>');
        _tempHTMLArray.push('        </li>');
      }

      /**
       * 隐藏少于3个商品数据广告位包裹元素
       */
      _this.wrap.hide();

      /**
       * [clickableElementSelector 点击计费元素选择器]
       * @type {String}
       */
      _this.clickableElementSelector = 'li a[p4pclickable]',

        /**
         * [wrap 修改广告位包裹元素]
         * @type {Object}
         */
        _this.wrap = $('.wrap-grid ul:first'),

        /**
         * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
         * @param  {Object} element [被点击元素]
         * @return {Number}         [数据缓存中的索引值]
         */
        _this.getClickElementCacheIndexCallback = function (element) {
          return element.closest('li.grid-list').attr('data-index');
        },

        /**
         * [targetRenderCallback 修改广告位元素渲染到页面的回调函数]
         * @param  {Object} targetHTML [广告位元素]
         */
        _this.targetRenderCallback = function (targetHTML) {
          return $(targetHTML).prependTo(_this.wrap);
        };
      break;
  }

  /**
   * [template 设置业务对象模板HTML]
   * @type {String}
   */
  _this.template = _tempHTMLArray.join('');
});

/**
 * [监听渲染开始事件]
 * @param  {String} template         [渲染模板HTML]
 * @param  {Object} template_params  [渲染模板参数]
 */
p4pBusinessLogicEntity.addEventListener('onStartRender', function (template, template_params) {
  var _this = this,
    _prolist = template_params.products,

    /**
     * [_userLevelMapping 用户级别编码、样式类名、名称映射关系]
     * @type {Array}
     */
    _userLevelMapping = [{
      levelMatch: function (levelID) {
        return levelID === 5;
      },
      className: 'VipIco',
      levelName: 'VIP会员'
    }, {
      levelMatch: function (levelID) {
        return levelID === 6;
      },
      className: 'YpIco',
      levelName: '银牌会员'
    }, {
      levelMatch: function (levelID) {
        return levelID === 7;
      },
      className: 'JpIco',
      levelName: '金牌会员'
    }, {
      levelMatch: function (levelID) {
        return levelID === 8;
      },
      className: 'BoIco',
      levelName: '铂牌会员'
    }, {
      levelMatch: function (levelID) {
        return levelID >= 3;
      },
      className: 'mmtIco',
      levelName: '认证会员'
    }, {
      levelMatch: function (levelID) {
        return true;
      },
      className: '',
      levelName: ''
    }],

    /**
     * [_getUserLevel 获取用户级别样式类名及级别名称]
     */
    _getUserLevel = function (levelID) {
      levelID = parseInt(levelID) || 0;
      for (var i = 0; i < _userLevelMapping.length; i++) {
        if (_userLevelMapping[i].levelMatch(levelID)) {
          return _userLevelMapping[i];
        }
      }
    };

  /**
   * [将缩略图修改成 220x220 尺寸]
   */
  $.each(_prolist, function (index, product) {
    product.searchResultfoImageBig = product.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');
    product.pretreatPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' : ('<s>&yen;</s>' + ConversionPrice(product.searchResultfoUnitPrice) + '/' + product.searchResultfoMeasureUnit);
    product.searchKeyword = window.hc_keyword || '';

    /**
     * 获取和设置用户级别]
     */
    var _userLevel = _getUserLevel(product.searchResultfoAs);
    product.searchResultfoAsClass = _userLevel.className || '';
    product.searchResultfoAsName = _userLevel.levelName || '';
  });
});

/**
 * [监听渲染结束事件，绑定元素鼠标悬浮事件]
 * @param  {Object} targetElement [广告位元素]
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
  var _this = this;

  /**
   * [因为少于或多于3个商品时广告位模板不同，广告位填充的DOM元素也不同，所以在此处区分事件行为]
   */
  if (_this.cache.prolist.length <= 3) {
    targetElement.on('mouseover', ".bwBox1,.bwBox2 ul li,.bwBox3 ul li,.bwBox4 ul li", function () {
      $(this).addClass("bwHover");
    }).on('mouseout', ".bwBox1,.bwBox2 ul li,.bwBox3 ul li,.bwBox4 ul li", function () {
      $(this).removeClass("bwHover");
    }).on('mouseenter', '.box1Con .bImgBox', function () {
      $(this).parent().find('.bwHide').slideDown(100);
      $(this).find('em').hide(10);
    }).on('mouseleave', ".box1Con", function () {
      $(this).find('.bwHide').slideUp(100);
      $(this).find('em').show(10);
    });
  } else {

    /**
     * [绑定元素鼠标悬浮事件，显示商品详细信息]
     */
    targetElement.on('mouseover', 'li div[data-node-name="picArea"]', function (event) {
      var li = $(event.currentTarget).closest('li'),
        li_data = _this.cache.prolist[parseInt(li.attr('data-index'))];

      /**
       * [显示鼠标悬浮框]
       */
      window.showProductDetail(li, li_data, function (templateHTML, templateDate) {
        /**
         * [_tempHTML 获取渲染后的HTML]
         * @type {String}
         */
        var _tempHTML = _this.templateEngine.render(templateHTML)({
          product: templateDate
        });

        /**
         * [将渲染后的HTML渲染到页面]newShowBox
         * @type {String}
         */
        $(_tempHTML).appendTo(li.find('[data-node-name="proItem"]'));

      });

    }).on('mouseleave', 'li div[data-node-name="proItem"]', function (event) {
      var itemWrap = $(event.currentTarget).closest('.NewItem');
      itemWrap.removeClass("hover hover2");
      // 显示相似同款
      itemWrap.find(".similars,.newImgAlert").hide();
    })
  }

  /**
   * [绑定监测点点击事件]
   */
  targetElement.on("click", '[data-sentLog="daSou"]', function () {
    try {
      HC.UBA.sendUserlogsElement('UserBehavior_p4p_search_1_tupian');
    } catch (ex) {
    }
  });
});
/**
 * 监听开始发送曝光数据事件，增加ap曝光参数
 */
p4pBusinessLogicEntity.addEventListener('onBuildExpoData', function (_arr_expo_data_item, _data) {
  var that = this;
  /**
   * [_params 设置曝光数据]
   * @type {Array}
   */
  _arr_expo_data_item.params = [
    encodeURIComponent(that.keyword),
    _data.searchResultfoId,
    (_data.searchResultfoPlanId || ''),
    (_data.searchResultfoUnitId || ''),
    _data.searchResultfoUserId,
    _data.searchResultfoProviderid,
    that.referrer,
    _data.searchResultfoKypromote,
    ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
    '0', //百度SEM终极页项目 keywordextend 参数占位符
    '0', //百度SEM终极页项目 match 参数占位符
    '0', //百度SEM终极页项目 confr 参数占位符
    ap  //搜索AB测试
  ];
});
/**
 * 监听构建点击计费参数结束事件,增加ap参数
 */
p4pBusinessLogicEntity.addEventListener('onAfterBuildClickParams', function (_params, _data, _index) {
  /***
   * 搜索增加AB测试CTR统计，扣费增加ap参数
   * @type {string}
   */
  _params.speremark = ap
});
/**
 * 开始搜索页顶部P4P业务对象初始化
 */

p4pBusinessLogicEntity.init();


/**
 * [P4P搜索黄金展位渲染逻辑、P4P搜索底部展位渲染逻辑放到DOMContentLoaded事件中进行]
 */
$(function () {

  /**
   * [在P4P搜索黄金展位渲染延迟对象、P4P数据就绪延迟对象被解决后，执行P4P搜索黄金展位渲染逻辑]
   * @param  {Object} data                 [P4P数据集]
   * @param  {Object} deferredArgs         [延迟对象参数对象]
   */
  $.when(deferredData, deferredHUangzhan).done(function (data, deferredArgs) {

    /**
     * [_data 先复制P4P数据对象，以免影响到其他业务的数据]
     * @type {Object}
     */
    var _data = $.extend(true, {}, data || {}),

      /**
       * [_prolist P4P商品数据列表]
       * @type {Array}
       */
      _prolist = _data.searchResultInfo || [],

      /**
       * [_numlimit 最多展示的P4P商品数量上限]
       * @type {Number}
       */
      _numlimit = 5,

      /**
       * [_numItemCount 已渲染到黄金展位的广告位数量]
       * @type {Number}
       */
      _numItemCount = deferredArgs[0],

      /**
       * [_numItemCountP4P 剩余的广告位数量]
       * @type {Object}
       */
      _numItemCountP4P = deferredArgs[1],

      /**
       * [_deferredGetItemCount 获取实际渲染到黄金展位的广告位数量延迟对象]
       * @type {Object}
       */
      _deferredGetItemCount = deferredArgs[2],

      /**
       * 实际展示到黄金展位的P4P商品数量
       */
      _num = 0,

      /**
       * [_tempHTMLArray 临时模板HTML数组]
       * @type {Array}
       */
      _tempHTMLArray = [
        '{{each products as product i}}',
        '<li data-index="{{i}}">',
        '    <div class="hzBoxImg">',
        '        <a data-sentLog="p4pHZ" href="{{product.searchResultfoUrl}}" target="_blank">',
        '            <img src="{{product.searchResultfoImageBig}}">',
        '       </a>',
        '    </div>',
        '    <div class="hzImgBot">',
        '        <div class="hoverHide">',
        '            <div class="hzPriceBox"><span>{{product.pretreatConversionPrice}}</span>',
        '                <a href="javascript:void(0);" title="热门产品" target="_blank"></a>',
        '            </div>',
        '            <p class="hzProName"><a data-sentLog="p4pHZ" href="{{product.searchResultfoUrl}}" target="_blank">{{product.searchResultfoTitle}}</a>...&nbsp;<em class="searchad">广告</em></p>',
        '        </div>',
        '        <div class="hoverShow" style="display: none;" style="right:0">',
        '            <dl>',
        '                <dt>公司名：</dt>',
        '                <dd><a data-sentLog="p4pHZ" href="{{product.pretreatShopUrl}}" target="_blank" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a></dd>',
        '                <dt>地区：</dt>',
        '                <dd>{{product.pretreatArea}}</dd>',
        '            </dl>',
        '        </div>',
        '    </div>',
        '</li>',
        '{{/each}}'
      ];

    /***
     * 根据顶部p4p商品的展示条数顺序截取p4p商品展示，删除顶部展示的p4p商品
     * @type {Array.<*>}
     * @private
     */
    _prolist.splice(0, huangzhanIndex);

    /**
     * 根据最多展示的P4P商品数量上限、实际可展示的P4P商品数量、剩余广告位数量截取数据
     */
    _prolist.splice(Math.min.apply(null, [_prolist.length, _numlimit, _numItemCountP4P]), _prolist.length);

    /****
     * 如果黄展的p4p数量为0
     */
    if (_prolist.length == 0) {
      /**
       * 解决获取实际渲染到黄金展位的商品数量
       */
      _deferredGetItemCount.resolve(_numItemCount);
      return;
    }

    /**
     * [_num 设置实际添加到黄金展位的广告位数量]
     * @type {Number}
     */
    _num = _numItemCount + _prolist.length;

    /**
     * [huangzhanP4PBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
     * @type {p4pBusinessLogic}
     */
    var huangzhanP4PBusinessLogicEntity = new p4pBusinessLogic({

      /**
       * [keyword 关键字]
       * @type {Object}
       */
      keyword: window.hc_keyword || '',

      /**
       * [referrer 来源]
       * @type {Number}
       */
      referrer: 17,

      /**
       * [cache P4P数据]
       * @type {Object}
       */
      cache: _data,

      /**
       * [clickableElementSelector 点击计费元素选择器]
       * @type {String}
       */
      clickableElementSelector: 'a,button',

      /**
       * [wrap 广告位包裹元素]
       * @type {Object}
       */
      wrap: $(".hzBoxNew > ul"),

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
      getClickElementCacheIndexCallback: function (element) {
        return element.closest('[data-index]').attr('data-index');
      }
    });

    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    huangzhanP4PBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
      var _this = this;

      /**
       * 解决获取实际渲染到黄金展位的商品数量
       */
      _deferredGetItemCount.resolve(_num);

      /**
       * [绑定监测点点击事件]
       */
      targetElement.on("click", '[data-sentLog="p4pHZ"]', function () {
        try {
          HC.UBA.sendUserlogsElement('UserBehavior_p4p_huangzhan_1_tupian');
        } catch (ex) {
        }
      });
    });

    /**
     * [监听渲染开始事件]
     * @param  {String} template         [渲染模板HTML]
     * @param  {Object} template_params  [渲染模板参数]
     */
    huangzhanP4PBusinessLogicEntity.addEventListener('onStartRender', function (template, template_params) {
      var _this = this,
        _prolist = template_params.products;

      /**
       * [将缩略图修改成 220x220 尺寸]
       */
      $.each(_prolist, function (index, product) {
        product.searchResultfoImageBig = product.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');
        product.pretreatConversionPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' : ('&yen;' + ConversionPrice(product.searchResultfoUnitPrice) + ' &frasl;' + product.searchResultfoMeasureUnit);
      });
    });

    /**
     * 监听开始发送曝光数据事件，增加ap曝光参数
     */
    huangzhanP4PBusinessLogicEntity.addEventListener('onBuildExpoData', function (_arr_expo_data_item, _data) {
      var that = this;
      /**
       * [_params 设置曝光数据]
       * @type {Array}
       */
      _arr_expo_data_item.params = [
        encodeURIComponent(that.keyword),
        _data.searchResultfoId,
        (_data.searchResultfoPlanId || ''),
        (_data.searchResultfoUnitId || ''),
        _data.searchResultfoUserId,
        _data.searchResultfoProviderid,
        that.referrer,
        _data.searchResultfoKypromote,
        ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
        '0', //百度SEM终极页项目 keywordextend 参数占位符
        '0', //百度SEM终极页项目 match 参数占位符
        '0', //百度SEM终极页项目 confr 参数占位符
        ap  //搜索AB测试
      ];
    });
    /**
     * 监听构建点击计费参数结束事件,增加ap参数
     */
    huangzhanP4PBusinessLogicEntity.addEventListener('onAfterBuildClickParams', function (_params, _data, _index) {
      /***
       * 搜索增加AB测试CTR统计，扣费增加ap参数
       * @type {string}
       */
      _params.speremark = ap
    });

    /**
     * 开始搜索页黄展P4P业务对象初始化
     */
    huangzhanP4PBusinessLogicEntity.init();
  });

  /**
   * [在P4P数据就绪延迟对象被解决后，执行P4P搜索底部展位渲染逻辑]
   * @param  {Object} data                 [P4P数据集]
   */
  $.when(deferredData).done(function (data) {


    /**
     * [hidShowBottomP4P 是否渲染的判断条件]
     * @type {[type]}
     */
    var _isShowBottomP4P = Number($('#hidShowBottomP4P').val()) || 0,

      /**
       * [_data 先复制P4P数据对象，以免影响到其他业务的数据]
       * @type {Object}
       */
      _data = $.extend(true, {}, data || {}),

      /**
       * [_prolist P4P商品数据列表]
       * @type {Array}
       */
      _prolist = _data.searchResultInfo || [];

    /**
     * [若不满足渲染条件，直接返回]
     */
    if (!_isShowBottomP4P) {
      return;
    }

    /**
     * [过滤出优质的P4P商品]
     */
    _prolist = $.map(_prolist, function (product, index) {
      if (Number(product.searchResultfoIsRecomHQ) === 1) {
        return product;
      }
    });

    /**
     * [与顶部P4P数据排重，顶部根据分辨率不同显示相应数量的商品，从总数据集中剔除顶部已显示商品数据]
     */
    _prolist.splice(0, huangzhanIndex);


    /***
     * 根据屏幕分辨率，截取展示上线,删除大于当前屏幕分辨率的数据
     * @type {Array.<*>}
     * @private
     */
    _prolist.splice(_lineDisplayProductNum, _prolist.length);

    /**
     * [searchResultInfo 因为 $.map 生成了新的数组，所以此处再将过滤后的数据更新到原始数据集中]
     */
    _data.searchResultInfo = _prolist;

    /**
     * [若没有要展示的数据，直接返回]
     */
    if (!_prolist.length) {
      return;
    }

    /**
     * [若排除掉顶部商品数据后，剩下的商品数据不能够完整显示一行，则直接返回]
     */
    if (_prolist.length < _lineDisplayProductNum) {
      return;
    }

    /**
     * [_tempHTMLArray 拼接html模板]
     * @type {Array}
     */
    var _tempHTMLArray = [
      '{{each products as product i}}',
      '<li class="grid-list" data-index="{{i}}" data-businId="{{product.searchResultfoId}}" data-sellerProviderId="{{product.searchResultfoProviderid}}" data-supcatId="{{product.searchResultfoRforumclass}}" data-telPhone="{{product.searchResultfoTelephone}}">',
      '    <div class="NewItem" data-node-name="proItem">',
      '        <div class="picmid pRel" data-node-name="picArea">',
      // '            <em class="p4pYZico">{{product.pretreatIconText}}</em>',
      '            <a href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.searchResultfoTitle}}" class="nImgBox" p4pclickable data-sentLog="daSou">',
      '                <img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}" />',
      '            </a>',
      '            <div class="{{if product.searchResultfoBrand}}similars{{else}}newImgAlert{{/if}}">',
      '                <span></span>',
      '                <a href="http://s.hc360.com/cgi-bin/simsamepar?keyword={{product.searchKeyword}}&bcid={{product.searchResultfoId}}&ssp=1" target="_blank" p4pclickable data-sentLog="daSou">相似</a>',
      '                {{if product.searchResultfoBrand}}<a href="http://s.hc360.com/cgi-bin/simsamepar?keyword={{product.searchKeyword}}&bcid={{product.searchResultfoId}}&ssp=2" target="_blank" p4pclickable data-sentLog="daSou">同款</a>{{/if}}',
      '                <a href="{{product.pretreatShopUrl}}" target="_blank" p4pclickable data-sentLog="daSou">店铺</a>',
      '            </div>',
      '        </div>',
      '        <div class="seaNewList">',
      '            <dl>',
      '                <dt>',
      '                    <span class="seaNewPrice">{{#product.pretreatPrice}}</span>',
      '                </dt>',
      '                <dd class="newName">',
      '                    <a href="http://b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank" title="{{product.searchResultfoTitle}}" p4pclickable data-sentLog="daSou">{{#product.pretreatTitle}}</a>',
      '                    <em class="searchad">广告</em>',
      '                </dd>',
      '                <dd class="newCname">',
      '                    <p>',
      '                        <a href="{{product.pretreatShopUrl}}" target="_blank" title="{{product.searchResultfoCompany}}" p4pclickable data-sentLog="daSou">{{product.searchResultfoCompany}}</a>&nbsp;',
      '                    </p>',
      '                    <div class="newNameRight">',
      '                        {{if product.searchResultfoMmtYearAge&&(product.searchResultfoMmtYearAge!=0)}}<a class="{{product.searchResultfoAsClass}}" title="{{product.searchResultfoAsName}}" target="_blank" href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/shop/mmtdocs.html" p4pclickable data-sentLog="daSou">{{product.searchResultfoMmtYearAge}}年</a>{{/if}}',
      '                        <a class="p4pIco" title="优质卖家" target="_blank" href="http://b2b.hc360.com/p4p/index.html">&nbsp;</a>',
      '                        {{if product.searchResultfobw==1}}<a target="_blank" href="http://info.hc360.com/list/mvb.shtml" title="慧聪标王" class="newBwIco"></a>{{/if}}',
      '                    </div>',
      '                </dd>',
      '                <dd class="newBotBox">',
      '                    <div class="nBotLeft">',
      '                        <div class="areaBox">',
      '                            <span title="{{product.pretreatArea}}">{{product.pretreatArea}}</span>',
      '                        </div>',
      '                        {{if product.searchResultfoauthInfo!=0}}<a class="newIco100" title="企业信息真实性已认证" target="_blank" href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/shop/mmtdocs.html">&nbsp;</a>{{/if}}',
      '                        {{if product.searchResultfoTrading==1}}<a class="newIco4" title="在线交易" target="_blank" href="http://b2b.hc360.com/mmtTrade/tran/hfb.html">&nbsp;</a>{{/if}}',
      '                    </div>',
      '                    <div class="nBotRight">',
      '                        <a title="在线咨询" class="newZXIco" onclick="onlineBox.online(&quot;{{product.searchResultfoCompany}}&quot;, &quot;{{product.searchResultfoProviderid}}&quot;); HC.UBA.sendUserlogsElement(&quot;supply_consult_p4p&quot;)"></a>',
      '                        {{if product.searchResultfoQq}}<a class="newQQIco" title="QQ交谈" target="_blank" href="http://wpa.qq.com/msgrd?v=3&amp;uin={{product.searchResultfoQq}}&amp;site=qq&amp;menu=yes" rel="nofollow" onclick="HC.UBA.sendUserlogsElement(&quot;supply_qq_p4p&quot;)">',
      '                            <em class="qqonline">&nbsp;</em>',
      '                        </a>{{/if}}',
      '                    </div>',
      '                </dd>',
      '            </dl>',
      '        </div>',
      '        <div class="Collection">',
      '            <span></span>',
      '            <a href="javascript:;" class="btnAddFavorite">收藏</a>',
      '        </div>',
      '    </div>',
      '</li>',
      '{{/each}}'
    ];

    /**
     * [bottomP4PBusinessLogicEntity 实例化P4P基础业务逻辑对象实例]
     * @type {p4pBusinessLogic}
     */
    var bottomP4PBusinessLogicEntity = new p4pBusinessLogic({

      /**
       * [keyword 关键字]
       * @type {Object}
       */
      keyword: window.hc_keyword || '',

      /**
       * [referrer 来源]
       * @type {Number}
       */
      referrer: 18,

      /**
       * [clickableElementSelector 点击计费元素选择器]
       * @type {String}
       */
      clickableElementSelector: 'li a[p4pclickable]',

      /**
       * [wrap 广告位包裹元素]
       * @type {Object}
       */
      wrap: function () {
        return $('<ul></ul>').appendTo($('.wrap-grid'));
      },

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
      getClickElementCacheIndexCallback: function (element) {
        return element.closest('li.grid-list').attr('data-index');
      }
    });

    /**
     * [监听渲染开始事件]
     * @param  {String} template         [渲染模板HTML]
     * @param  {Object} template_params  [渲染模板参数]
     */
    bottomP4PBusinessLogicEntity.addEventListener('onStartRender', function (template, template_params) {
      var _this = this,
        _prolist = template_params.products,

        /**
         * [_userLevelMapping 用户级别编码、样式类名、名称映射关系]
         * @type {Array}
         */
        _userLevelMapping = [{
          levelMatch: function (levelID) {
            return levelID === 5;
          },
          className: 'VipIco',
          levelName: 'VIP会员'
        }, {
          levelMatch: function (levelID) {
            return levelID === 6;
          },
          className: 'YpIco',
          levelName: '银牌会员'
        }, {
          levelMatch: function (levelID) {
            return levelID === 7;
          },
          className: 'JpIco',
          levelName: '金牌会员'
        }, {
          levelMatch: function (levelID) {
            return levelID === 8;
          },
          className: 'BoIco',
          levelName: '铂牌会员'
        }, {
          levelMatch: function (levelID) {
            return levelID >= 3;
          },
          className: 'mmtIco',
          levelName: '认证会员'
        }, {
          levelMatch: function (levelID) {
            return true;
          },
          className: '',
          levelName: ''
        }],

        /**
         * [_getUserLevel 获取用户级别样式类名及级别名称]
         */
        _getUserLevel = function (levelID) {
          levelID = parseInt(levelID) || 0;
          for (var i = 0; i < _userLevelMapping.length; i++) {
            if (_userLevelMapping[i].levelMatch(levelID)) {
              return _userLevelMapping[i];
            }
          }
        };

      /**
       * [将缩略图修改成 220x220 尺寸]
       */
      $.each(_prolist, function (index, product) {
        product.searchResultfoImageBig = product.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');
        product.pretreatPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '面议' : ('<s>&yen;</s>' + ConversionPrice(product.searchResultfoUnitPrice) + '/' + product.searchResultfoMeasureUnit);
        product.searchKeyword = window.hc_keyword || '';

        /**
         * 获取和设置用户级别]
         */
        var _userLevel = _getUserLevel(product.searchResultfoAs);
        product.searchResultfoAsClass = _userLevel.className || '';
        product.searchResultfoAsName = _userLevel.levelName || '';
      });
    });

    /**
     * [监听渲染结束事件]
     * @param  {Object} targetElement [广告位元素]
     */
    bottomP4PBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
      var _this = this;

      /**
       * [绑定元素鼠标悬浮事件，显示商品详细信息]
       */
      targetElement.on('mouseover', 'li div[data-node-name="picArea"]', function (event) {
        var li = $(event.currentTarget).closest('li'),
          li_data = _this.cache.prolist[parseInt(li.attr('data-index'))],
          itemWrap = li.find('.NewItem');

        /**
         * [显示鼠标悬浮框]
         */
        window.showProductDetail(li, li_data, function (templateHTML, templateDate) {
          /**
           * [_tempHTML 获取渲染后的HTML]
           * @type {String}
           */
          var _tempHTML = _this.templateEngine.render(templateHTML)({
            product: templateDate
          });

          /**
           * [将渲染后的HTML渲染到页面]newShowBox
           * @type {String}
           */
          $(_tempHTML).appendTo(li.find('[data-node-name="proItem"]'));

        });

      }).on('mouseleave', 'li div[data-node-name="picArea"]', function (event) {
        var itemWrap = $(event.currentTarget).closest('.NewItem');
        itemWrap.removeClass("hover hover2");
        // 隐藏相似同款
        itemWrap.find(".similars,.newImgAlert").hide();
      });

      /**
       * [绑定监测点点击事件]
       */
      targetElement.on("click", '[data-sentLog="daSou"]', function () {
        try {
          HC.UBA.sendUserlogsElement('UserBehavior_p4p_search_bottom');
        } catch (ex) {
        }
      });
    });

    /**
     * 监听开始发送曝光数据事件，增加ap曝光参数
     */
    bottomP4PBusinessLogicEntity.addEventListener('onBuildExpoData', function (_arr_expo_data_item, _data) {
      var that = this;
      /**
       * [_params 设置曝光数据]
       * @type {Array}
       */
      _arr_expo_data_item.params = [
        encodeURIComponent(that.keyword),
        _data.searchResultfoId,
        (_data.searchResultfoPlanId || ''),
        (_data.searchResultfoUnitId || ''),
        _data.searchResultfoUserId,
        _data.searchResultfoProviderid,
        that.referrer,
        _data.searchResultfoKypromote,
        ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
        '0', //百度SEM终极页项目 keywordextend 参数占位符
        '0', //百度SEM终极页项目 match 参数占位符
        '0', //百度SEM终极页项目 confr 参数占位符
        ap  //搜索AB测试
      ];
    });
    /**
     * 监听构建点击计费参数结束事件,增加ap参数
     */
    bottomP4PBusinessLogicEntity.addEventListener('onAfterBuildClickParams', function (_params, _data, _index) {
      /***
       * 搜索增加AB测试CTR统计，扣费增加ap参数
       * @type {string}
       */
      _params.speremark = ap
    });

    /**
     * 开始搜索页底部P4P业务对象初始化,页面有hidp4p标签不渲染顶部和底部的P4P业务逻辑
     */
    if ($("#hidp4p").length == 0) {
      bottomP4PBusinessLogicEntity.init();
    }
  });

  /****
   *  [在P4P数据就绪延迟对象被解决后，加载查询条件上面的P4P渲染逻辑]
   */
  $.when(deferredData).done(function (data) {
    /**
     * [_data 先复制P4P数据对象，以免影响到其他业务的数据]
     * @type {Object}
     */
    var _data = $.extend(true, {}, data || {}),

      _url = p4pBusinessLogic.prototype.parseURL(document.URL),

      pageIndex = _url.params.ee,

      /**
       * [_prolist P4P优质商品数据列表]
       * @type {Array}
       */
      _prolist = [],

      /****
       * _index 当前页面p4p商品的索引值
       * @type {*}
       * @private
       */
      _index,

      /**
       * 当前页面的p4p商品
       */
      p4pPro,


      /****
       * 底部优质推荐的展示索引：每页展示P4P推荐20条以后的信息或非优质信息
       */

      _limit = 20,

      /***
       * 一行显示条数
       */
      minLen = 4;
    /**
     * [获取当前分辨率下完整显示一行的商品个数]
     */
    if (_tempScreenWidth >= 1200 && _tempScreenWidth < 1440) {
      minLen = 3;
    }

    /****
     * _index 当前页面p4p商品的索引值
     * @type {*}
     * @private
     */
    _index = pageIndex ? (pageIndex - 1) * minLen : 0;
    /**
     * [过滤出优质的P4P商品]
     */
    $.each(_data.searchResultInfo, function (index, product) {
      if (Number(product.searchResultfoIsRecomHQ) === 1) {
        _prolist.push(product);
      }
    });


    /**
     * 如果优质的商品大于上面p4p展示最大条数，剩下的优质放入底部展示数组
     */
    if (_prolist.length > _limit) {
      /***
       * 除去当前p4p的条数，剩下的商品放入recommendedArr里面，下面热门推荐使用
       * @type {Array.<*>}
       */
      recommendedArr = _prolist.slice(_limit);
      _prolist.splice(_limit, _prolist.length);
    }

    /**
     * [从当前页面索引开始截取数据，返回一个当前页面的p4p数据列表]
     */
    p4pPro = _prolist.splice(_index, minLen);

    /***
     * [商品数据不能够完整显示一行，则直接返回]
     */
    if (p4pPro.length < minLen) {
      return;
    }

    /**
     * [_tempHTMLArray 拼接html模板]
     * @type {Array}
     */
    var _tempHTMLArray = [
      '{{each products as product i}}',
      '<li>',
      '<div class="p4pLeftImg"><a href="{{product.searchResultfoUrl}}" target="_blank"><img src="{{product.businImage2}}" alt="{{product.searchResultfoTitle}}" title="{{product.searchResultfoTitle}}"></a></div>',
      '<div class="p4pRigList">',
      '<dl>',
      '<dt><a href="{{product.searchResultfoUrl}}" target="_blank" title="{{product.corKeyword}}">{{product.corKeyword}}</a></dt>',
      '</dl>',
      '{{if product.searchResultfoBrand}}',
      '<p><span>品牌：</span>{{product.searchResultfoBrand}}</p>',
      '{{/if}}',
      '{{each product.pretreatAttrs }}',
      '{{if $index<3 }}',
      '<p><span>{{$value.name}}：</span>{{$value.value}}</p>',
      '{{/if}}',
      '{{/each}}',
      '{{if product.searchResultfoCompany}}',
      '<p><span>公司名称：</span><a href="http://{{product.searchResultfoUserName}}.b2b.hc360.com/" target="_blank" title="{{product.searchResultfoCompany}}">{{product.searchResultfoCompany}}</a></p>',
      '{{/if}}',
      '</div>',
      '</li>',
      '{{/each}}'
    ];

    /****
     * 获取当前页面数据的bcid
     */
    var bcIdStr = $.map(p4pPro, function (item) {
      return item.searchResultfoId
    });

    /****
     *  重新拽一个p4p接口，参数是当前页面p4p的bcid以逗号拼接的字符串，返回当前p4p的商品的关键词和第二张商品图片
     */
    var businImgDeferre = $.ajax({
      url: 'http://p4pdetail.hc360.com/p4pdetail/common/get/businImage.html',
      method: 'get',
      data: {
        businId: bcIdStr.join(',')
      },
      dataType: 'jsonp',
      jsonp: 'callback',
      success: function (data) {

      }
    });

    businImgDeferre.done(function (data) {
      $.each(data, function (index, val) {
        var bcid = val.bcid,
          businImage2 = val.businImage2,
          corKeyword = val.coreKeyword;
        $.each(p4pPro, function (index, item) {
          if (item.searchResultfoId == bcid) {
            item.businImage2 = businImage2 ? businImage2 : item.searchResultfoImageBig;
            item.corKeyword = corKeyword ? (wordInclude(window.hc_keyword, corKeyword) ? corKeyword : window.hc_keyword) : item.searchResultfoTitle;
            return;
          }

        })
      });
      /**
       * [searchResultInfo 因为 $.map 生成了新的数组，所以此处再将过滤后的数据更新到原始数据集中]
       */
      _data.searchResultInfo = p4pPro;

      var searchTopP4pEntity = new p4pBusinessLogic({
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: window.hc_keyword || '',
        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 26,
        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: $('#searchTopP4pWrap ul'),

        /**
         * [cache P4P数据]
         * @type {Object}
         */
        cache: _data,
        /**
         * [template 模板HTML]
         * @type {String}
         */
        template: _tempHTMLArray.join('')

      });
      /****
       * 开始渲染事件
       */
      searchTopP4pEntity.addEventListener('onStartRender', function (_template, _template_params) {
        var _prolist = _template_params.products;

        /**
         * [将缩略图修改成 220x220 尺寸]
         */
        $.each(_prolist, function (index, product) {
          product.searchResultfoImageBig = product.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');
        });
      });

      /***
       * 渲染结束
       */
      searchTopP4pEntity.addEventListener('onEndRender', function (targetElement) {
        /***
         * 显示p4p外层div
         */
        $('#searchTopP4pWrap').show();

        /****
         * 发送监测点
         */
        targetElement.on('click', 'a', function () {
          try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_search_screenMonitor');
          } catch (e) {
            console.error(e);
          }
        });

      });

      /**
       * 监听开始发送曝光数据事件，增加ap曝光参数
       */
      searchTopP4pEntity.addEventListener('onBuildExpoData', function (_arr_expo_data_item, _data) {
        var that = this;
        /**
         * [_params 设置曝光数据]
         * @type {Array}
         */
        _arr_expo_data_item.params = [
          encodeURIComponent(that.keyword),
          _data.searchResultfoId,
          (_data.searchResultfoPlanId || ''),
          (_data.searchResultfoUnitId || ''),
          _data.searchResultfoUserId,
          _data.searchResultfoProviderid,
          that.referrer,
          _data.searchResultfoKypromote,
          ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
          '0', //百度SEM终极页项目 keywordextend 参数占位符
          '0', //百度SEM终极页项目 match 参数占位符
          '0', //百度SEM终极页项目 confr 参数占位符
          ap  //搜索AB测试
        ];
      });
      /**
       * 监听构建点击计费参数结束事件,增加ap参数
       */
      searchTopP4pEntity.addEventListener('onAfterBuildClickParams', function (_params, _data, _index) {
        /***
         * 搜索增加AB测试CTR统计，扣费增加ap参数
         * @type {string}
         */
        _params.speremark = ap
      });

      /****
       * 初始化p4p业务逻辑
       */
      searchTopP4pEntity.init();
    });


    /****
     * 判断一个词中是否包含另外一个词中的任意字符
     */
    function wordInclude(searchWord, coreWord) {
      var wordArr = coreWord.split(''),
        isInclude = false;
      $.each(wordArr, function (index, val) {
        if (searchWord.indexOf(val) >= 0) {
          isInclude = true;
          return false;
        }
      });
      return isInclude;
    }

  })

});
/****
 * 初始化左右滚动
 */
function slider(option) {
  var LEFT = -1,
    RIGHT = 1,
    itemBox = option.container.find('ul'),
    totalItemsCount = itemBox.find('li').length,
    item = itemBox.find('li:first');
  /****
   * 小于一屏，隐藏左右按钮
   */
  if (option.limit && totalItemsCount == option.limit) {
    option.leftBtn.hide();
    option.rightBtn.hide();
  }
  var containerWidth = option.container.width(),
    itemWidth = item.width() + parseInt(item.css('margin-left'), 10) + parseInt(item.css('margin-right'), 10),
    perPageCount = Math.floor(containerWidth / itemWidth),
    totalPageCount = Math.ceil((totalItemsCount / perPageCount) - 1),
    currentPageIndex = 0;

  function move(direction) {
    var limitedPageIndex;
    if (direction === RIGHT) {
      limitedPageIndex = totalPageCount;
    }
    if (direction === LEFT) {
      limitedPageIndex = 0;
    }

    if (currentPageIndex === limitedPageIndex) {
      return;
    }
    currentPageIndex += direction;
    itemBox.animate({'margin-left': -containerWidth * currentPageIndex}, 200);
  }

  option.leftBtn.click(function () {
    move(LEFT);
  });

  option.rightBtn.click(function () {
    move(RIGHT);
  })
}

/****
 * 底部热门推荐p4p补充逻辑
 */
window.search_recommend_callback = function () {
  /***
   * [在P4P数据就绪延迟对象被解决后，执行热门推荐的P4P渲染逻辑]
   */
  $.when(deferredData).done(function (data) {
    /**
     * [_data 先复制P4P数据对象，以免影响到其他业务的数据]
     * @type {Object}
     */
    var _data = $.extend(true, {}, data || {}),
      /**
       * 热门推荐已经有的条数len
       * @type {*}
       */
      proLen = $('.picBoxBot ul li').length,
      /***
       * 需要补充的条数
       * @type {number}
       */
      len = 20 - proLen;
    /****
     * 需要补充的条数为0，直接返回；
     */
    if (len == 0) {
      return false;
    }
    /**
     * [若没有要展示的p4p数据，调用其他的补充逻辑]
     */
    if (!recommendedArr.length) {
      window.S_recommend && window.S_recommend();
      return;
    }

    /**
     * 过滤出底部要补充的数据，更新到原有数组里面
     */
    _data.searchResultInfo = recommendedArr.slice(0, len);

    /**
     * [_tempHTMLArray 拼接html模板]
     * @type {Array}
     */
    var _tempHTMLArray = [
      '{{each products as product i}}',
      '<li data-p4p="{{i}}" data-businId="{{product.searchResultfoId}}" data-UserName="{{product.searchResultfoUserName}}">',
      '<dl>',
      '<dt>',
      '<div class="picBoxImgCon">',
      '<a href="{{ product.searchResultfoUrl }}" data-exposurelog="{{product.searchResultfoUserName}},{{product.searchResultfoId}},suggest,{{i+1}},1,{{product.hc_keyword}}" title="{{ product.searchResultfoText }}" target="_blank"   >',
      '<img src="{{ product.searchResultfoImageBig }}">',
      '</a>',
      '</div>',
      '</dt>',
      '<dd class="picBoxPrice">{{#product.priceHtml}}</dd>',
      '<dd class="picBotName">',
      '<a href="{{ product.searchResultfoUrl }}"  title="{{ product.searchResultfoText }}" target="_blank">{{#product.searchTitle}}</a>',
      '</dd>',
      '</dl>',
      '</li>',
      '{{/each}}'
    ];

    var recommendedP4pEntity = new p4pBusinessLogic({
      /**
       * [keyword 关键字]
       * @type {Object}
       */
      keyword: window.hc_keyword || '',
      /**
       * [referrer 来源]
       * @type {Number}
       */
      referrer: 27,
      /**
       * [clickableElementSelector 点击计费元素选择器]
       * @type {String}
       */
      clickableElementSelector: 'a',

      /**
       * [wrap 广告位包裹元素]
       * @type {Object}
       */
      wrap: $('.picBoxBot ul'),

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
      /****
       * 获取当前点击元素在数据的索引值
       * @param element
       * @returns {*}
       */
      getClickElementCacheIndexCallback: function (element) {
        return element.closest('li').attr('data-p4p');
      }

    });

    /****
     * 开始渲染事件
     */
    recommendedP4pEntity.addEventListener('onStartRender', function (_template, _template_params) {
      /**
       * [_tempRegExp 替换标题正则表达式对象]
       * @type {RegExp}
       */
      var _this = this,
        _tempRegExp = new RegExp(_this.keyword, 'img'),
        _prolist = _template_params.products;

      /***
       * 拼接价格dom结构
       * @param price 价格
       * @param url 链接地址
       * @param unit 单位
       * @returns {string}
       */
      function getPirceHtml(price, url, unit) {
        var price = ConversionPrice(price),
          str = '<em>&yen;</em>' + price;
        if (Number(price) == 0) {
          str = '<a  target="_blank" class="getPrice" href=\"' + url + '#contact\">点此询价</a>';
        } else if (unit.length != 0) {
          str = str + '/' + unit;
        }
        return str;
      }


      /**
       * 修改数据
       */
      $.each(_prolist, function (index, product) {
        /***
         * [将缩略图修改成 220x220 尺寸]
         */
        product.searchResultfoImageBig = product.searchResultfoImageBig.replace(/(\.\.)(\d+x\d+)/ig, '$1220x220a');
        product.hc_keyword = _this.keyword || '';
        /***
         * 标题关键词加红
         * @type {*}
         */
        product.searchTitle = product.searchResultfoTitle.replace(_tempRegExp, '<span class="text_red">' + _this.keyword + '</span>');
        /***
         *  价格html
         */
        product.priceHtml = getPirceHtml(product.searchResultfoUnitPrice, product.searchResultfoUrl, product.searchResultfoMeasureUnit);

      });


    });

    /****
     * 渲染结束
     */
    recommendedP4pEntity.addEventListener('onEndRender', function (targetElement) {
      var _index = targetElement.index(),
        businId = targetElement.attr('data-businId'),
        UserName = targetElement.attr('data-UserName');


      /****
       * 发送监测点
       */
      targetElement.on('click', 'a', function () {
        /***
         * 发送检测日志，页面原有逻辑
         */
        if (window.search_log_new) {
          window.search_log_new("searchsupply_suggest_pic_", _index, 1, UserName, businId)
        }
        try {
          HC.UBA.sendUserlogsElement('UserBehavior_p4p_search_bottom_hotrecommend');
        } catch (e) {
          console.error(e);
        }
      });

      /****
       * 如果p4p补充的不够，则执行supply_common的boottom_recommend方法去补充
       */
      if (this.cache.searchResultInfo.length < len) {
        window.S_recommend && window.S_recommend();
      } else {
        /****
         * 初始化左右滚动
         */
        slider({
          container: $('.picBoxBot'),
          leftBtn: $('.left-i'),
          rightBtn: $('.right-i')
        })
      }
    });

    /**
     * 监听开始发送曝光数据事件，增加ap曝光参数
     */
    recommendedP4pEntity.addEventListener('onBuildExpoData', function (_arr_expo_data_item, _data) {
      var that = this;
      /**
       * [_params 设置曝光数据]
       * @type {Array}
       */
      _arr_expo_data_item.params = [
        encodeURIComponent(that.keyword),
        _data.searchResultfoId,
        (_data.searchResultfoPlanId || ''),
        (_data.searchResultfoUnitId || ''),
        _data.searchResultfoUserId,
        _data.searchResultfoProviderid,
        that.referrer,
        _data.searchResultfoKypromote,
        ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //兼容PC端、移动端获取PAGEID
        '0', //百度SEM终极页项目 keywordextend 参数占位符
        '0', //百度SEM终极页项目 match 参数占位符
        '0', //百度SEM终极页项目 confr 参数占位符
        ap  //搜索AB测试
      ];
    });
    /**
     * 监听构建点击计费参数结束事件,增加ap参数
     */
    recommendedP4pEntity.addEventListener('onAfterBuildClickParams', function (_params, _data, _index) {
      /***
       * 搜索增加AB测试CTR统计，扣费增加ap参数
       * @type {string}
       */
      _params.speremark = ap
    });

    /****
     * 初始化p4p业务逻辑
     */
    recommendedP4pEntity.init();

  })
};
