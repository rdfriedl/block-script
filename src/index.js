import "./css/font.css";

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
	import("./bootstrap");
}
