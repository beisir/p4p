var path = require('path'),
    fs = require('fs'),
    utils = require('./utils'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer'),
    config = require('./config')[process.env.NODE_ENV],
    HTMLWebPackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * [初始化入口文件]
 */
var _entry = {},

    /**
     * [_plugins 插件配置对象]
     * @type {Array}
     */
    _plugins = [],

    /**
     * [_entries 入口文件列表]
     * @type {Object}
     */
    _entries = require('./entries'),

    /**
     * [_sourcePrefix 入口文件路径前缀]
     * @type {String}
     */
    _sourcePrefix = './src/';

/**
 * [根据入口文件group属性对入口文件进行分组]
 */
Object.keys(_entries).forEach((key) => {

    _entry[key] = _sourcePrefix + key;

    // console.log(key, path.join(__dirname, _sourcePrefix + _entries[key].template));
    if (fs.existsSync(path.join(__dirname, '../' + _sourcePrefix + _entries[key].template))) {

        /**
         * [添加模板插件配置]
         */
        _plugins.push(
            new HTMLWebPackPlugin({
                template: _sourcePrefix + _entries[key].template,
                filename: _entries[key].filename,
                chunks: [key], //该配置针对多入口文件
                inject: true,
                chunksSortMode: 'dependency' // 指定的chunk在插入到html文档前的排序方式
            })
        );
    }
});

module.exports = {
    entry: _entry,
    output: {
        path: config.assetsRoot,
        filename: '[name].js',
        publicPath: config.assetsPublicPath,
        chunkFilename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.css'],
        alias: {
            'template': path.join(__dirname, '../node_modules/art-template/dist/template')
        }
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            loaders: ['es3ify-loader']
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader?' + JSON.stringify({
                discardComments: {
                    removeAll: true
                }
            }))
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            query: {
                limit: 10000,
                name: utils.assetsPath('img/[name].[ext]')
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            query: {
                limit: 10000,
                name: utils.assetsPath('fonts/[name].[ext]')
            }
        }]
    },
    /**
     * [externals description]
     * @type {Object}
     */
    externals: {
        jquery: 'window.$'
    },
    plugins: _plugins
};