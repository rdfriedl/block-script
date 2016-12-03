const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	resolve: {
		extensions: ['.js', '.vue'],
		alias: {
			'event-emitter': 'wolfy87-eventemitter/EventEmitter.min.js', // event-emiiter is not part of vendor
			'font-awesome': 'font-awesome/css/font-awesome.min.css',
			'keypress': 'keypress.js/keypress.js',
			'stats': 'stats.js/build/stats.min.js'
		}
	},
	entry: {
		app: [
			path.resolve('src/index.js')
		]
	},
	output: {
		path: path.resolve('dist'),
		filename: '[name].js',
		publicPath: ''
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve('src/index.html')
		}),
		new webpack.EnvironmentPlugin([
			'NODE_ENV'
		])
	],
	module: {
		rules: [
			{
				test: /\.vue/,
				use: ['vue-loader']
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|web_modules)/,
				use: [
					{
						loader: 'babel-loader',
						options: {cacheDirectory: ''}
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 100000,
							name: 'res/font/[hash].[ext]'
						}
					}
				]
			},
			{
				test: /\.html$/,
				use: 'html-loader'
			},
			{
				test: /\.md$/,
				use: ['html-loader','markdown-loader']
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: 'file-loader',
						options: {name: 'res/image/[hash].[ext]'}
					},
					{
						loader: 'img-loader',
						options: {minimize: true}
					}
				]
			},
			{
				test: /\.(dae|ply)$/,
				use: [
					'file-loader?name=res/model/[hash].[ext]'
				]
			},
			{
				test: /\.(mp3|ogg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {name: 'res/audio/[hash].[ext]'}
					}
				]
			},
			{
				test: /\.json$/,
				use: 'json-loader'
			},
			{
				test: /\.shader$/,
				use: 'raw-loader'
			}
		]
	}
}
