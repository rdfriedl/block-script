import { el, router as createRouter } from "redom";
import Navigo from "navigo";
import RedomComponent from "../RedomComponent";

export const router = new Navigo(null, false);

export default class Router extends RedomComponent {
	onmount() {
		this.createRoutes();
	}
	onunmount() {
		this.clearRoutes();
	}
	createRoutes() {
		let root = this.props.root || "";
		let routes = Object.assign({}, this.props.routes);
		this.routeHandlers = {};

		// handle the root route
		if (root === "" && routes["/"]) {
			let routeHandler = this.setActiveRoute.bind(this, "/");
			router.on(routeHandler);
			this.routeHandlers["/"] = routeHandler;
			delete routes["/"];
		}

		for (let route in this.props.routes) {
			let routeHandler = this.setActiveRoute.bind(this, route);
			router.on(root + route, routeHandler);
			this.routeHandlers[route] = routeHandler;
		}

		router.resolve();
	}
	clearRoutes() {
		Object.entries(this.routeHandlers).forEach(routeHandler => {
			router.off(routeHandler);
		});
	}
	setActiveRoute(route) {
		this.router.update(route);
	}
	createElement({ routes, ...props }) {
		this.el = el("div", props);

		this.router = createRouter(this.el, routes || {});
	}
}
