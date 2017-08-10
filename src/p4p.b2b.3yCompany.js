/**
 * Created by HC360 on 2017/6/7.
 */
var p4pBusinessLogic = require('./p4p.base');


var templateEntity = [
        '<ul>',
        '{{each products as product i}}',
        '<li>',
        '<a href="http://b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" target="_blank">',
        '<img src="{{product.searchResultfoImageBig}}" height="200" width="200" alt="{{product.searchResultfoTitle}}">',
        '</a>',
        '<div class="A-title"><a href="http://b2b.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}" target="_blank">{{product.searchResultfoTitle}} </a></div>',
        '<div class="price red">{{product.pretreatPrice}}</div>',
        '</li>',
        '{{/each}}',
        '</ul>'
    ];

var  P4PBusinessLogincEntity = new p4pBusinessLogic({
        /**
         * [keyword �ؼ���]
         * @type {Object}
         */
        keyword: (window.HC && window.HC.getCookie && window.HC.getCookie("hclastsearchkeyword")) || window.titleKey,

        /**
         * [referrer ��Դ]
         * @type {Number}
         */
        referrer: 40,

        /**
         * [clickableElementSelector ����Ʒ�Ԫ��ѡ����]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap ���λ����Ԫ��]
         * @type {Object}
         */
        wrap: $(".p4pListBox .goods"),

        /**
         * [template ��Ⱦģ��HTML]
         * @type {String}
         */
        template: templateEntity.join('')

    });
/****
 * ������ȡ���ݽ����¼�
 */
P4PBusinessLogincEntity.addEventListener('onDataReady', function (data) {
    var  /**
         * [_data P4P���ݶ���]
         * @type {Object}
         */
        _data = data || {},

        /**
         * [_prolist P4P��Ʒ�����б�]
         * @type {Array}
         */
        _prolist = _data.searchResultInfo || [];

    /**
     * [���˳����ʵ�P4P��Ʒ]
     */
    _prolist = $.map(_prolist, function (product) {
        if (Number(product.searchResultfoIsRecomHQ) === 1) {
            return product;
        }
    });

    /**
     * [searchResultInfo ��Ϊ $.map �������µ����飬���Դ˴��ٽ����˺�����ݸ��µ�ԭʼ���ݼ���]
     * ���չʾ8�����ݣ�����4����չʾ
     */
    _prolist=_prolist.slice(0,8);
    if(_prolist.length<4){
        _data.searchResultInfo=[];
        this.wrap.hide();
    }else {
        _data.searchResultInfo = _prolist;
    }

});
/****
 * ������Ⱦdom�����¼�
 */
P4PBusinessLogincEntity.addEventListener('onEndRender', function (targetElement) {
    /****
     * ���ͼ���
     */
    targetElement.on('click', 'a', function () {
        try {
            HC&&HC.UBA&&HC.UBA.sendUserlogsElement('UserBehavior_p4p_sy_freedetail_callus');
        } catch (e) {
            console.error(e);
        }
    });

});
/****
 * ��ʼ��p4p
 */
P4PBusinessLogincEntity.init();