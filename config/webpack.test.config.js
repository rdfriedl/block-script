const path = require("path");
const base = require("./webpack.dev.config");
const merge = require("webpack-merge");

module.exports = merge.smart(base, {
	module: {
		rules: [
			{
				test: /\.js$/,
				include: path.resolve(__dirname, "../src"),
				exclude: [/node_modules|-spec\.js$/, /src\/(lib|res)/],
				loader: "istanbul-instrumenter-loader",
				options: {
					esModules: true,
				},
				enforce: "post",
			},
			{
				test: /\.css$/,
				loader: "ignore-loader",
				enforce: "pre",
			},
		],
	},
	devtool: "inline-source-map",
});
