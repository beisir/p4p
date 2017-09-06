var webpack = require('webpack'),
    path = require('path'),
    fs = require('fs'),
    htmlWebPackPlugin = require('html-webpack-plugin');

/**
 * [entryMapList 入口文件列表]
 * @type {Array}
 */
var entryMapList = [
    { name: 'p4p.search.resultList', desccription: 'S域，搜索结果列表页', example: '//s.hc360.com/?w=led&mc=seller&ap=A' },
    { name: 'p4p.www.aladdin', desccription: 'WWW域，阿拉丁着陆页', example: '//www.hc360.com/series/bdald/4334328.html?w=%B3%E4%C6%F8%B3%C7%B1%A4&confr=8&kid=4334328&subconfr=1' },
    { name: 'p4p.www.miniportal', desccription: 'WWW域，PC微门户页', example: '//m.hc360.com/cp/jiage/guanzhuangcheng.html' },
    { name: 'p4p.b2b.shopLargeImage', desccription: 'B2B域，商铺商品大图页', example: '//b2b.hc360.com/viewPics/supplyself_pics/80312739456.html' },
    { name: 'p4p.b2b.3yShopLargeImage.3y', desccription: 'B2B域，3y商铺商品大图页', example: '//b2b.hc360.com/viewPics/supplyself_pics/80312739486.html' },
    { name: 'p4p.b2b.shop404', desccription: 'B2B域，商铺404页', example: '//b2b.hc360.com/supplyself/61298871311111111111111.html' },
    { name: 'p4p.b2b.shopIndex', desccription: '2.0商铺首页', example: '//faban15.b2b.hc360.com/' },
    { name: 'p4p.b2b.3yShopIndex', desccription: 'B2B域，3Y商铺首页', example: '//hcws0000120086.b2b.hc360.com/' },
    { name: 'p4p.b2b.shopDetail', desccription: 'B2B域，自发免费商铺商品终极页', example: '//b2b.hc360.com/supplyself/612988713.html' },
    { name: 'p4p.b2b.3yShopDetail', desccription: 'B2B域，3Y商铺商品终极页', example: '//b2b.hc360.com/supplyself/80312739456.html' },
    { name: 'p4p.b2b.yellowPage', desccription: 'B2B域，公司黄页', example: '//b2b.hc360.com/company/hctest5001.html' },
    { name: 'p4p.msite.miniportal', desccription: 'M域，M站微门户页', example: '//m.hc360.com/cp/guanzhuangcheng.html' },
    { name: 'p4p.www.microportal', desccription: 'pc微门户页', example: '//www.hc360.com/cp/' },
    { name: 'p4p.msite.searchResultList', desccription: 'M域，M站搜索结果页', example: '//m.hc360.com/cp/guanzhuangcheng.html' },
    { name: 'p4p.jsite.searchResultList', desccription: 'JS域，JS站搜索结果页', example: '//js.hc360.com/prod-0/900038066.html' },
    { name: 'p4p.jsite.detail', desccription: 'JS域，JS站详情页', example: '//js.hc360.com/supplyself/624506818.html' },
    { name: 'p4p.jsite.shopLargeImage', desccription: 'JS域，JS站大图页', example: '//js.hc360.com/b2b/jinjiangjiayi/viewPics/supplyself_pics/47039839.html' },
    { name: 'p4p.jsite.graphicDetail', desccription: 'JS域，JS站商品图文详情页', example: '//js.hc360.com/supplyself/47039839-detail.html' },
    { name: 'p4p.msite.detail', desccription: 'JS域，M站详情页', example: '//m.hc360.com/supplyself/624506818.html' },
    { name: 'p4p.SEM.detail', desccription: 'P4PDETAIL域，SEM聚合终极页', example: '' },
    { name: 'p4p.www.searchAggregation', desccription: '搜索聚合页', example: '' },
    { name: 'p4p.www.p4pPlusOnPage', desccription: '互通宝plus承接页，参照搜索聚合页', example: '' },
    { name: 'p4p.z.searchResultList', desccription: 'PC端z域搜索结果页', example: '' },
    { name: 'p4p.www.homepage', desccription: '大首页新人专享模块', example: '' },
    { name: 'p4p.msite.aggregation', desccription: 'M域，移动端P4P聚合页面', example: '' },
    { name: 'p4p.168.proDetail', desccription: '公众号产品推荐P4P', example: '//168.mobile.hc360.com/page/wxmsg/purchase/purchaseRequist.html?params=infoId%408111112' },
    { name: 'p4p.msite.zResultList', desccription: '移动端z域搜索结果页', example: '' },
    { name: 'p4p.msite.zIndex', desccription: '移动端z域首页', example: '//z.hc360.com/p4psearch/mindex.html' },
    { name: 'p4p.b2b.3yCompany', desccription: 'B2B域，3Y商铺联系我们页面', example: '//hcwsjingsu77567.b2b.hc360.com/shop/company.html' },
    { name: 'p4p.b2b.freeShopCompany', desccription: '免费会员,联系我们页面2.0', example: '//hcwsjingsu77567.b2b.hc360.com/shop/company.html' },
    { name: 'p4p.b2b.shop30Company', desccription: '免费会员,联系我们页面3.0', example: '//hcwsjingsu77567.b2b.hc360.com/shop/company.html' },
    { name: 'p4p.b2b.shopIndex30', desccription: '3.0商铺首页', example: '//hymt099.b2b.hc360.com' },
    { name: 'p4p.b2b.successStoryInfo', desccription: '成功故事', example: '//info.cggs.hc360.com/2017/06/01144113681.shtml' }
];

