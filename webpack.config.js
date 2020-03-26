const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
	const IS_PROD = env.mode === "production";
	const IS_DEV = !IS_PROD;

	const SOURCE_MAPS = IS_DEV;
	const EXTRACT_CSS = IS_PROD;
	const SHOW_STATS = !!env.stats;

	return {
		mode: env.mode,
		resolve: {
			alias: {
				keypress: "keypress.js/keypress.js",
				stats: "stats.js/build/stats.min.js",
			},
			symlinks: false,
		},
		entry: "./src/index.js",
		output: {
			path: path.resolve("dist"),
			filename: "[name]-[hash:8].js",
			chunkFilename: "[name]-[hash:8].js",
			publicPath: "",
		},
		plugins: [
			new DuplicatePackageCheckerPlugin(),
			new HtmlWebpackPlugin({
				template: "./src/index.html",
			}),
			EXTRACT_CSS && new MiniCssExtractPlugin(),
			SHOW_STATS && new BundleAnalyzerPlugin(),
		].filter(Boolean),
		devtool: SOURCE_MAPS ? "source-map" : undefined,
		module: {
			rules: [
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
					exclude: /node_modules/,
					use: [
						EXTRACT_CSS ? MiniCssExtractPlugin.loader : "style-loader",
						{
							loader: "css-loader",
							options: {
								sourceMap: SOURCE_MAPS,
								importLoaders: 1,
							},
						},
						{
							loader: "postcss-loader",
							options: {
								sourceMap: SOURCE_MAPS,
								plugins: [
									require("precss"),
									IS_PROD && require("autoprefixer"),
									IS_PROD &&
										require("cssnano")({
											preset: "default",
										}),
								].filter(Boolean),
							},
						},
					],
				},
				{
					test: /\.css$/,
					include: /node_modules/,
					use: [EXTRACT_CSS ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
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
					test: /\.shader$/,
					use: "raw-loader",
				},
			],
		},
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
				cached: false,
			},
		},
	};
};
