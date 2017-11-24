/**
 * Created by HC360 on 2017/11/21.
 */

var p4pBusinessLogic = require('./p4p.base'),
    _temp = require('template');
//parameters("params").split("@")[1]
//parameters("params").split("@")[2].split("$")[0]
//调钱文可接口，返回搜索词
var paramword = "";
if(parameters("params").indexOf("bcid")>=0){
    paramword = '{"bcid":'+parameters("params").split("@")[2].split("$")[0]+'}';
    
}else if(parameters("params").indexOf("infoId")>=0){
    paramword = '{"infoId":' + parameters("params").split("@")[1]+'}';
}
console.log(paramword)
$.ajax({
    url:"http://madata.hc360.com/wxservice/purchase/getPurchaseDetail",
    type:'get',
    dataType:'jsonp',
    jsonp: "callback",
    data:JSON.parse(paramword),
    success:function(date){
        var date_ = date.msgBody,
            numbtype = ["","简版询价单","查看联系方式","发采购信息","公司留言","m站 发布询价","m站发布采购单","简版询价单-3y","查看联系方式-3y","快速发采购信息","快速发采购信息-3y","公司留言-3y","发发离线留言","收藏信息","采购单信息","发送短信采集"]
        var dateday = date_.createtime.substring(0,11);
        $(".cont1").html(dateday);
        $(".cont2").html(date_.mobilephone);
        $(".cont3").html(numbtype[date_.purchasetype]);
        $(".cont4").html(date_.purchaseproduct);
        $(".cont5").html(date_.companyname);
        
        $("#onlineCommunicate").attr("href","./onlineLeaveMess.html?params=sellerId%2540"+date_.sellname+"%2524msgID%2540"+date_.infoid+"%2524buyerName%2540"+date_.buyname+"%2524messtype%2540company");
        $("#sellerCardBtn").attr("href","./companyCardDetail.html?params=purchaseId@"+date_.id+"");
        $(".moreInfo a").attr("href","https://m.hc360.com/search/nothot?keyword="+encodeURI(encodeURI(date_.p4pcoreKeyword)));
        var p4pBusinessLogicEntity = new p4pBusinessLogic({

            /**
             * [keyword 关键字]
             * @type {Object}
             */
            keyword: date_.p4pcoreKeyword,

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
            wrap: $('.cgProBox ul'),

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
            
            /**
             * [_tempHTMLArray 临时HTML数组]
             * @type {Array}
             */
            _tempHTMLArray = [
                '{{each products as product i}}',
                '<li>',
                '<div class="ImgBox">',
                '<a href="https://m.hc360.com/supplyself/{{ product.searchResultfoId }}.html" title=""><img src="{{ product.searchResultfoImageBig }}" alt="{{ product.searchResultfoTitle }}"></a>',
                '</div>',
                '<p class="price">&yen;{{ product.searchResultfoUnitPrice }}/双</p>',
                '<p class="til"><a href="https://m.hc360.com/supplyself/{{ product.searchResultfoId }}.html" target="_blank"><span><em>{{ product.searchResultfoTp }}</em>{{ product.searchResultfoTitle }}</span></a></p>',
                '<div class="comp">',
                '<dl>',
                '<dt><a href="https://{{ product.searchResultfoId }}.b2b.hc360.com" title="{{ product.searchResultfoCompany }}">{{ product.searchResultfoCompany }}</a></dt>',
                '<dd>',
                '{{if (product.searchResultfoIsRecomHQ==1) }}',
                '<span class="htbIcon" title="优质卖家"></span>',
                '{{/if}}',
                '<span class="mmtIcon" title="MMT"></span>',
                '</dd>',
                '</dl>',
                '</div>',
                '</li>',
                '{{/each}}'
            ],
            
           /**
             * [_limit P4P广告位数量上限]
             * @type {Number}
             */
            _limit = 8;

            /**
             * [根据P4P广告位数量上限截取P4P数据]
             */
            _prolist.splice(_limit,_prolist.length);
            console.info(_prolist.length);
            

            _data.searchResultInfo = _prolist;
            /**
             * [template 设置模板HTML]
             * @type {String}
             */
            _this.template = _tempHTMLArray.join('');

            /***
             * 如果当前数据小于8条则用搜索补足
             */
            if (data.searchResultInfo.length < _limit) {
                searchComplement(_limit-data.searchResultInfo.length);
            }

           
            
            /****
         * 搜索数据补足
         */
        function searchComplement(_e) {
           
            $.ajax({
                url: "//s.hc360.com/cgi-bin/getmmtlast.cgi",
                method: 'get',
                data: {
                    w: date_.p4pcoreKeyword,
                    e: _e  //显示多少条
                },
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                success: function (data) {
                    var searchInfo=data.searchResultInfo,
                        _html = _temp.render(_tempHTMLArray.join(''))({products: data.searchResultInfo});
                   
                    /***
                     * 如果调用的数据小于5条，补充数据就追加到当前ul里面
                     */
                    if (_e < 8) {
                        $('.cgProBox ul').append(_html);
                    } else {
                        $('.cgProBox ul').html(_html);
                    }
                },
                error:function () {
                    window.maskOpen&& window.maskOpen('网络获取异常')
                }
            });

        }
        });

        p4pBusinessLogicEntity.init();
            
        


    }
})


function parameters(key){
	var param = {};
	var params = window.location.search.substr(1).split("&");
	for(var i=0; i<params.length; i++){
		param[params[i].split("=")[0]] = params[i].split("=")[1];
	}
	
	if(key){
		return decodeURIComponent(param[key]);
	}else{
		return param;
	}
}


















































