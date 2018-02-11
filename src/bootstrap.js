import { mount } from "redom";
// import Vue from "vue";
// import VueRouter from "vu-router";

// load vue components
// import GameComponent from "./components/Game.vue";
// import MenuComponent from "./components/Menu.vue";
// import CreditsMenuComponent from "./components/menu/Credits.vue";
// import HelpMenuComponent from "./components/menu/Help.vue";
// import SettingsMenuComponent from "./components/menu/Settings.vue";
// import RoomEditorComponent from "./components/RoomEditor.vue";

let isBootstrapPrevented = false;

export function preventBootstrap() {
	isBootstrapPrevented = true;
}

/** mounts the app into the dom */
export function bootstrap() {
	// register the service worker
	if (process.env.NODE_ENV === "production") {
		registerServiceWorker();
	}

	fixHtml();

	if (!isBootstrapPrevented) {
		return import("./components/redom/App").then(module => {
			const App = module.default;

			let app = new App();
			mount(document.body, app);

			return app;
		});
	}

	return Promise.resolve();
	// if (process.env.NODE_ENV === "production") {
	// 	Vue.config.silent = true;
	// }

	// set up the config
	// Vue.use(VueRouter);

	// Vue.filter("nl-to-br", function(value) {
	// 	return String(value).replace(/\n/g, "<br>");
	// });

	// create the router
	// let router = new VueRouter({
	// 	routes: [
	// 		{ path: "/", component: MenuComponent },
	// 		{ path: "/menu", component: MenuComponent },
	// 		{ path: "/play", component: GameComponent },
	// 		{ path: "/credits", component: CreditsMenuComponent },
	// 		{ path: "/help", component: HelpMenuComponent },
	// 		{ path: "/help/:topic", component: HelpMenuComponent },
	// 		{ path: "/settings", component: SettingsMenuComponent },
	// 		{ path: "/settings/:topic", component: SettingsMenuComponent },
	// 		{ path: "/editor", component: RoomEditorComponent },
	// 		{ path: "/editor/:room", component: RoomEditorComponent },
	// 	],
	// });

	// new Vue({
	// 	router,
	// 	render(createElement) {
	// 		return createElement("router-view");
	// 	},
	// }).$mount("#app");
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
