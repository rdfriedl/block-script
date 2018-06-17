import React, { Component } from "react";
import PropTypes from "prop-types";
import { WebGLRenderer } from "three";
import EnhancedScene from "../scenes/EnhancedScene";
import Stats from "stats.js";
import _debounce from "lodash/debounce";

let rendererCache = new Map();
let statsCache = new Map();

class ThreeRenderer extends Component {
	constructor(...args) {
		super(...args);

		this.updateScene = this.updateScene.bind(this);
		this.getRenderer = this.getRenderer.bind(this);
		this.refContainer = this.refContainer.bind(this);
		this.resizeRenderer = this.resizeRenderer.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.onWindowResizeDebounce = _debounce(this.onWindowResize, 250);
	}

	componentDidMount() {
		let { scene } = this.props;

		if (scene) scene.unPause();

		this.mounted = true;
		this.updateScene();

		this.resizeRenderer();
		window.addEventListener("resize", this.onWindowResizeDebounce);
	}

	componentWillUnmount() {
		let { scene } = this.props;

		scene.pause();
		this.mounted = false;
		window.removeEventListener("resize", this.onWindowResizeDebounce);
	}

	onWindowResize() {
		let { scene } = this.props;
		let renderer = this.getRenderer();

		renderer.setSize(window.innerWidth, window.innerHeight);

		if (scene && scene.resize) scene.resize(renderer);
	}

	getRenderer() {
		let { rendererId, rendererRef } = this.props;

		if (!rendererCache.has(rendererId)) {
			let renderer = new WebGLRenderer();

			if (rendererRef) rendererRef(renderer);

			rendererCache.set(rendererId, renderer);
		}

		return rendererCache.get(rendererId);
	}
	getStats() {
		let { rendererId } = this.props;

		if (!statsCache.has(rendererId)) {
			let stats = new Stats();

			statsCache.set(rendererId, stats);
		}

		return statsCache.get(rendererId);
	}

	resizeRenderer() {
		let renderer = this.getRenderer();

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	refContainer(el) {
		let { showStats } = this.props;
		let renderer = this.getRenderer();
		let stats = this.getStats();

		this.container = el;

		if (this.container) {
			this.container.appendChild(renderer.domElement);
			if (showStats) this.container.appendChild(stats.dom);
		}
	}

	render() {
		let { rendererId, rendererRef, showStats, scene, ...props } = this.props;

		return <div ref={this.refContainer} {...props} />;
	}

	updateScene() {
		let { scene } = this.props;
		let renderer = this.getRenderer();
		let stats = this.getStats();

		stats.begin();
		if (scene.update) scene.update();
		renderer.render(scene.scene, scene.camera);
		stats.end();

		if (this.mounted) {
			requestAnimationFrame(this.updateScene);
		}
	}
}

ThreeRenderer.propTypes = {
	rendererId: PropTypes.string.isRequired,
	rendererRef: PropTypes.func,
	showStats: PropTypes.bool,
	scene: PropTypes.instanceOf(EnhancedScene).isRequired
};

export default ThreeRenderer;
