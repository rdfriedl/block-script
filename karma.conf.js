const path = require("path");
// we can just use the exact same webpack config by requiring it
const webpackConfig = require("./config/webpack.test.config.js");
delete webpackConfig.entry;

module.exports = function(config) {
	config.set({
		basePath: "./",
		singleRun: false,
		browsers: ["ChromeHeadless", "FirefoxHeadless"],
		customLaunchers: {
			FirefoxHeadless: {
				base: "Firefox",
				flags: ["-headless"]
			}
		},
		frameworks: ["source-map-support", "mocha", "sinon-chai"],
		// this is the entry file for all our tests.
		files: ["tests/index.js"],
		// we will pass the entry file to webpack for bundling.
		preprocessors: {
			"tests/index.js": ["webpack"]
		},
		reporters: ["mocha", "coverage-istanbul"],

		client: {
			// hide all the annoying console logs
			captureConsole: false,
			mocha: {
				reporter: "html"
			}
		},

		// use the webpack config
		webpack: webpackConfig,

		// avoid walls of useless text
		webpackMiddleware: {
			stats: "errors-only"
		},

		mochaReporter: {
			output: "autowatch",
			showDiff: true
		},

		coverageIstanbulReporter: {
			reports: ["html", "lcovonly", "json", "text-summary"],
			dir: "./coverage",
			combineBrowserReports: true,
			fixWebpackSourcePaths: true,
			skipFilesWithNoCoverage: false,
			"report-config": {
				html: {
					subdir: "html"
				}
			}
		}
	});
};
