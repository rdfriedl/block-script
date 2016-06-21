const path = require('path');
const fs = require('fs');
const webpack = require("webpack");

module.exports = {
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.vue'],
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
			'bootstrap',
			'bootstrap-toggle',
			'bootstrap-dialog',
			'dexie',
			'keypress.js/keypress.js',
			'stats.js/build/stats.min.js',
			'knockout',
			'knockout-mapping',
			'minivents',
			'three',
			'font-awesome/css/font-awesome.min.css'
		]
	},
	output: {
        path: path.resolve("./dist"),
		filename: "[name].js",
		publicPath: ''
	},
	plugins: [
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
