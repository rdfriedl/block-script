const path = require('path');
const fs = require('fs');
const webpack = require("webpack");

module.exports = {
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.vue'],
		alias: {
			'event-emitter': 'wolfy87-eventemitter/EventEmitter.min.js',
			'font-awesome': 'font-awesome/css/font-awesome.min.css',
			'keypress': 'keypress.js/keypress.js',
			'stats': 'stats.js/build/stats.min.js',
			'bootstrap-css': 'bootstrap/dist/css/bootstrap.min.css',
			'bootswatch-superhero': 'bootswatch/superhero/bootstrap.min.css',
			'bootstrap-toggle-css': 'bootstrap-toggle/css/bootstrap-toggle.min.css',
			'bootstrap-dialog-css': 'bootstrap-dialog/dist/css/bootstrap-dialog.min.css'
		},
		root: [
			path.resolve('./node_modules/')
		]
	},
	entry: {
		app: ['./src/app.js'],
		vendor: [
			'jquery',
			'jquery.mousewheel',
			'vue',
			'vue-router',
			'underscore',
			'bootstrap',
			'bootstrap-toggle',
			'bootstrap-dialog',
			'dexie',
			'keypress',
			'stats',
			'knockout',
			'knockout-mapping',
			'minivents',
			'three',
			'font-awesome',
			'event-emitter',
			'bootstrap-css',
			'bootswatch-superhero',
			'bootstrap-toggle-css',
			'bootstrap-dialog-css',
			'vue-strap'
		]
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

		// fix bootstrap
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
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
				test: /src.*\.js$/,
				exclude: /(node_modules|web_modules)/,
				loader: 'babel',
				query: JSON.parse(fs.readFileSync('./.babelrc'))
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
				test: /\.dae$/,
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
			}
		]
	}
}
