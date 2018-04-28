import React, { PureComponent } from "react";
import { WebGLRenderer, PCFSoftShadowMap } from "three";
import Stats from "stats.js";

import GameScene from "../../scenes/Game";

import "./index.pcss";

let rendererCache;

export default class MenuView extends PureComponent {
	constructor(...args) {
		super(...args);

		this.state = {
			hasPointerLock: false
		};

		this.onWindowResize = this.onWindowResize.bind(this);
		this.handleRequestPointerLock = this.handleRequestPointerLock.bind(this);
		this.handleExitPointerLock = this.handleExitPointerLock.bind(this);
		this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
	}

	componentWillMount() {
		this.createRenderer();
		this.scene = GameScene.inst;
		this.stats = new Stats();
	}
	componentDidMount() {
		this.canvasContainer.appendChild(this.stats.dom);
		this.canvasContainer.appendChild(this.renderer.domElement);

		this.mounted = true;
		this.scene.unPause();

		requestAnimationFrame(this.updateScene.bind(this));

		window.addEventListener("resize", this.onWindowResize);
		document.addEventListener("pointerlockchange", this.handlePointerLockChange);
		document.addEventListener("mozpointerlockchange", this.handlePointerLockChange);
		document.addEventListener("webkitpointerlockchange", this.handlePointerLockChange);
	}
	componentWillUnmount() {
		this.mounted = false;
		this.scene.pause();

		window.removeEventListener("resize", this.onWindowResize);
		document.removeEventListener("pointerlockchange", this.handlePointerLockChange);
		document.removeEventListener("mozpointerlockchange", this.handlePointerLockChange);
		document.removeEventListener("webkitpointerlockchange", this.handlePointerLockChange);
	}

	onWindowResize() {
		this.scene.camera.aspect = window.innerWidth / window.innerHeight;
		this.scene.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	handleRequestPointerLock() {
		document.body.requestPointerLock();
	}
	handleExitPointerLock() {
		document.exitPointerLock();
	}
	handlePointerLockChange() {
		this.setState({
			hasPointerLock: !!document.pointerLockElement
		});
	}

	render() {
		return (
			<div className="game-view">
				<div ref={el => (this.canvasContainer = el)} />

				{!this.state.hasPointerLock && (
					<div className="pointer-lock-overlay" onClick={this.handleRequestPointerLock}>
						<h1>Click to enable Pointer Lock</h1>
					</div>
				)}
			</div>
		);
	}

	// scene
	createRenderer() {
		if (!rendererCache) {
			rendererCache = new WebGLRenderer();
		}

		this.renderer = rendererCache;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
	}
	updateScene() {
		this.stats.begin();

		this.scene.update();
		this.renderer.render(this.scene.scene, this.scene.camera);

		this.stats.end();

		if (this.mounted) {
			requestAnimationFrame(this.updateScene.bind(this));
		}
	}
}
