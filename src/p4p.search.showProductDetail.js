/**
 * Created by dell on 2017/4/18.
 */
/**
 * [showProductDetail 搜索结果页P4P商机鼠标悬浮显示商机鼠标悬浮框信息]
 * @param  {Object}   element  [鼠标悬浮元素]
 * @param  {Object}   data     [鼠标悬浮元素数据对象]
 * @param  {Function} callback [渲染回调函数]
 */
 function showProductDetail(element, data, callback) {

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
            '    <dl>',
            '        {{if product.searchResultfotransLevelShow}}',
            '        <dt>交易等级：</dt>',
            '        <dd>',
            '            <a href="//b2b.hc360.com/bussGrade/buss_grade.html" target="_blank">',
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
            '        <dd><a target="_blank" href="//{{product.searchResultfoUserName}}.b2b.hc360.com/shop/businwindow.html" p4pclickable data-sentLog="daSou">{{product.searchResultfoproductNum}}条</a></dd>',
            '        {{/if}}',
            '        {{if product.searchResultfoBm}}',
            '        <dt>经营模式：</dt>',
            '        <dd><a target="_blank" href="{{product.pretreatShopUrl}}/shop/show.html" p4pclickable data-sentLog="daSou"><span>{{product.searchResultfoBm}}</span></a></dd>',
            '        {{/if}}',
            '        {{if product.searchResultfoCapital}}',
            '        <dt>注册资金：</dt>',
            '        <dd><a target="_blank" href="{{product.pretreatShopUrl}}/shop/show.html" p4pclickable data-sentLog="daSou">人民币{{product.searchResultfoCapital}}{{product.searchResultfoCapitalUnit}}</a></dd>',
            '        {{/if}}',
            '    </dl>',
            '    <div class="honor">',
            '        <dl>',
            '            <dt>商家荣誉：</dt>',
            '            <dd>',
            '                <a href="//b2b.hc360.com/p4p/index.html" title="优质卖家" target="_blank" class="p4pIco2">&nbsp;</a>',
            '                {{if product.searchResultfobw==1}}<a target="_blank" href="//info.hc360.com/list/mvb.shtml" title="慧聪标王" class="newIco7">标王</a>{{/if}}',
            '            </dd>',
            '        </dl>',
            '    </div>',
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
    if (li.data('loaded')) {
        return;
    }

    /**
     * 设置悬浮框正在加载
     */
    li.data('loaded', true);

    /**
     * [获取数据并渲染悬浮框]
     */
    $.ajax({
        url: '//s.hc360.com/cgi-bin/getmmtlast.cgi',
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        data: {
            w: 'site:' + (li_data.searchResultfoUserName || ''),
            c: '企业库',
            sys: 'search',
            bus: 'web',
            infotype: '1'
        }
    })
        .done(function(json) {

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
             * [productExtendDetail 获取商品扩展信息数据]
             * @type {Object}
             */
            var productExtendDetail = $.extend(true, {}, li_data, ((json.searchResultInfo || [])[0] || {}));

            /**
             * [_grade_class 交易等级区间样式配置]
             * @type {Array}
             */
            var gradeClassConfig = [{
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
            }];

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
            productExtendDetail.searchResultfotransLevelClass = $.map(gradeClassConfig, function(entry, index) {
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
            productExtendDetail.pretreatArea = productExtendDetail.pretreatArea && productExtendDetail.pretreatArea.replace(/[\s\uFEFF\xA0]/g, '');

            /**
             * 执行渲染回调函数
             */
            callback && callback(templateHTML, productExtendDetail);
        })
        .fail(function() {
            // console.log("error");
        })
        .always(function() {
            // console.log("complete");
        });
};

/***
 *  [showProductDetail 搜索结果页非P4P商机自然搜索商机鼠标悬浮显示商机鼠标悬浮框信息]
 * @param tag
 * @param company_id_temp  searchResultfoUserName
 * @param company_num_temp  第几个
 * @param page_temp  当前第几页
 * @param bc_id_temp  searchResultfoId
 * @param obj  searchResultfoId
 */
function companyinfo(tag, company_id_temp, company_num_temp, page_temp, bc_id_temp,obj) {
      var tipParams = [];
    var tagEntity = $(tag);
    var type_montior = tagEntity.closest('li').attr('type_montior') || '';
    var $newShowBox=tagEntity.parent('div[data-name="proItem"]').find('.newShowBox');
    if($newShowBox.length>0){
        $newShowBox.show();
        return;
    }
    if (obj != "") {
        tipParams = obj.split(":");
    }
    if (tagEntity.data('loaded')) {
        return;
    }
    tagEntity.data('loaded', true);

    var div = document.createElement("div");
    div.className = "newShowBox";
    $.ajax({
        url: '//s.hc360.com/cgi-bin/getmmtlast.cgi',
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        data: {
            w: 'site:' + company_id_temp,
            c: '企业库',
            sys: 'search',
            bus: 'web',
            infotype: '1'
        }
    })
        .done(function(stxt) {
            var mmt_grade;
            var mmt_count;
            var mmt_procount;
            var auth_info;
            var man_model;
            var reg_capital;
            var reg_unit;
            var main_pro;
            var top_bw;
            var ten_Medal;
            if (Number(stxt.searchResultfoAllNum) && Number(stxt.searchResultfoAllNum) > 0) {
                mmt_grade = Number(stxt.searchResultInfo[0].searchResultfotransLevel) || 0;
                mmt_count = Number(stxt.searchResultInfo[0].searchResultfotransCount) || 0;
                mmt_procount = Number(stxt.searchResultInfo[0].searchResultfoproductNum) || 0;
                auth_info = Number(stxt.searchResultInfo[0].searchResultfoauthInfo) || 0;
                man_model = stxt.searchResultInfo[0].searchResultfoBm;
                reg_capital = Number(stxt.searchResultInfo[0].searchResultfoCapital) || 0;
                reg_unit = stxt.searchResultInfo[0].searchResultfoCapitalUnit;
                top_bw = stxt.searchResultInfo[0].searchResultfobw;
            }
            if (tipParams.length >= 2) {
                main_pro = tipParams[0];
                ten_Medal = tipParams[1];
            }
            /**
             * [innertxt 拼接字符串]
             * @type {String}
             */
            var innertxt = "<dl>";
            /**
             * [companyUrl 链接地址]
             * @type {String}
             */
            var companyUrl = '//' + company_id_temp + '.b2b.hc360.com/shop/show.html';
            /**
             * [交易等级]
             */
            if (mmt_grade) {
                var mmt_grade_length;
                /**
                 * [_grade_class 交易等级区间样式配置]
                 * @type {Array}
                 */
                var gradeClassConfig = [{
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
                }];
                /**
                 * [获取交易等级样式类名]
                 */
                var gradeClass = $.map(gradeClassConfig, function(entry, index) {
                    if ((mmt_grade >= entry.minValue) && (mmt_grade <= entry.maxValue)) {
                        mmt_grade_length = mmt_grade - Math.floor(mmt_grade / 10) * 10;
                        return entry.className;
                    }
                }).join('');
                /**
                 * [交易等级标识数量超过0才显示]
                 */
                if (mmt_grade_length > 0) {
                    /**
                     * 拼接交易等级字符串
                     */
                    innertxt += '<dt>交易等级：</dt>';
                    innertxt += '<dd><a href="//b2b.hc360.com/bussGrade/buss_grade.html" target="_blank"><div class="starBox" onclick="search_log_new(\'supply_tradelevel_\', \'' + company_num_temp + '\',\'' + page_temp + '\', \'' + company_id_temp + '\',\'' + bc_id_temp + '\')">';
                    for (i = 0; i < mmt_grade_length; i++) {
                        innertxt += '<em' + (gradeClass ? ' class=' + gradeClass : '') + '></em>';
                    }
                    innertxt += '</div></a></dd>';
                }
            }
            /**
             * [成交笔数]
             */
            if (mmt_count) {
                innertxt += '<dt>成交笔数：</dt>';
                company_num_temp, page_temp, bc_id_temp
                innertxt += '<dd><a target="_blank" href="' + companyUrl + '" onclick="search_log_new(\'supply_vol_\', \'' + company_num_temp + '\',\'' + page_temp + '\', \'' + company_id_temp + '\',\'' + bc_id_temp + '\')">' + mmt_count + '笔</a></dd>';
            }
            /**
             * [主营产品]
             */
            if (main_pro) {
                var tmp = main_pro.split(",");
                innertxt += '<dt>主营产品：</dt>';
                innertxt += '<dd class="main_pro"><a target="_blank" title="' + main_pro + '" href="' + companyUrl + '" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_searchsupply_mainpro\')">';
                var tmpStr = "";
                for (i = 0; i < tmp.length; i++) {
                    if (checkByteLength($('<span>' + tmpStr + tmp[i] + '</span>').text(), 0, 40)) {
                        if (checkByteLength($('<span>' + tmpStr + tmp[i] + '&nbsp;</span>').text(), 0, 40)) {
                            tmpStr += tmp[i] + '&nbsp;';
                        } else {
                            tmpStr += tmp[i];
                        }
                    }
                }
                innertxt += tmpStr + '</a></dd>';
            }
            /**
             * [供应产品]
             */
            var supplyProductUBAConfig = {
                pb: 'UserBehavior_searchsupply_supplyself_pb_#position#_#page#_#keyword#?detailuserid=#companyid#&detailbcid=#bcid#',
                gp: 'UserBehavior_searchsupply_supplyself_gp_#position#_#page#_#keyword#?detailuserid=#companyid#&detailbcid=#bcid#',
                other: 'UserBehavior_searchsupply_supplyself_#position#_#page#_#keyword#?detailuserid=#companyid#&detailbcid=#bcid#'
            };
            var supplyProductUBAKeyword = (supplyProductUBAConfig[type_montior] || supplyProductUBAConfig['other'])
                .replace(/#position#/g, company_num_temp)
                .replace(/#page#/g, page_temp)
                .replace(/#keyword#/g, window['hc_keyword'] || '')
                .replace(/#companyid#/g, company_id_temp)
                .replace(/#bcid#/g, bc_id_temp);
            if (mmt_procount) {
                innertxt += '<dt>供应产品：</dt>';
                innertxt += '<dd><a target="_blank" href="//' + company_id_temp + '.b2b.hc360.com/shop/businwindow.html" onclick="HC.UBA.sendUserlogsElement(\'' + supplyProductUBAKeyword + '\')">' + mmt_procount + '条</a></dd>';
            }
            /**
             * [经营模式、认证信息]
             */
            if (man_model) {
                man_model = man_model.replace(/[\[\]]/g, '');
                innertxt += '<dt>经营模式：</dt>';
                innertxt += '<dd>';
                innertxt += '<a target="_blank" href="' + companyUrl + '" onclick="HC.UBA.sendUserlogsElement(\'UserBehavior_searchsupply_jymodle_res\')"><span>' + man_model + '</span></a>';
                var tmp = "";
                innertxt += '</dd>';
            }
            /**
             * [注册资金]
             */
            var registeredCapitalUBAConfig = {
                pb: 'UserBehavior_searchsupply_zijin_pb_#position#_#page#_#keyword#?detailuserid=#companyid#&detailbcid=#bcid#',
                gp: 'UserBehavior_searchsupply_zijin_gp_#position#_#page#_#keyword#?detailuserid=#companyid#&detailbcid=#bcid#',
                other: 'UserBehavior_searchsupply_zijin_#position#_#page#_#keyword#?detailuserid=#companyid#&detailbcid=#bcid#'
            };
            var registeredCapitalUBAKeyword = (registeredCapitalUBAConfig[type_montior] || registeredCapitalUBAConfig['other'])
                .replace(/#position#/g, company_num_temp)
                .replace(/#page#/g, page_temp)
                .replace(/#keyword#/g, window['hc_keyword'] || '')
                .replace(/#companyid#/g, company_id_temp)
                .replace(/#bcid#/g, bc_id_temp);
            if (reg_capital) {
                if (reg_unit) {
                    if (reg_unit.indexOf("人民币") != -1) {
                        innertxt += '<dt>注册资金：</dt>';
                        innertxt += '<dd><a target="_blank" href="' + companyUrl + '" onclick="HC.UBA.sendUserlogsElement(\'' + registeredCapitalUBAKeyword + '\')">人民币' + reg_capital + '万元</a></dd>';
                    } else {
                        innertxt += '<dt>注册资金：</dt>';
                        innertxt += '<dd><a target="_blank" href="' + companyUrl + '" onclick="HC.UBA.sendUserlogsElement(\'' + registeredCapitalUBAKeyword + '\')">人民币' + reg_capital + '万' + reg_unit + '</a></dd>';
                    }
                } else {
                    innertxt += '<dt>注册资金：</dt>';
                    innertxt += '<dd><a target="_blank" href="' + companyUrl + '" onclick="HC.UBA.sendUserlogsElement(\'' + registeredCapitalUBAKeyword + '\')">人民币' + reg_capital + '万元</a></dd>';
                }
            }
            innertxt += "</dl>";
            if (ten_Medal == '1' || top_bw == '1') {
                innertxt += '<div class="honor"><dl><dt>商家荣誉：</dt>';
                if (top_bw == '1') {
                    innertxt += '<dd><a target="_blank" href="//info.hc360.com/list/mvb.shtml" title="慧聪标王" class="newIco7" onclick="search_log_new(\'supply_bwsjtb_\', \'' + company_num_temp + '\',\'' + page_temp + '\', \'' + company_id_temp + '\',\'' + bc_id_temp + '\')">标王</a>';
                }
                if (ten_Medal == '1') {
                    if (top_bw == '0')
                        innertxt += '<dd>';
                    innertxt += '<a title="十强勋章" class="newIco8"></a>';
                }
                innertxt += '</dd>';
            }
            innertxt += '</dl></div>';
            innertxt += "</div>";
            div.innerHTML = innertxt;

            tagEntity.parent('div[data-name="proItem"]').append(div);
            // var c = document.getElementById(company_num_temp + "_" + company_id_temp);
            // if (!c) {
            //     if (company_id_temp != "") {
            //         document.getElementById("NewItem_" + company_num_temp + "_" + company_id_temp).appendChild(div);
            //     }
            // }
        });
};


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
};


function search_log_new(itemname, position, page, usrid, bcid) {
    var str = "UserBehavior_search";
    if (undefined == usrid) {
        str += itemname + position + '_' + page + '_' + hc_keyword;
    } else {
        str += itemname + position + '_' + page + '_' + hc_keyword + '?' + "detailuserid=" + usrid + "&detailbcid=" + bcid;
    }
    HC.UBA.sendUserlogsElement(str);
    return true;
}


module.exports={
    showProductDetail:showProductDetail,
    companyinfo:companyinfo
};