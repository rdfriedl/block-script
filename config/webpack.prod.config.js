const webpack = require('webpack');

module.exports = {
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: true
			},
			sourceMap: true,
			exclude: [/(node_modules|web_modules)/]
		})
	],
	externals: {
		'vue': 'Vue',
		'vue-router': 'VueRouter',
		'dexie': 'Dexie',
		'keypress': 'keypress',
		'stats': 'Stats',
		'three': 'THREE',
		'font-awesome': 'undefined',
		'flex-layout-attribute ': 'undefined',
		'file-saver': '{saveAs: saveAs}',
		'undo-manager': 'UndoManager'
	}
}
