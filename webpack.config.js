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
			'keypress',
			'knockout',
			'knockout-mapping',
			'minivents',
			'three',
			'fontawesome'
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
				exclude: /\.styles\.css/,
				loaders: [
					'style/url',
					'file?name=res/css/[hash].[ext]'
				]
			},
			{
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file',
				query: {
					name: 'res/font/[hash].[ext]'
				}
			},
			{
				test: /\.html$/,
				loader: 'html'
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
					'file-loader?name=res/model/[hash].[ext]',
					'svgo-loader'
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
