var p4pMadataSuccess = require('./p4p.base'),
    _temp = require('template');

function getQueryString(key) {
  var search = window.location.search;
  var regExp = new RegExp('[\\?\\&]([^\\?\\&]+)=([^\\?\\&]+)', 'ig');
  var queryStringList = {};
  var parttern;
  while ((parttern = regExp.exec(search))) {
      if (!queryStringList[parttern[1].toLowerCase()]) {
          queryStringList[parttern[1].toLowerCase()] = parttern[2];
      }
  };
  //返回指定键的值
  if (key) {
      return queryStringList[key.toLowerCase()] || '';
  };
  //返回所有查询参数
  return queryStringList;
};

window.onload = function (){
    var chaseId = getQueryString('purchaseId');
    getList('http://madata.hc360.com/wxservice/purchase/getPurchaseDetail',{
      'purchaseId': chaseId, //chaseId//,
      'infoId':'',
      'bcid': '',//516448795,//,
      '_': '',//151116470790//
    },function (opt){
      if(opt.msgBody !== undefined){
        var result = opt.msgBody.p4pcoreKeyword;
        MadataRender(result);
      } else {
        $('fb_cox').hide();
      }
    },'callback');
};
function getList(url,result,_callback,jsonp_callback){
  $.ajax({
    url: url,
    jsonp: jsonp_callback,
    dataType: 'jsonp',
    data: result,
    success:_callback
  })
};
// http://s.hc360.com/cgi-bin/getmmtlast.cgi
var p4pBusinessLogicEntity,
    templateArr = [
        '{{each products as product i}}',
        '<li>',
            '<p class="p_1"><a href="https://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank"><img src="https:{{product.searchResultfoImageBig}}"></a></p>',
            '<p class="p_2"><a href="https://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">{{product.searchResultfoText}}</a></p>',
            '<p class="p_3"><a href="https://m.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">询价</a></p>',
        '</li>',
        '{{/each}}'
    ];
function MadataRender(opt){
  p4pBusinessLogicEntity = new p4pMadataSuccess({
    /**
     * [keyword 关键字]
     * @type {Object}
     */
    keyword: opt,

    /**
     * [referrer 来源]
     * @type {Number}
     */
    referrer: 38,

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [cache 数据缓存]
     * @type {Object}
     */
    cache: null,

    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $('.fb_cox ul'),

    /**
     * [autoSendExpoData 是否自动发送曝光数据]
     * @type {Boolean}
     */
    autoSendExpoData: true,

    /**
     * [targetRenderCallback 广告位元素渲染到页面的回调函数]
     * @param  {Object} targetHTML [广告位元素]
     */
    targetRenderCallback: function(targetHTML) {
        var _this = this;
        return $(targetHTML).prependTo(_this.wrap);
    }
  });
  /****
   * 监听数据加载完毕事件
   */

  p4pBusinessLogicEntity.addEventListener('onDataReady',function(data){
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

       /***
        * 过滤优质的P4P数据
        */

       // _prolist = $.map(_prolist,function (product) {
       //     if (Number(product.searchResultfoIsRecomHQ) === 1) {
       //         return product;
       //     }
       //  }),
       /**
        * [_tempHTMLArray 临时HTML数组]
        * @type {Array}
        */
       _tempHTMLArray = templateArr,

       /**
        * [_limit P4P广告位数量上限]
        * @type {Number}
        */
       _limit = 8;

       /**
        * [根据P4P广告位数量上限截取P4P数据]
        */
       _prolist.splice(_limit,_prolist.length);
       /**
        * [P4P广告位数量不够显示一行时]
        */

       _data.searchResultInfo = _prolist;
       /**
        * [template 设置模板HTML]
        * @type {String}
        */
       _this.template = _tempHTMLArray.join('');

       if (_prolist.length < _limit) {
           var numLength = _limit - _prolist.length;
           searchComplement(numLength,opt)
       }else {
         return ;
       }
  });
  p4pBusinessLogicEntity.init();
}

/****
 * 搜索数据补足
 */
function searchComplement(_e,_keyWord) {
    var /** 当前页还剩下多少条数据 **/
        pageSize = _e ? _e : 8;
    /***
     * 如果缓存搜索数据，调用搜索接口
     */
    $.ajax({
        url: "//s.hc360.com/cgi-bin/getmmtlast.cgi",
        method: 'get',
        data: {
            w: _keyWord,
            sys: 'mobile',
            bus: 'hcmpcg',
            ts: 1,
            e: pageSize  //显示多少条
        },
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        success: function (data) {
          var _tempHTMLArray = templateArr;
            var searchInfo=data.searchResultInfo,
                _html = _temp.render(_tempHTMLArray.join(''))({products: data.searchResultInfo});
            /***
             * 如果调用的数据小于5条，补充数据就追加到当前div里面
             */
            if (pageSize < 8) {
                $('.fb_cox ul').append(_html);
            } else {
                $('.fb_cox ul').html(_html);
            }
        },
        error:function () {
            window.maskOpen&& window.maskOpen('网络获取异常')
        }
    });
};
