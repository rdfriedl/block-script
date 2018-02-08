switch (process.env.NODE_ENV) {
	case "development":
		module.exports = require("./config/webpack.dev.config.js");
		break;
	default:
	case "production":
		module.exports = require("./config/webpack.prod.config.js");
		break;
}
