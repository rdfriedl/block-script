const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

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
	},
	entry: {
		main: path.resolve("src/index.js"),
	},
	output: {
		path: path.resolve("dist"),
		filename: "[name]-[hash:8].js",
		publicPath: "",
	},
	plugins: [
		new CircularDependencyPlugin({
			exclude: /node_modules/,
		}),
		new DuplicatePackageCheckerPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			chunks: ["main"],
			minChunks: ({ resource }) => /node_modules/.test(resource),
		}),
		new HtmlWebpackPlugin({
			template: path.resolve("src/index.html"),
		}),
		new webpack.EnvironmentPlugin(["NODE_ENV"]),
		new ExtractTextPlugin({
			filename: "[name]-[contenthash:8].css",
			disable: IS_DEV,
		}),
	],
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
				use: ExtractTextPlugin.extract({
					fallback: {
						loader: "style-loader",
						options: {
							sourceMap: IS_DEV,
						},
					},
					use: [
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
								plugins: [require("precss"), require("autoprefixer")],
							},
						},
					],
				}),
			},
			{
				test: /\.css$/,
				include: /(node_modules)/,
				use: ExtractTextPlugin.extract({
					fallback: {
						loader: "style-loader",
						options: {
							sourceMap: IS_DEV,
						},
					},
					use: [
						{
							loader: "css-loader",
							options: {
								sourceMap: IS_DEV,
								minimize: IS_PROD,
							},
						},
					],
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
