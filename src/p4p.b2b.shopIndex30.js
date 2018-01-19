/**
 * Created by HC360 on 2017/6/7.
 */
/**
 * [p4pBusinessLogic ����P4P����ҵ���߼�����]
 * @type {Object}
 */
var p4pBusinessLogic = require('./p4p.base');

/**
 * [p4pBusinessLogicEntity ʵ����P4P����ҵ���߼�����ʵ�� ��Ʒ�Ƽ�]
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
    params_p4p:{ sys: 'detail',bus:'p4pForHomepage' },
    /**
     * [keyword �ؼ���]
     * @type {Object}
     */
    keyword: (window.searchVal || $('title:eq(0)').text() || ""),
    
    /**
     * [referrer ��Դ]
     * @type {Number}
     */
    referrer: 7,

    /**
     * [clickableElementSelector ����Ʒ�Ԫ��ѡ����]
     * @type {String}
     */
    clickableElementSelector: 'a',

    /**
     * [wrap ���λ����Ԫ��]
     * @type {Object}
     */
    wrap: $("#ypBanner"),

    /**
     * [template ��Ⱦģ��HTML��������Ϊ���ַ���ʱ�������Զ���Ⱦ���������ɺ�̨��Ⱦ��ҵ���߼�]
     * @type {String}
     */
    template: '',

    /**
     * [cache ���û������ݣ���ʼ�������Ժ󣬽����Զ�������CGI�ӿڻ�ȡ���ݣ��������ɺ�̨��ȡ���ݵ�ҵ���߼�]
     * @type {[type]}
     */
    cache: window.p4pbclist || {},

    /**
     * [getClickElementCacheIndexCallback ���ݱ����Ԫ�ػ�ȡ�����Ԫ�ض�Ӧ�����������ݻ����е�����ֵ]
     * @param  {Object} element [�����Ԫ��]
     * @return {Number}         [���ݻ����е�����ֵ]
     */
    getClickElementCacheIndexCallback: function (element) {
        return element.closest('li').data('index');
    }
});
/**
 * [�������ݾ����¼�]
 */
p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
    var _this = this,

        /**
         * [_data P4P���ݶ���]
         * @type {Object}
         */
        _data = data || {},

        /**
         * [_prolist P4P��Ʒ�����б�]
         * @type {Array}
         */
        _prolist = _data.searchResultInfo || [],

        /**
         * [_tempHTMLArray ��ʱHTML����]
         * @type {Array}
         */
        _tempHTMLArray = [];

    /* [�������̻�id���б��������Ա����ж�ָ���̻�id�Ƿ�����ڵ�ǰ�б���]
     */
    for (var i = 0; i < _prolist.length; i++) {
        _prolist['bcid_' + (_prolist[i].searchResultfoId || _prolist[i].searchResultfoID).toString()] = i;
    }

    /**
     * [���Ұ���Ԫ����P4P��ƷDOMԪ��,����Щ�����е���Ʒ���������ݼ���,��󶨵���¼������������]
     */
    _this.wrap.find(".proTopRecomCon ul li").each(function (index, element) {
        var _elementEntity = $(element),
            _bcid = parseInt(_elementEntity.attr('data-p4p-bcid')) || 0,
            _bcindex = _prolist['bcid_' + _bcid.toString()];

        /**
         * [����ǰ��Ʒ�����̻�id���Ҹ��̻�id������ȫ��P4P���ݼ��У����ڸ�Ԫ���ϱ����̻�id���̻�idλ��P4P���ݼ��е�����ֵ��������P4P�̻���ǡ�]
         */
        if (_bcid && _bcindex >= 0) {
            _elementEntity.data({
                id: _bcid,
                index: _bcindex
            }).attr('data-p4p-mark', '');
        }
    });

    /**
     * [target ��ʼ��P4P���λ����Ԫ�أ���ֻ�Ըð���Ԫ���µĿɵ���Ʒ�Ԫ�ؽ����¼���]
     * @type {Object}
     */
    _this.target = _this.wrap.find('[data-p4p-mark]');
});

/**
 * [������Ⱦ�����¼�]
 * @param  {Object} targetElement [���λԪ��]
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    var _this = this;

    /**
     * [�󶨼������¼�]
     */
    targetElement.on("click", '.recomImgBox a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_shopIndex30_img');
        } catch (ex) {
        }
    });
    targetElement.on("click", '.recomName a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_shopIndex30_title');
        } catch (ex) {
        }
    });
});

/**
 * ��ʼP4Pҵ������ʼ��
 */
p4pBusinessLogicEntity.init();

if ($("#homeRelatedMod").length > 0) {
    initRelated();
}

/**
 * [homeRelatedModDeferred ���� ���������� ģ�������ӳٶ���]
 */
window.homeRelatedModDataDeferred = $.Deferred();

