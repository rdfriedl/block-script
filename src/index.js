import "script-loader!jquery";
import "script-loader!bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/superhero/bootstrap.min.css";

import "font-awesome";
import "flex-layout-attribute";

import "./css/style.css";
import "./css/utils.css";

window.addEventListener("load", () => {
	import("./bootstrap");
});
