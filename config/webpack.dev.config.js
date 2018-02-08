const base = require("./webpack.base.config");
const merge = require("webpack-merge");

module.exports = merge.smart(base, {
	devtool: "source-map",
	devServer: {
		port: 8000,
		overlay: true,
		stats: {
			hash: false,
			version: false,
			assets: false,
			modules: true,
			timings: true,
			cached: false,
		},
	},
});
