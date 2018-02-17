const webpack = require("webpack");
const base = require("./webpack.base.config");
const merge = require("webpack-merge");

module.exports = merge.smart(base, {
	entry: {
		main: ["react-hot-loader/patch", "./src/index.js"]
	},
	plugins: [new webpack.NamedModulesPlugin()],
	devServer: {
		port: 8000,
		overlay: true,
		historyApiFallback: true,
		stats: {
			hash: false,
			version: false,
			assets: false,
			modules: true,
			timings: true,
			cached: false
		}
	}
});
