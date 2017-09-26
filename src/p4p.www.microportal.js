/**
 * Created by 姜艳云 on 2017/4/11.
 */

var p4pBusinessLogic=require('./p4p.base');

var p4pMicroportal=new p4pBusinessLogic({
    params_p4p:{ sys: 'miniportal',bus:'p4p' },
    /**
     * [wrap 广告位包裹元素]
     * @type {Object}
     */
    wrap: $('#pro_p4p_wrap'),

    /**
     * [clickableElementSelector 点击计费元素选择器]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [referrer 曝光、点击来源参数]
     * @type {Number}
     */
    referrer: 28,
    /**
     * [getClickElementCacheIndexCallback 根据被点击元素获取被点击元素对应的数据在数据缓存中的索引值]
     * @param  {Object} elemnet [被点击元素]
     * @return {Number}         [数据缓存索引值]
     */
    getClickElementCacheIndexCallback: function(element) {
        return element.closest('#pro_p4p_wrap').find('li').index(element.closest('li'))-1;
    },

    /**
     * [keyword 搜索关键词]
     * @type {String}
     */
    keyword: (HC.getCookie && HC.getCookie("hclastsearchkeyword") ||""),
})
/****
 * 监听获取数据完成事件
 */
p4pMicroportal.addEventListener('onDataReady',function (data) {
     var _this=this,
         /***
          * 最少展示p4p数量上限
          */
         minLimit=4,
         /**
          * [_limit P4P广告位数量上限]
          * @type {Number}
          */
         _limit=9,
         /**
          * [_prolist P4P商品数据列表]
          * @type {Array}
          */
         _prolist = (data || {}).searchResultInfo || [],

         /***
          * p4p数据条数
          * @type {Number}
          */
         len=_prolist.length,

         /***
          * li 模板数组
          * @type {[*]}
          * @private
          */
         _li=[
             '<li data-index="{{i}}">',
             '<div class="picmid">',
             '<a href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" target="_blank">',
             '<img alt="{{product.searchResultfoTitle}}" src="{{product.searchResultfoImageBig}}" class="lazy" /></a>',
             '</div>',
             '<p><a title="{{product.searchResultfoTitle}}" href="//b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">{{product.searchResultfoTitle}}</a></p>',
             '</li>',
         ],
         /***
          * 广告模板
          * @type {[*]}
          * @private
          */
         _firstLi=[
             '<li class="frist">',
                 '<p class="p4pimg"><a href="//b2b.hc360.com/p4p/index.html" target="_blank"><img src="//style.org.hc360.com/images/detail/miniportal/portal3/p4pImg.png" /></a></p>',
                 '<p class="p1"><a href="//b2b.hc360.com/p4p/index.html" target="_blank">抢占流量，时不我待！</a></p>',
                 '<p class="p2"><a href="//b2b.hc360.com/p4p/index.html" target="_blank">慧聪网首次开放搜索竞价服务<br />让您推广所花的每一分钱都有价值</a></p>',
             '</li>'
         ]

         /****
          * 临时的html数组
          * @type {[*]}
          * @private
          */
         _tempHTMLArray=[
             '<ul class="pro_list_1" >',
             _firstLi.join(''),
             '{{ each products.slice(0,4) as product i }}',
               _li.join(''),
              '{{ /each }}',
             '</ul>',
             '{{ if products.length>4 }}',
                 '<ul class="pro_list_2" >',
                     '{{ each products.slice(4) as product i }}',
                     _li.join(''),
                     '{{ /each }}',
                 '</ul>',
             '{{ /if }}'
         ];
    /**
     * [根据P4P广告位数量上限截取P4P数据]
     */
    _prolist.splice(_limit, len);

    /**
     * [P4P广告位数量不够显示一行时]
     */
    if (len<minLimit) {
        _this.template = '';
        return false;
    }else if(len>minLimit&&len< _limit){
        /** 够显示一行，不够两行时只显示一行  **/
        _prolist.splice(minLimit, len);
    }

    _this.template = _tempHTMLArray.join('');
    
})
/****
 * 监听渲染dom结束事件
 */
p4pMicroportal.addEventListener('onEndRender',function (targetElement) {
    if(this.template ==''){
        return;
    }
    /***
     * 显示p4p外层div
     */
    $('#pro_p4p_wrap').closest('.wrap').show();
    /***
     * 给第一li增加样式
     */
    $('#pro_p4p_wrap').find('ul.pro_list_2 li:first').addClass('frist');

    /****
     * 发送监测点
     */
    targetElement.on('click','a',function () {
        try{
          HC.UBA.sendUserlogsElement('UserBehavior_p4p_cp_bottom');
        }catch (e){
           console.error(e);
        }
    })
    
});

/****
 * 初始化p4p业务逻辑
 */
p4pMicroportal.init();