module.exports = Object.assign({

    /**
     * [devtool 生成压缩脚本map文件]
     * @type {String}
     */
    // devtool: 'source-map',

    /**
     * [entry 入口文件配置]
     * @type {Object}
     */
    entry: {},

    /**
     * [output 输出文件配置]
     * @type {Object}
     */
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js',
        publicPath: '//localhost:8080/dist/',
        chunkFilename: '[name].js'
    },

    /**
     * [resolve description]
     * @type {Object}
     */
    resolve: {
        extensions: ['', '.js'],
        alias: {
            'template': path.join(__dirname, 'node_modules/art-template/dist/template'),
        }
    },

    /**
     * [module 模块加载器配置]
     * @type {Object}
     */
    module: {},

    /**
     * [externals description]
     * @type {Object}
     */
    externals: {
        jquery: 'window.$'
    },

    /**
     * [devServer 本地服务配置]
     * @type {Object}
     */
    devServer: {
        port: 8080,
        contentBase: './dist',
        inline: true,
        host: '0.0.0.0'
    },

    /**
     * [plugins 插件配置]
     * @type {Array}
     */
    plugins: []
}, {
    entry: (function() {
        var result = {};
        entryMapList.forEach(function(elem, index) {
            result[elem.name] = path.join(__dirname, 'src', elem.name);
        });
        return result;
    })(),
    plugins: (function() {
        var result = [

            /**
             * [UglifyJsPlugin js压缩插件配置]
             */
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    screw_ie8: false
                },
                output: {
                    comments: false,
                    ascii_only: true,
                    screw_ie8: false
                },
                mangle: {
                    screw_ie8: false
                }
            }),

            /**
             * [根据模块调用次数，给模块分配ids，常被调用的ids分配更短的id，使得ids可预测，降低文件大小]
             */
            new webpack.optimize.OccurrenceOrderPlugin()
        ];

        /**
         * [htmlWebPackPlugin]
         */
        entryMapList.forEach(function(elem, index) {
            if (fs.existsSync(path.join(__dirname, './src/html/' + elem.name + '.html'))) {
                result.push(
                    new htmlWebPackPlugin({
                        template: './src/html/' + elem.name + '.html',
                        filename: 'html/' + elem.name + '.html',
                        chunks: [elem.name],
                        inject: 'body'
                    })
                );
            }
        });
        return result;
    })() || []
});
