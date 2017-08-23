var path = require('path'),
    utils = require('./utils'),
    webpack = require('webpack'),
    config = require('./config')[process.env.NODE_ENV],
    merge = require('webpack-merge'),
    baseWebpackConfig = require('./webpack.base.conf'),
    HTMLWebPackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.productionSourceMap,
            extract: true
        })
    },
    devtool: config.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.assetsRoot,
        // filename: utils.assetsPath('js/[name].js'),
        // chunkFilename: utils.assetsPath('js/[id].js')
        // filename: utils.assetsPath('[name].js'),
        filename: utils.assetsPath('[name].js'),
        chunkFilename: utils.assetsPath('[name].js')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': process.env.NODE_ENV
        }),
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
         * 提取样式文件
         */
        new ExtractTextPlugin(utils.assetsPath('[name].css')),

        /**
         * [根据模块调用次数，给模块分配ids，常被调用的ids分配更短的id，使得ids可预测，降低文件大小]
         */
        new webpack.optimize.OccurrenceOrderPlugin()

        // split vendor js into its own file
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'combo'
        // }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'manifest',
        //     chunks: ['vendor']
        // })
    ]
});
module.exports = webpackConfig;
