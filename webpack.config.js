const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json')

let plugins = [
	new HtmlWebpackPlugin({
		template: './src/index.html'
	}),
	new webpack.EnvironmentPlugin([
		"NODE_ENV"
	])
];

if(process.env.NODE_ENV !== 'dev')
	plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: true
			},
			sourceMap: true,
			exclude: [/(node_modules|web_modules)/]
		})
	);

module.exports = {
	resolve: {
		extensions: ['.js', '.vue'],
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
		moduleExtensions: ['-loader']
	},
	entry: {
		app: [
			'./src/app.js'
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
	plugins: plugins,
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
	},

	devtool: process.env.NODE_ENV == 'dev'? 'source-map' : false,
	watch: process.env.NODE_ENV == 'dev',
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 8080,
		open: true,

		lazy: true
	}
}
