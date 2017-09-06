/**
 * Created by HC360 on 2017/7/17.
 */
var p4pBusinessLogic = require('./p4p.base'),
    /****
     * ����ģ������
     */
    templateEngine = require('template'),
    /**
     * [showProductDetail  �����������ҳ�̻����������ʾ�̻������������Ϣ]
     * @param  {Object}   element  [�������Ԫ��]
     * @param  {Object}   data     [�������Ԫ�����ݶ���]
     * @param  {Function} callback [��Ⱦ�ص�����]
     */
    searchProDel = require('./p4p.search.showProductDetail'),
    /****
     * ��˳�ʼ����p4p���ݼ���
     * @type {{}}
     */
    p4pProduct = (window.p4pbclist || {});

/**
 * [ע��ȫ�ַ��������ڷ��� webtrends �û���Ϊ������־]
 */
window.hcclick = function (param) {
    if (document.images) {
        var rannumber = Math.round(Math.random() * 10000);
        (new Image()).src = "//log.info.hc360.com/click.htm" + param + "&rannumber=" + rannumber;
    }
    return true;
};


/****
 * ��ʼ����װ30���ȶ����а�P4P
 * @type {p4pBusinessLogic}
 */
var p4pBusinessLogicEntity = new p4pBusinessLogic({
    /****
     * ��Ҫ����Ʒѵ�Ԫ��
     */
    target: $('li[data-p4p="true"]'),
    /***
     * ������Ԫ��
     */
    wrap: $('body'),
    /**
     * [clickableElementSelector ����Ʒ�Ԫ��ѡ����]
     * @type {String}
     */
    clickableElementSelector: 'li[data-p4p="true"] a',
    /**
     * [cache ���ݻ���]
     * @type {Object}
     */
    cache: p4pProduct,
    /**
     * [referrer �ع⡢�����Դ����]
     * @type {Number}
     */
    referrer: 46,
    /**
     * [keyword �����ؼ���]
     * @type {String}
     */
    keyword: (window.p4pkeyword || ""),
    /**
     * [getClickElementCacheIndexCallback ���ݱ����Ԫ�ػ�ȡ�����Ԫ�ض�Ӧ�����������ݻ����е�����ֵ]
     * @param  {Object} elemnet [�����Ԫ��]
     * @return {Number}         [���ݻ�������ֵ]
     */
    getClickElementCacheIndexCallback: function (element) {
        var _index,
            _bcid = element.closest('li').attr('data-businid'),
            _proList = p4pProduct.searchResultInfo;
        if (_proList) {
            $.each(_proList, function (index, val) {
                if (val.searchResultfoId == _bcid) {
                    _index = index;
                    return false;
                }
            });
        }
        return _index;
    }
});

/**
 * [���������ع�����¼������ع�����ж�����������ֶ�]
 * @param  {Object} _paramsObject [��������]
 * @param  {Object} _data         [��Ʒ��������]
 */
p4pBusinessLogicEntity.addEventListener('onBuildExpoData', function (_paramsObject, _data) {
    var _this = this,

        /**
         * [_querystring �ɺ�̨�����Ĳ�ѯ��������]
         * @type {Object}
         */
        _querystring = window.requesParamsVo || {};

    /**
     * [_params �����ع�����]
     * @type {Array}
     */
    _paramsObject.params = [
        encodeURIComponent(_this.keyword),
        _data.searchResultfoId,
        (_data.searchResultfoPlanId || ''),
        (_data.searchResultfoUnitId || ''),
        _data.searchResultfoUserId,
        _data.searchResultfoProviderid,
        _this.referrer,
        _data.searchResultfoKypromote,
        ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)), //����PC�ˡ��ƶ��˻�ȡPAGEID
        encodeURIComponent(_querystring.kid) || '0',
        _querystring.match || '0',
        _querystring.confr || '0'
    ];
});

/**
 * [�����������������ʼ�¼�����������������������ֶ�]
 * @param  {Object} _params [��������]
 * @param  {Object} _data   [��Ʒ��������]
 */
p4pBusinessLogicEntity.addEventListener('onStartBuildClickParams', function (_params, _data) {
    /**
     * [_querystring �ɺ�̨�����Ĳ�ѯ��������]
     * @type {Object}
     */
    var _querystring = window.requesParamsVo || {};

    /**
     * [keywordextend ����Ϊ��ǰ��Ŀ�����չ����]
     */
    _params.keywordextend = encodeURIComponent(_querystring.kid) || '0';
    _params.match = _querystring.match || '0';
    _params.confr = _querystring.confr || '0';
});
/****
 * ������Ⱦdom�����¼�
 */
p4pBusinessLogicEntity.addEventListener('onEndRender', function (targetElement) {
    var _this = this;
    /****
     * ���ͼ���
     */
    targetElement.on('click', 'a', function () {
        try {
            HC.UBA.sendUserlogsElement('UserBehavior_p4p_juhe_page');
        } catch (e) {
            console.error(e);
        }
    });

    /**
     * [��Ԫ����������¼�����ʾ��Ʒ��ϸ��Ϣ]
     */
    $('.wrap-grid').on('mouseover', 'li[data-p4p=true] div[data-name="picArea"]', function (event) {
        var li_data = {},
            li = $(event.currentTarget).closest('li'),
            _bcid = li.attr('data-businid'),
            _proList = _this.cache.prolist;
        if (_proList) {
            $.each(_proList, function (index, val) {
                if (val.searchResultfoId == _bcid) {
                    li_data = val;
                    return false;
                }
            });
        }

        /****
         * ��ʾ���̱�ǩ������������Ϣ
         */
        $(this).parent('[data-name="proItem"]').addClass("hover2");
        $(this).children(".newImgAlert").show();

        /**
         * [��ʾ���������]
         */
        searchProDel.showProductDetail(li, li_data, function (templateHTML, templateDate) {
            /**
             * [_tempHTML ��ȡ��Ⱦ���HTML]
             * @type {String}
             */
            var _tempHTML = templateEngine.render(templateHTML)({
                product: templateDate
            });

            /**
             * [����Ⱦ���HTML��Ⱦ��ҳ��]
             * @type {String}
             */
            $(_tempHTML).appendTo(li.find('[data-name="proItem"]'));
        });
    });

});


