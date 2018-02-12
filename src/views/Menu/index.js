import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

import GithubCorner from "./GithubCorner";
import MenuScene from "../../scenes/Menu";

import "./index.pcss";

let rendererCache;

export default class MenuView extends PureComponent {
	componentWillMount() {
		this.createRenderer();
		this.scene = MenuScene.inst;

		// resize
		window.addEventListener(
			"resize",
			(this.resizeListener = () => {
				this.scene.camera.aspect = window.innerWidth / window.innerHeight;
				this.scene.camera.updateProjectionMatrix();

				this.renderer.setSize(window.innerWidth, window.innerHeight);
			}),
		);

		this.mounted = true;
		requestAnimationFrame(this.updateScene.bind(this));
	}
	componentDidMount() {
		this.canvasContainer.appendChild(this.renderer.domElement);
	}
	componentWillUnmount() {
		this.mounted = false;

		window.addEventListener("resize", this.resizeListener);
	}
	render() {
		return (
			<div className="menu-view">
				<GithubCorner />
				<div ref={el => (this.canvasContainer = el)} />
				<div className="flex-v" style={{ alignItems: "center" }}>
					<h1 className="text-center title" style={{ marginTop: "10vh" }}>
						Block-Script
					</h1>
					<div className="col-xs-12 col-sm-8 col-md-6 col-lg-4" style={{ margin: "40px 0" }}>
						<Link to="/play" className="btn btn-lg btn-block btn-success">
							<i className="fa fa-gamepad" /> Play
						</Link>
						<Link to="/editor" className="btn btn-lg btn-block btn-info">
							<i className="fa fa-cubes" /> Editor
						</Link>
						<Link to="/credits" className="btn btn-lg btn-block btn-default">
							<i className="fa fa-bars" /> Credits
						</Link>
					</div>
				</div>
				<a className="created-by btn btn-info btn-xs" href="http://rdfriedl.github.io" target="_blank">
					Created by RDFriedl
				</a>
			</div>
		);
	}

	// scene
	createRenderer() {
		if (!rendererCache) {
			rendererCache = new THREE.WebGLRenderer();
		}

		this.renderer = rendererCache;
		this.renderer.setClearColor(0x2b3e50, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	updateScene() {
		this.scene.update();
		this.renderer.render(this.scene.scene, this.scene.camera);

		if (this.mounted) {
			requestAnimationFrame(this.updateScene.bind(this));
		}
	}
}
