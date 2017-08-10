var gulp = require('gulp'),
	rename = require('gulp-rename'),
	gulputil = require('gulp-util'),
	ftp = require('vinyl-ftp');

/**
 * [文件上传到中转机]
 */
gulp.task('upload', function() {

	/**
	 * [conn 创建连接对象]
	 * @type {Object}
	 */
	var conn = ftp.create({
			host: '192.168.249.2',
			user: 'csftp01',
			password: 'ftp01asd',
			parallel: 10,
			log: gulputil.log
		}),

		/**
		 * [testingEnvPath 测试环境路径]
		 * @type {String}
		 */
		testingEnvPath = '/Cancer/Project/123123/';

	/**
	 * [globs 上传文件]
	 * @type {Array}
	 */
	var globs = [
		'./dist/**/*.js'
	];

	// using base = '.' will transfer everything to /public_html correctly 
	// turn off buffering in gulp.src for best performance 
	return gulp.src(globs, {
			base: '.',
			buffer: false
		})
		.pipe(conn.newer(testingEnvPath + 'style/js/module/p4p/')) // only upload newer files
		.pipe(conn.dest(testingEnvPath + 'style/js/module/p4p/'));
});

/**
 * [默认构建任务]
 */
gulp.task('default', ['upload']);