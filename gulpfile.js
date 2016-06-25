const gulp = require('gulp');
const gutil = require('gulp-util');
const del = require('del');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const opener = require('opener');
const shell = require('gulp-shell');
const webserver = require('gulp-webserver');
const replace = require('gulp-replace');

// Configurations.
const webpackConfig = require('./webpack.config.js');
const package = require('./package.json');
const sourceDirectory = package.directories.src;
const destinationDirectory = package.directories.dist;

const isDev = process.env.NODE_ENV.trim().toLowerCase() == 'dev';

function changeConfig(config){
	//add production plugins
	if(!isDev){
		// minify
		config.plugins.push(new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			sourceMap: true,
			exclude: [/(node_modules|web_modules)/]
		}));
	}
	else{
		config.devtool = 'source-maps';

		// remove externals sinec we DONT want to load stuff from the cdn
		config.externals = undefined;
	}
}

gulp.task('build:webpack', function(done){
	let config = Object.create(webpackConfig);
	changeConfig(config);

	let compiler = webpack(config);
	compiler.run((err, stats) => {
		gutil.log(stats.toString({
			colors: true,
			modules: false,
			children: false,
			chunks: false,
			chunkModules: false
		}))
		done();
	});
});

gulp.task('build:html', function(){
	let tag = isDev? /<!-- +REMOVE_DEV[^>]+(\r|\n|.)+REMOVE_DEV[^>]+-->/gm : /<!-- +REMOVE_PRODUCTION[^>]+(\r|\n|.)+REMOVE_PRODUCTION[^>]+-->/gm;
	return gulp.src(`${sourceDirectory}/index.html`)
		.pipe(replace(tag,''))
		.pipe(gulp.dest(destinationDirectory));
});

gulp.task('build:res', function(){
	return gulp.src(`${sourceDirectory}/res/**/*`).pipe(gulp.dest(`${destinationDirectory}/res`));
});

gulp.task('clean', function(done){
	del([destinationDirectory+'/*']).then(() => done());
});

gulp.task('serve', function(done) {
	let config = Object.create(webpackConfig);
	changeConfig(config);

	//add HMR scripts
	config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080", "webpack/hot/dev-server");
	if(config.entry.vendor) config.entry.vendor.unshift("webpack-dev-server/client?http://localhost:8080", "webpack/hot/dev-server");
	config.plugins.push(new webpack.HotModuleReplacementPlugin());

	let compiler = webpack(config);
	let server = new WebpackDevServer(compiler, {
		contentBase: 'dist',
		hot: true
	});

	server.listen(8080, 'localhost');
	opener('http://localhost:8080');
});

gulp.task('build:docs', function(){
	return gulp.src('README.md', {read: false})
  		.pipe(shell('jsdoc -c jsdoc.json'));
});
gulp.task('watch:docs', function(){
	gulp.watch('src/**/*', gulp.parallel('build:docs'))
});
gulp.task('clean:docs', function(done){
	del(['docs']).then(() => done());
});
gulp.task('serve:docs', function(){
	return gulp.src('docs')
		.pipe(webserver({
			livereload: true,
			open: true
		}))
})
gulp.task('docs', gulp.series('clean:docs', 'build:docs', gulp.parallel('watch:docs', 'serve:docs')));

// Production task.
gulp.task('build', gulp.series('clean', gulp.parallel('build:webpack','build:html')));

// Development task.
gulp.task('default', gulp.parallel(['build:html', 'serve']));
