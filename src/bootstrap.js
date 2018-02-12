import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import App from "./views/App";

const render = Component => {
	ReactDOM.render(
		<AppContainer>
			<Component />
		</AppContainer>,
		document.getElementById("app"),
	);
};

// register the service worker
if (process.env.NODE_ENV === "production") {
	registerServiceWorker();
}

fixHtml();

render(App);

// Webpack Hot Module Replacement API
if (module.hot) {
	module.hot.accept("./views/App", () => {
		render(App);
	});
}

function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.register("/sw.js")
			.then(registration => {
				console.log("SW registered: ", registration);
			})
			.catch(registrationError => {
				console.log("SW registration failed: ", registrationError);
			});
	}
}

function fixHtml() {
	// fix middle click
	document.body.addEventListener("mousedown", event => {
		if (event.button === 1) event.preventDefault();
	});

	// dont allow the user to drag images
	document.body.addEventListener("dragstart", event => {
		if (event.target.nodeName === "IMG") {
			event.preventDefault();
			return false;
		}
	});

	// stop blank links
	document.body.addEventListener("click", event => {
		if (event.target.nodeName === "A" && event.target.getAttribute("href") === "#") {
			event.preventDefault();
			return false;
		}
	});
}
