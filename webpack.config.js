const merge = require('webpack-merge');

let base = require('./config/webpack.base.config.js');

if(process.env.NODE_ENV == 'dev')
	module.exports = merge.smart(base, require('./config/webpack.dev.config.js'));
else
	module.exports = merge.smart(base, require('./config/webpack.prod.config.js'));
