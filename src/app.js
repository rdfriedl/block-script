import THREE from "three";
import Vue from "vue";
import VueRouter from "vue-router";

// load vue components
import GameComponent from "./components/Game.vue";
import MenuComponent from "./components/Menu.vue";
import CreditsMenuComponent from "./components/menu/Credits.vue";
import HelpMenuComponent from "./components/menu/Help.vue";
import SettingsMenuComponent from "./components/menu/Settings.vue";
import RoomEditorComponent from "./components/RoomEditor.vue";

export function bootstrap() {
	if (process.env.NODE_ENV === "production") {
		Vue.config.silent = true;
	}

	// set up the config
	Vue.use(VueRouter);

	Vue.filter("nl-to-br", function(value) {
		return String(value).replace(/\n/g, "<br>");
	});

	// create the router
	let router = new VueRouter({
		routes: [
			{ path: "/", component: MenuComponent },
			{ path: "/menu", component: MenuComponent },
			{ path: "/play", component: GameComponent },
			{ path: "/credits", component: CreditsMenuComponent },
			{ path: "/help", component: HelpMenuComponent },
			{ path: "/help/:topic", component: HelpMenuComponent },
			{ path: "/settings", component: SettingsMenuComponent },
			{ path: "/settings/:topic", component: SettingsMenuComponent },
			{ path: "/editor", component: RoomEditorComponent },
			{ path: "/editor/:room", component: RoomEditorComponent },
		],
	});

	new Vue({
		router,
		render(createElement) {
			return createElement("router-view");
		},
	}).$mount("#app");

	// register the service worker
	if (process.env.NODE_ENV === "production") {
		registerServiceWorker();
	}

	fixHtml();

	if (process.env.NODE_ENV === "development") {
		setupDebug();
	}
}

function setupDebug() {
	Vue.config.devtools = true;
	Vue.config.debug = true;
	window.Vue = Vue;
	window.THREE = THREE;
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
