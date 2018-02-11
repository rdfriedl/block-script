import { el } from "redom";

export default class RedomComponent {
	constructor(props, ...children) {
		this.props = props;
		this.children = children;
		this.ref = this.refs = {};

		let result = this.createElement(props, ...children);
		this.el = this.el || result || el("div");

		this.updateElement(props);
	}
	update(props = {}) {
		Object.assign(this.props, props);

		this.updateElement(this.props);
	}

	createElement() {
		this.el = el("div");
	}
	updateElement() {}
}
