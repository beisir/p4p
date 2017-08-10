process.env.NODE_ENV = 'development';

var opn = require('opn'),
	fs = require('fs'),
	path = require('path'),
	express = require('express'),
	bodyParser = require('body-parser'),
	webpack = require('webpack'),
	proxyMiddleware = require('http-proxy-middleware'),
	config = require('./config')[process.env.NODE_ENV],
	webpackConfig = require('./webpack.dev.conf');

/**
 * [port 端口号]
 */
var port = config.port,

	/**
	 * [autoOpenBrowser 自动打开浏览器]
	 */
	autoOpenBrowser = !!config.autoOpenBrowser,

	/**
	 * [proxyTable 代理配置]
	 */
	proxyTable = config.proxyTable;

var app = express(),

	compiler = webpack(webpackConfig),

	devMiddleware = require('webpack-dev-middleware')(compiler, {
		publicPath: webpackConfig.output.publicPath,
		quiet: true
	}),

	hotMiddleware = require('webpack-hot-middleware')(compiler, {
		log: () => {}
	});

/**
 * [当html-webpack-plugin模板改变时，强制重新加载页面]                                                                                                                                                                       [description]
 */
compiler.plugin('compilation', function(compilation) {
	compilation.plugin('html-webpack-plugin-after-emit', function(data, callback) {
		hotMiddleware.publish({
			action: 'reload'
		});
		callback();
	});
});

Object.keys(proxyTable).forEach((context) => {
	var options = proxyTable[context];
	if (typeof options === 'string') {
		options = {
			target: options
		};
	}
	app.use(proxyMiddleware(options.filter || context, options));
});

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')());

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// serve pure static assets
var staticPath = path.posix.join(config.assetsPublicPath, config.assetsSubDirectory);
app.use(staticPath, express.static('./static'));

var uri = 'http://localhost:' + config.port;

devMiddleware.waitUntilValid(function() {
	console.log('> Listening at ' + uri + '\n');
});

module.exports = app.listen(port, function(err) {
	if (err) {
		console.log(err);
		return;
	}

	if (autoOpenBrowser) {
		opn(uri + '/html/p4p.b2b.shop404.html');
	}
});