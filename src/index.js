import "script-loader!jquery";
import "script-loader!bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/superhero/bootstrap.min.css";

import "flex-layout-attribute";

import "./css/style.css";
import "./css/utils.css";

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
	import("./bootstrap");
}