//��ҳ����ϲ��ģ��
function initRelated() {

    /**
     * [btnChangeSp ��ȡ ��һ�� ��ťԪ��]
     * @type {Object}
     */
    var /**
         * ��һ����ť
         */
        btnChangeSp = $("#inBatch"),
        /**
         * ����ϲ������div
         */
        mod = $("#homeRelatedMod"),

        /**
         * ����ϲ����Ʒ�б���ʾ����
         */
        listnode = mod.find("ul"),
        /**
         * [countNum ��Ⱦ����ģ����ܵ���Ʒ����]
         * @type {Number}
         */
        countNum = 0,
        /**
         * [pageTotal ��ҳ��]
         * @type {Number}
         */
        pageTotal = 0,

        /**
         * [everyshowNum ÿҳ��ʾ����Ʒ������ͨ�� ��һ�� ��ť��ɷ�ҳ����]
         * @type {Number}
         */
        everyshowNum = 5,

        /**
         * [showIndex ��ǰ����ʾ���ڼ�����Ʒ�����ڼ�¼��ǰ�����ڼ�ҳ]
         * @type {Number}
         */
        showIndex = 5,

        /**
         * [param ��ȡ���������������]
         * @type {Object}
         */
        param = {
            listType: "homeRelatedList",
            username: window.userName,
            memTypeId: window.memTypeId,
            supCat: encodeURIComponent(window.searchVal),
            areaName: encodeURIComponent(window.areaName)
        },

        likeMod = "//detail.b2b.hc360.com/detail/turbine/action/ajax.SearchSupplyDetailAjaxAction/eventsubmit_doProdbysupply/doProdbysupply",
        /**
         * [userlogs ��������]
         * @type {String}
         */
        userlogs = "hcdetail_enterpriselog=detail_recommend_sp";

    /**
     * [��ȡ ���������� ģ������]
     */
    $.ajax({
        url: likeMod,
        data: param,
        timeout: 3000,
        scriptCharset: "utf-8",
        dataType: "jsonp",
        jsonp: "jsoncallback"
    }).done(function (dataArr) {

        /**
         * [δ�ɹ���ȡ ���������� ģ�����ݣ����ظ�ģ��]
         */
        if (!(dataArr && (parseInt(dataArr.success) === 1))) {
            mod.hide();
            return;
        }

        /**
         * ��� ���������� ģ�������ӳٶ��󣬽�P4P��Ʒ���ݴ��ݸ���Ҫ�����ݵ�ҵ���߼�
         */
        homeRelatedModDataDeferred.resolve(dataArr.jsonP4pList || {});

        /**
         * [�򷵻ص������У���ͨ����Ʒ���ݼ���Ҳ����P4P��Ʒ���ݣ����Խ�P4P��Ʒ���ݴ���ͨ����Ʒ���ݼ���ɾ����]
         */
        var p4pData = dataArr.jsonP4pList ? dataArr.jsonP4pList.searchResultInfo : [],
            list = dataArr.productList.slice(p4pData.length),

            /**
             * [html HTML�ַ���]
             * @type {String}
             */
            html = "";

        /**
         * [countNum ��Ⱦ����ģ����ܵ���Ʒ����]
         * @type {Number}
         */
        countNum = list.length + p4pData.length;

        /**
         * [_num ������ҳ��]
         * @type {[type]}
         */
        var _num = countNum % everyshowNum;
        //��ҳ��
        pageTotal = (_num === 0) ? (countNum / everyshowNum) : (countNum / everyshowNum) + 1;

        /**
         * [��ʼ��Ⱦ��ǰģ�����ͨ��Ʒ]
         */
        for (var i = 0; i < list.length; i++) {
            if (i < 15) {
                var obj = list[i],
                    title = decodeURIComponent(obj.title).replace(/\+/g, " "),
                    url = obj.url,
                    price = obj.price != "" ? ("&yen;" + obj.price) : "����",
                    imgsrc = obj.imgUrlBig,
                    file = ( p4pBusinessLogic.prototype.parseURL(obj.url) || {}).file,
                    ids = file ? file.substr(0, file.indexOf('.')) : "";
                html = html + '<li style="display:none">' + "<div class='picbox'>" + "<a href='" + url + "' data-exposurelog='" + userName + "," + ids + "' title='" + title + "'  target='_blank' onclick=\"return hcclick('?" + userlogs + "');\"><img onload='resizeImg(this,150,150);' onerror='imgonerror(this)' src='" + imgsrc + "'/></a>" + "</div>" + "<p class='pay'>" + price + "</p>" + "<p class='txtoverf'>" + "<a href='" + url + "' title='" + title + "' target='_blank' onclick=\"return hcclick('?" + userlogs + "');\">" + title + "</a>" + "</p>" + "</li>";
            }
        }

        /**
         * ����ͨ��Ʒ��Ⱦ��ģ��
         */
        $.trim(html).length && listnode.append(html);

        /**
         * [������ͨ��Ʒ���ݻ����P4P��Ʒ���ݣ�����ʾ��ģ�飬�������ظ�ģ��]
         */
        if (($.trim(html).length !== 0) || p4pData.length) {

            /**
             * ��ʾ��ģ��
             */
            mod.show();

            /**
             * ��ʾ��ģ���ǰ�����Ʒ
             */
            listnode.find("li").each(function (index) {
                index < everyshowNum && $(this).show();
            });

            /**
             * [����ģ�����Ʒ����С��һҳ������ ��һ�� ��ť]
             */
            if (listnode.find("li").length <= everyshowNum) {
                btnChangeSp.hide();
            }
        } else {
            mod.hide();
        }
        /**
         * [�� ��һ�� ��ť����¼�]
         */
        btnChangeSp.bind("click", function () {
            listnode.find('li').each(function (index) {
                var $this = $(this);
                (index < showIndex + everyshowNum && index >= showIndex) ? $this.show() : $this.hide();
            });
            showIndex += everyshowNum;
            showIndex = showIndex >= countNum ? 0 : showIndex;
        });
    }).fail(function () {
        mod.hide();
    });
}


