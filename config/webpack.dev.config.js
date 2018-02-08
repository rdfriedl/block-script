const base = require('./webpack.base.config');
const merge = require('webpack-merge');

module.exports = merge.smart(base, {
	devtool: 'source-map',
	devServer: {
		contentBase: 'dist',
		port: 8080
	}
});
