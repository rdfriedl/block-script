const webpack = require("webpack");
const WorkboxPlugin = require("workbox-webpack-plugin");
const merge = require("webpack-merge");

const base = require("./webpack.base.config.js");

module.exports = merge.smart(base, {
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			async: "common",
			children: true,
			minChunks: 2,
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			minChunks: ({ resource }) => resource.includes("node_modules"),
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "manifest",
			minChunks: Infinity,
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
			sourceMap: true,
			exclude: [/node_modules/],
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
