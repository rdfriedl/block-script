import "./css/font.css";
import * as THREE from "three";

if (process.env.NODE_ENV === "development") {
	window.THREE = THREE;
}

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
	import("./bootstrap");
}
