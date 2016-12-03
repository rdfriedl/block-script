const webpack = require('webpack');
const path = require('path');
const pkg = require('../package.json');

module.exports = {
	entry: {
		app: ['webpack-dev-server/client?http://localhost:8080', 'webpack/hot/dev-server']
		// vendor: [
		// 	'jquery',
		// 	'keypress.js',
		// 	'minivents',
		// 	'stats.js',
		// 	'three'
		// ]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: 'vendor',
		// 	filename: 'vendor.bundle.js',
		// 	chunks: ['app','vendor']
		// })
	],

	devtool: 'source-map',
	devServer: {
		contentBase: 'dist',
		compress: true,
		port: 8080,
		open: true,
		hot: true
	}
}