/****
 * p4pbclist.searchResultInfo�ǵ�ǰҳ������p4p�ļ��ϣ���һ���Ƕ����ģ��������������Ƽ������������
 * �����˳�ʼ����p4p��ȡ����һ���󣬴��ڵ���1�����ʼ�������Ƽ���p4pʵ����
 */
if (p4pProduct.searchResultInfo.length >= 1) {
    p4pBusinessLogicEntity.init();
}

$(function () {
    /**
     * [���ض���������]
     */
    HC.HUB.addScript('//style.org.hc360.com/js/build/source/widgets/flowconfig/hc.flowconfig.min.js', function () {
        HC.W.load('topnav', function () {
            var topNavList = $('.webTopNav')[0];
            topnav.init(false);
            $('#wrapInner').append($('.webTopNav'));
            topNavList.style.top = '0';
            topNavList.style.position = 'static';
        });
    });

    /***
     * ��Ⱦ��ƷͼƬ���ҹ���
     */
    function prodocutMove(option) {
        var itemBox = option.container.find('ul'),
            itemCount = itemBox.find('li').length,
            containerWidth = option.container.width(),
            //һ���м�ҳ
            pageCount = Math.ceil(itemCount / option.limit) - 1,
            currentPage = 0;

        option.leftBtn.click(function () {
            if (currentPage == 0) {
                return
            }
            currentPage--;
            itemBox.animate({
                'margin-left': -currentPage * containerWidth
            }, 200)
        });

        option.rightBtn.click(function () {
            if (currentPage == pageCount) {
                return
            }
            currentPage++;
            itemBox.animate({
                'margin-left': -currentPage * containerWidth
            }, 200)
        });

        itemBox.find('li').mouseover(function () {
            var _src = $(this).find('img[large-src]').attr('large-src');
            $('[data-name="large-img"]').attr('src', _src);
        })

    }

    prodocutMove({
        imageElement: $('[data-name="large-img"]'),
        container: $('.tab-content-container'),
        leftBtn: $('.img-scroll-left'),
        limit: 3,
        rightBtn: $('.img-scroll-right')
    });

    /***
     * ���������Ʒ�����Ӻ�ɫ�߿�
     */
    $('[data-name="proItem"]').hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover hover2");
        $(this).find(".newImgAlert").hide();
    });


    /**
     * [��Ԫ����������¼�����ʾ��Ʒ��ϸ��Ϣ]
     */
    $('.wrap-grid').on('mouseover', 'li[data-p4p=false] div[data-name="picArea"]', function (event) {
        var str = '',
            li_data = {},
            li = $(event.currentTarget).closest('li'),
            index = li.index() - $('.wrap-grid').find('li[data-p4p=true]').length + 1, //��ǰ��p4p������ֵ
            _bcid = li.attr('data-businid'),
            _proList = (window.searchResultList || {}).searchResultInfo;

        if (_proList) {
            $.each(_proList, function (index, val) {
                if (val.searchResultfoId == _bcid) {
                    li_data = val;
                    return false;
                }
            });
        }
        /****
         * ��ʾ���̱�ǩ������������Ϣ
         */
        $(this).parent('[data-name="proItem"]').addClass("hover2");
        $(this).children(".newImgAlert").show();


        /***
         * ��Ӫ��Ʒ
         */
        if (li_data.searchResultfoZy) {
            str += li_data.searchResultfoZy + ":"
        }
        /***
         * ʮǿѫ��
         */
        if (li_data.searchResultfoTenMedal) {
            str += '1'
        } else {
            str += '0'
        }
        searchProDel.companyinfo($(this), li_data.searchResultfoUserName, index, 1, _bcid, str);
    });

    /***
     * ��ʼ������ϲ�����ҹ���
     */
    function slider(option) {
        var LEFT = -1,
            RIGHT = 1,
            itemBox = option.container.find('ul'),
            totalItemsCount = itemBox.find('li').length,
            item = itemBox.find('li:first');
        /****
         * С��һ�����������Ұ�ť
         */
        if (option.limit && totalItemsCount == option.limit) {
            option.leftBtn.hide();
            option.rightBtn.hide();
        }
        var containerWidth = option.container.width(),//���div�ܿ��
            itemWidth = item.width() + parseInt(item.css('margin-left'), 10) + parseInt(item.css('margin-right'), 10), //ÿ��li�Ŀ��
            perPageCount = Math.floor(containerWidth / itemWidth), //���div���ԷŶ��ٸ�li
            totalPageCount = Math.ceil((totalItemsCount / perPageCount) - 1), //�ܹ����Թ�������
            currentPageIndex = 0;  //��ǰ�ڵڼ���Ļ

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
    };
    slider({
        container: $('.picBoxBot'),
        leftBtn: $('.left-i'),
        rightBtn: $('.right-i')
    });
});