const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const merge = require('webpack-merge');

const base = require('./webpack.base.config.js');

module.exports = merge.smart(base, {
	plugins: [
		new ManifestPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			sourceMap: true,
			exclude: [/(node_modules|web_modules)/]
		})
	]
});
