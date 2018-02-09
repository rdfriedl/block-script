const webpack = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const merge = require("webpack-merge");

const base = require("./webpack.base.config.js");

module.exports = merge.smart(base, {
	plugins: [
		new ManifestPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
			sourceMap: true,
			exclude: [/(node_modules|web_modules)/],
		}),
		new WorkboxPlugin({
			globDirectory: "dist",
			globPatterns: ["**/*"],
			clientsClaim: true,
			skipWaiting: true,
			runtimeCaching: [
				{
					urlPattern: new RegExp("https://fonts\\.googleapis\\.com"),
					handler: "staleWhileRevalidate",
				},
			],
		}),
	],
	stats: {
		hash: false,
		env: true,
		version: true,
		timings: true,
		assets: true,
		modules: false,
	},
});
