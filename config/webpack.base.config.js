const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const IS_DEV = process.env.NODE_ENV === "development";
const IS_PROD = process.env.NODE_ENV === "production";

module.exports = {
	resolve: {
		extensions: [".js", ".vue"],
		alias: {
			"event-emitter": "wolfy87-eventemitter/EventEmitter.min.js", // event-emiiter is not part of vendor
			"font-awesome": "font-awesome/css/font-awesome.min.css",
			keypress: "keypress.js/keypress.js",
			stats: "stats.js/build/stats.min.js",
		},
		symlinks: false,
	},
	entry: {
		main: [path.resolve(__dirname, "../src/index.js")],
	},
	output: {
		path: path.resolve("dist"),
		filename: "[name]-[hash:8].js",
		chunkFilename: "[name]-[hash:8].js",
		publicPath: "",
	},
	plugins: [
		new CircularDependencyPlugin({
			exclude: /node_modules/,
		}),
		new DuplicatePackageCheckerPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve("src/index.html"),
		}),
		new webpack.EnvironmentPlugin(["NODE_ENV"]),
		new ExtractTextPlugin({
			filename: "[name]-[contenthash:8].css",
			disable: IS_DEV,
		}),
		process.env.WEBPACK_STATS && new BundleAnalyzerPlugin(),
	].filter(p => !!p),
	devtool: IS_DEV ? "source-map" : undefined,
	module: {
		rules: [
			{
				test: /\.vue/,
				loader: "vue-loader",
				options: {
					extractCSS: true,
				},
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|web_modules)/,
				loader: "babel-loader",
				options: {
					cacheDirectory: true,
				},
			},
			{
				test: /\.(p)?css$/,
				exclude: /(node_modules)/,
				use: [
					{
						loader: "style-loader",
						options: {
							sourceMap: IS_DEV,
						},
					},
					{
						loader: "css-loader",
						options: {
							sourceMap: IS_DEV,
							minimize: IS_PROD,
							importLoaders: 1,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: IS_DEV,
							plugins: [
								require("precss"),
								IS_PROD && require("autoprefixer"),
								IS_PROD &&
									require("cssnano")({
										preset: "default",
									}),
							].filter(p => !!p),
						},
					},
				],
			},
			{
				test: /\.css$/,
				include: /(node_modules)/,
				use: ExtractTextPlugin.extract({
					fallback: {
						loader: "style-loader",
					},
					use: ["css-loader"],
				}),
			},
			{
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "url-loader",
				options: {
					limit: 100000,
					name: "res/font/[name]-[hash:8].[ext]",
				},
			},
			{
				test: /\.html$/,
				use: "html-loader",
			},
			{
				test: /\.md$/,
				use: ["html-loader", "markdown-loader"],
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "res/image/[name]-[hash:8].[ext]",
						},
					},
					{
						loader: "img-loader",
						options: {
							minimize: IS_PROD,
						},
					},
				],
			},
			{
				test: /\.(dae|ply)$/,
				loader: "file-loader",
				options: {
					name: "res/model/[name]-[hash:8].[ext]",
				},
			},
			{
				test: /\.(mp3|ogg)$/,
				loader: "file-loader",
				options: {
					name: "res/audio/[name]-[hash:8].[ext]",
				},
			},
			{
				test: /\.json$/,
				use: "json-loader",
			},
			{
				test: /\.shader$/,
				use: "raw-loader",
			},
		],
	},
};
