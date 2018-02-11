import { el } from "redom";

export default class RedomComponent {
	constructor(props, ...children) {
		this.props = props || {};
		this.children = children;
		this.ref = this.refs = {};

		let result = this.createElement(props, ...children);
		this.el = this.el || result || el("div");

		this.updateElement(props, {});
	}
	update(props) {
		let oldProps = Object.assign({}, this.props);
		Object.assign(this.props, props || {});

		this.updateElement(this.props, oldProps);
	}

	/**
	 * @param {Object} props
	 * */
	createElement(props) {
		this.el = el("div", props);
	}
	/**
	 * @param {Object} props
	 * @param {Object} oldProps
	 * */
	updateElement(props, oldProps) {}
	onmount() {}
	onremount() {}
	onunmount() {}
}
