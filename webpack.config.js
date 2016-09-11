const path = require('path');
const fs = require('fs');
const webpack = require("webpack");

module.exports = {
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.vue'],
		alias: {
			'event-emitter': 'wolfy87-eventemitter/EventEmitter.min.js', //event-emiiter is not part of vendor
			'font-awesome': 'font-awesome/css/font-awesome.min.css',
			'keypress': 'keypress.js/keypress.js',
			'stats': 'stats.js/build/stats.min.js',

 			//fit bootstrap
			'bootstrap-switch-js': 'bootstrap-switch/dist/js/bootstrap-switch.min.js',

			'bootstrap-css': 'bootstrap/dist/css/bootstrap.min.css',
			'bootstrap-switch-css': 'bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css',
			'bootswatch-superhero': 'bootswatch/superhero/bootstrap.min.css',
		},
		root: [
			path.resolve('./node_modules/')
		]
	},
	entry: {
		app: ['./src/app.js'],
		vendor: [
			'script!jquery',
			'vue',
			'vue-router',
			'script!bootstrap/dist/js/bootstrap.min.js',
			'bootstrap-switch-js',
			'dexie',
			'keypress',
			'stats',
			'three',
			'font-awesome',
			'bootstrap-css',
			'bootswatch-superhero',
			'bootstrap-switch-css',
			'flex-layout-attribute',
			'vue-strap',
			'file-saver',
			'undo-manager'
		]
	},
	externals: {
		'script!jquery': 'jQuery',
		'vue': 'Vue',
		'vue-router': 'VueRouter',
		'script!bootstrap/dist/js/bootstrap.min.js': 'undefined',
		'dexie': 'Dexie',
		'keypress': 'keypress',
		'stats': 'Stats',
		'three': 'THREE',
		'font-awesome': 'undefined',
		'bootstrap-css': 'undefined',
		'bootswatch-superhero': 'undefined',
		'bootstrap-switch-js': 'undefined',
		'bootstrap-switch-css': 'undefined',
		'flex-layout-attribute ': 'undefined',
		'vue-strap': 'VueStrap',
		'file-saver': '{saveAs: saveAs}',
		'undo-manager': 'UndoManager'
    },
	output: {
        path: path.resolve("./dist"),
		filename: "[name].js",
		publicPath: ''
	},
	plugins: [
		new webpack.EnvironmentPlugin([
			"NODE_ENV"
		]),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			filename: "vendor.bundle.js",
			chunks: ['app','vendor']
		}),
		new webpack.dependencies.LabeledModulesPlugin(),
		new webpack.optimize.OccurenceOrderPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.vue/,
				loader: 'vue'
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|web_modules)/,
				loader: 'babel',
				query: Object.assign({}, JSON.parse(fs.readFileSync('./.babelrc')), {
					cacheDirectory: ''
				})
			},
			{
				test: /\.css$/,
				loaders: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader',
				query: {
					limit: 100000,
					name: 'res/font/[hash].[ext]'
				}
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				test: /\.md$/,
				loaders: ['html-loader','markdown-loader']
			},
			{
				test: /\.(png|jpg|gif)$/,
				loaders: [
					'file-loader?name=res/image/[hash].[ext]',
					'img-loader?minimize'
				]
			},
			{
				test: /\.(dae|ply)$/,
				loaders: [
					'file-loader?name=res/model/[hash].[ext]'
				]
			},
			{
				test: /\.(mp3|ogg)$/,
				loaders: [
					'file-loader?name=res/audio/[hash].[ext]'
				]
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.shader$/,
				loader: 'raw-loader'
			}
		]
	}
}
