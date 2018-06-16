const { GenerateSW } = require("workbox-webpack-plugin");
const merge = require("webpack-merge");

const base = require("./webpack.base.config.js");

module.exports = merge.smart(base, {
	plugins: [
		new GenerateSW({
			clientsClaim: true,
			skipWaiting: true,
			runtimeCaching: [
				{
					urlPattern: new RegExp("https://fonts\\.googleapis\\.com"),
					handler: "staleWhileRevalidate"
				}
			]
		})
	],
	stats: {
		hash: false,
		env: true,
		version: true,
		timings: true,
		assets: true,
		modules: false
	}
});
