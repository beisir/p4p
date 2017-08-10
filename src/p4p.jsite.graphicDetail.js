/**
 * Created by HC360 on 2017/7/7.
 */
/**
 * Created by HC360 on 2017/7/6.
 * JSվ��Ʒͼ������ҳ
 */

/**
 * [p4pBusinessLogic ����P4P����ҵ���߼�����]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');
/**
 * [p4pBusinessLogicEntity ʵ����P4P����ҵ���߼�����ʵ��]
 * @type {p4pBusinessLogic}
 */
$(function () {
    var p4pBusinessLogicEntity = new p4pBusinessLogic({

        /**
         * [keyword �ؼ���]
         * @type {Object}
         */
        keyword: $("#p4pkeyword").val() || '',

        /**
         * [referrer ��Դ]
         * @type {Number}
         */
        referrer: 44,

        /**
         * [clickableElementSelector ����Ʒ�Ԫ��ѡ����]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap ���λ����Ԫ��]
         * @type {Object}
         */
        wrap: $('#p4p_wrap ul'),

        /**
         * [getClickElementCacheIndexCallback ���ݱ����Ԫ�ػ�ȡ�����Ԫ�ض�Ӧ�����������ݻ����е�����ֵ]
         * @param  {Object} element [�����Ԫ��]
         * @return {Number}         [���ݻ����е�����ֵ]
         */
        getClickElementCacheIndexCallback: function(element) {
            return element.closest('li').attr('data-index');
        },

        /**
         * [targetRenderCallback ���λԪ����Ⱦ��ҳ��Ļص�����]
         * @param  {Object} targetHTML [���λԪ��]
         */
        targetRenderCallback: function(targetHTML) {
            var _this = this;
            _this.wrap.empty();
            return $(targetHTML).appendTo(_this.wrap);
        },

        /**
         * [preventDefaultLinkRedirect ��ֹ����Ʒ�Ԫ��Ĭ����Ϊ��������δ��ɼƷ�ǰҳ����ת���¼Ʒ�ʧ��]
         * @type {Boolean}
         */
        preventDefaultLinkRedirect: true,

        /**
         * [preventDefaultLinkRedirectCallBack ȡ����������ӵ�Ĭ����Ϊ�������ת�Ļص��������� preventDefaultLinkRedirect Ϊ true ��ʱ��������]
         * @param  {Object} element [�����Ԫ��]
         */
        preventDefaultLinkRedirectCallback: function(element) {
            var href = element.attr('href');
            if ($.trim(href).length !== 0) {
                window.location.href = href;
            }
        }
    });

    /**
     * [�������ݾ����¼�]
     */
    p4pBusinessLogicEntity.addEventListener('onDataReady', function(data) {
        var _this = this,

            /**
             * [_data P4P���ݶ���]
             * @type {Object}
             */
            _data = (data || {}).searchResultInfo || [],

            /**
             * [_tempHTMLArray ��ʱHTML����]
             * @type {Array}
             */
            _tempHTMLArray = [
                '{{each products as product i}}',
                '<li data-index={{i}}>',
                '<div class="img-box"><a href="http://js.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><img src="{{product.searchResultfoImageSmall}}" alt="{{product.searchResultfoTitle}}"></a></div>',
                '<p class="pro-name"><a href="http://js.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}">{{product.searchResultfoTitle}}</a></p>',
                '<p>{{#product.pretreatPrice}}</p>',
                '</li>',
                '{{/each}}'
            ],

            /**
             * [_limit P4P���λ��������]
             * @type {Number}
             */
            _limit = 4;

        /***
         * ����������Ʒ
         */
        var _prolist=$.map(_data,function (product) {
            if(Number(product.searchResultfoIsRecomHQ) === 1){
                return product
            }
        });

        /**
         * [����P4P���λ�������޽�ȡP4P����]
         */
        _prolist.splice(_limit, _prolist.length);


        /***
         * map�����µ����飬���µ�data��������
         */
        (data || {}).searchResultInfo=_prolist;

        /**
         * [P4P���λ������������չʾ�����ߣ�����ȾP4P�������̻��Ƽ�]
         */
        if (_prolist.length < _limit) {
            (data || {}).searchResultInfo=[];
            $("#p4p_wrap").hide();
            return;
        }

        /**
         * [template ����ģ��HTML]
         * @type {String}
         */
        _this.template = _tempHTMLArray.join('');
    });

    /**
     * [������ʼ��Ⱦ�¼�]
     */
    p4pBusinessLogicEntity.addEventListener('onStartRender', function(template, template_params) {
        var _this = this,
            _prolist = template_params.products;

        /**
         * [�޸ļ۸��ʽ]
         */
        $.each(_prolist, function(index, product) {
            product.pretreatPrice = (parseFloat(product.searchResultfoUnitPrice) === 0) ? '����' :'<span>&yen;<b>'+product.searchResultfoUnitPrice+'</b><em>/'+ product.searchResultfoMeasureUnit +'</em></span>';
        });
    });


    /**
     * [������Ⱦ�����¼�]
     * @param  {Object} targetElement [���λԪ��]
     */
    p4pBusinessLogicEntity.addEventListener('onEndRender', function(targetElement) {
        var _this = this;

        /**
         * [�󶨼������¼�]
         */
        targetElement.on("click", '[data-sentLog="p4pDaTu"]', function() {
            try {
                sendUserlogsElement&&sendUserlogsElement('UserBehavior_p4p_js_pic_detail');
            } catch (ex) {}
        });
    });

    /**
     * ��ʼP4Pҵ������ʼ��
     */
    p4pBusinessLogicEntity.init();
});
