// we can just use the exact same webpack config by requiring it
const webpackConfig = require("./webpack.config.js");
const webpack = require("webpack");
delete webpackConfig.entry;
delete webpackConfig.externals; //remove externals
webpackConfig.devtool = "inline-source-map";

module.exports = function(config) {
	config.set({
		browsers: ["ChromeHeadless", "FirefoxHeadless"],
		customLaunchers: {
			FirefoxHeadless: {
				base: "Firefox",
				flags: ["-headless"],
			},
		},
		frameworks: ["jasmine"],
		// this is the entry file for all our tests.
		files: ["tests/index.js"],
		// we will pass the entry file to webpack for bundling.
		preprocessors: {
			"tests/index.js": ["webpack", "sourcemap"],
		},
		// use the webpack config
		webpack: webpackConfig,
		// avoid walls of useless text
		webpackMiddleware: {
			noInfo: true,
		},
		singleRun: false,
	});
};
