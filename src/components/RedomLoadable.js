import { router, el } from "redom";
import RedomComponent from "./RedomComponent";

export class Loading extends RedomComponent {
	createElement() {
		return el("span", "Loading Component...");
	}
}
export class LoadingError extends RedomComponent {
	createElement() {
		return el("pre");
	}
	updateElement({ error }) {
		if (error) {
			this.el.textContent = error.stack || `${error.name}: ${error.message}`;
			console.error(error);
		}
	}
}

export default function Loadable(config = {}) {
	return class RedomLoadable extends RedomComponent {
		onmount() {
			if (this.loading) return;

			this.router.update("loading");

			this.loading = config
				.load()
				.then(component => {
					this.component = component.__esModule ? component.default : component;

					if (typeof this.component !== "function") {
						throw new Error("unable to find component");
					}

					this.router.update("loaded");
				})
				.catch(error => {
					this.router.update("error", { error });
				});
		}
		createElement(props, ...children) {
			this.el = el("div.redom-loadable");

			this.router = router(this.el, {
				loading: config.Loading || Loading,
				error: config.LoadingError || LoadingError,
				loaded: () => {
					this.element = new this.component(props, ...children);
					return this.element;
				},
			});
		}
		updateElement(props, ...children) {
			if (this.element) {
				this.element.updateElement(props, ...children);
			}
		}
	};
}
