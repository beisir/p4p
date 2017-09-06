/**
 * Created by HC360 on 2017/7/21.
 */

$(function () {
    /**
     * [p4pBusinessLogic 导入P4P基础业务逻辑对象]
     * @type {Object}
     */
    var p4pBusinessLogic = require('./p4p.base'),
        p4pshow = parseInt($('#p4pshow').val()) || 0,
        keyWord = $("#p4pkeyword").val(),
        p4pWrap=$('[node-name="p4pWrap"]'),
        _template = [
            '{{ each products as product i }} ',
            '<li>',
            '<div class="listImg">',
            '<a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html"><img src="{{product.searchResultfoImageBig}}" alt="{{product.searchResultfoTitle}}"></a>',
            '</div>',
            '<dl>',
            '<dt><a href="//m.hc360.com/supplyself/{{product.searchResultfoId}}.html" title="{{product.searchResultfoTitle}}"><span>{{product.searchResultfoTitle}}</span></a></dt>',
            '<dd>',
            '<span>{{#product.pretreatPrice}}</span>',
            '</dd>',
            '</dl>',
            '</li>',
            '{{/each}}'
        ];

    /**
     * [p4pshow 不显示P4P广告]
     * @type {Number}
     */
    if (!p4pshow) {
        return;
    }

    var p4pBusinessLogicEntity = new p4pBusinessLogic({
        /**
         * [keyword 关键字]
         * @type {Object}
         */
        keyword: keyWord || '',

        /**
         * [referrer 来源]
         * @type {Number}
         */
        referrer: 48,

        /**
         * [clickableElementSelector 点击计费元素选择器]
         * @type {String}
         */
        clickableElementSelector: 'a',

        /**
         * [wrap 广告位包裹元素]
         * @type {Object}
         */
        wrap: p4pWrap.find('ul'),

        /**
         * [template 渲染模板HTML]
         * @type {String}
         */
        template: _template.join(""),

        /**
         * [preventDefaultLinkRedirect 阻止点击计费元素默认行为，以免在未完成计费前页面跳转导致计费失败]
         * @type {Boolean}
         */
        preventDefaultLinkRedirect: true,

        /**
         * [preventDefaultLinkRedirectCallBack 取消被点击链接的默认行为后，如果跳转的回调函数，在 preventDefaultLinkRedirect 为 true 的时候起作用]
         * @param  {Object} element [被点击元素]
         */
        preventDefaultLinkRedirectCallback: function (element) {
            var href = element.attr('href');
            if ($.trim(href).length !== 0) {
                window.location.href = href;
            }
        }
    });

    /****
     * 监听数据加载完毕事件
     */
    p4pBusinessLogicEntity.addEventListener('onDataReady', function (data) {
        var product = data.searchResultInfo,
            limit=6;

        /****
         * 截取上限
         */
        product.splice(limit,product.length);

        /***
         * 如果小于最少展示上限，隐藏整个P4P模块
         */
        if (product.length < 6) {
            /***
             * 清空P4P数据
             */
            product.splice(0, product.length);
        }

    });

    /***
     * 监听渲染结束
     */
    p4pBusinessLogicEntity.addEventListener('onEndRender',function (targetElement) {
        /**
         * [绑定监测点点击事件]
         */
        targetElement.on("click", 'a', function () {
            try {
                window.sendUserlogsElement && sendUserlogsElement('UserBehavior_p4p_m_pic_tupian');
            } catch (ex) {
            }
        });

        /***
         * 显示P4P模块
         */
        p4pWrap.show();
    });

    /***
     * 初始化p4p业务对象
     */
    p4pBusinessLogicEntity.init();


});