/**
 * [���ӳٶ��󱻽������Ⱦ ���������� ģ��P4P����]
 */
$.when(homeRelatedModDataDeferred).done(function (data) {

    /**
     * [_tempHTMLArray ��ʱģ��HTML����]
     * @type {Array}
     */
    var _tempHTMLArray = [
        '{{each products as product i}}',
        '<li data-index="{{i}}" style="display:none">',
        '<div class="picbox">',
        '<a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_spsy_{{i+1}}_tupian&quot;)" onmousedown="HC.UBA.sendUserlogsElement(\'UserBehavior_supplyself_llb_2_{{i+1}}?detailbcid={{product.searchResultfoId}}\')" data-exposurelog="###gg_supplyself_llb_2_{{i+1}}?detailbcid={{product.searchResultfoId}}"  href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}" target="_blank">',
        '<img src="{{product.searchResultfoImageBig}}">',
        '</a>',
        '</div>',
        '<p class="pay">{{product.pretreatPrice}}</p>',
        '<p class="txtoverf">',
        '<a onclick="HC.UBA.sendUserlogsElement(&quot;UserBehavior_p4p_spsy_{{i+1}}_title&quot;)" href="{{product.searchResultfoUrl}}" title="{{product.searchResultfoTitle}}" target="_blank">{{product.searchResultfoTitle}}</a>',
        '</p>',
        '</li>',
        '{{/each}}'
    ];

    /**
     * [homeRelatedModP4PBusinessLogicEntity ʵ����P4P����ҵ���߼�����ʵ�� ����������]
     * @type {p4pBusinessLogic}
     */
    var homeRelatedModP4PBusinessLogicEntity = new p4pBusinessLogic({
        params_p4p:{ sys: 'detail',bus:'p4pForHomepage' },
        /**
         * [keyword �ؼ���]
         * @type {Object}
         */
        keyword: (window['areaName'] || ""),

        /**
         * [referrer ��Դ]
         * @type {Number}
         */
        referrer: 7,

        /**
         * [clickableElementSelector ����Ʒ�Ԫ��ѡ����]
         * @type {String}
         */
        clickableElementSelector: 'a,button',

        /**
         * [wrap ���λ����Ԫ��]
         * @type {Object}
         */
        wrap: $('#relatetlist > ul'),

        /**
         * [template ��Ⱦģ��HTML]
         * @type {String}
         */
        template: _tempHTMLArray.join(''),

        /**
         * [cache ���û������ݣ���ʼ�������Ժ󣬽����Զ�������CGI�ӿڻ�ȡ���ݣ��������ɺ�̨��ȡ���ݵ�ҵ���߼�]
         * @type {[type]}
         */
        cache: data || {},

        /**
         * [getClickElementCacheIndexCallback ���ݱ����Ԫ�ػ�ȡ�����Ԫ�ض�Ӧ�����������ݻ����е�����ֵ]
         * @param  {Object} element [�����Ԫ��]
         * @return {Number}         [���ݻ����е�����ֵ]
         */
        getClickElementCacheIndexCallback: function (element) {
            return element.closest('[data-index]').attr('data-index');
        }
    });

    /**
     * [������Ⱦ�����¼�]
     * @param  {Object} targetElement [���λԪ��]
     */
    homeRelatedModP4PBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
        var _this = this;

        /**
         * [ʹͼƬ�б��е�ͼƬ����Ӧ]
         */
        _this.resizeImage(targetElement.find('img'), function () {
            return $(this).closest('.picbox');
        });
    });

    /**
     * ��ʼP4Pҵ������ʼ��
     */
    homeRelatedModP4PBusinessLogicEntity.init();
});