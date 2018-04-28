import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import { WebGLRenderer } from "three";

import Icon from "@fortawesome/react-fontawesome";
import { faGamepad, faBars } from "@fortawesome/fontawesome-free-solid";
import { faEdit } from "@fortawesome/fontawesome-free-regular";
import GithubCorner from "./GithubCorner";
import MenuScene from "../../scenes/Menu";

import "./index.pcss";

let rendererCache;

export default class MenuView extends PureComponent {
	constructor(...args) {
		super(...args);

		this.onWindowResize = this.onWindowResize.bind(this);
	}

	componentWillMount() {
		this.createRenderer();
		this.scene = MenuScene.inst;

		window.addEventListener("resize", this.onWindowResize);

		this.mounted = true;
		requestAnimationFrame(this.updateScene.bind(this));
	}
	componentDidMount() {
		this.canvasContainer.appendChild(this.renderer.domElement);
		this.scene.unPause();
	}
	componentWillUnmount() {
		this.mounted = false;
		this.scene.pause();

		window.addEventListener("resize", this.onWindowResize);
	}

	onWindowResize() {
		this.scene.camera.aspect = window.innerWidth / window.innerHeight;
		this.scene.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
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
							<Icon icon={faGamepad} /> Play
						</Link>
						<Link to="/editor" className="btn btn-lg btn-block btn-info">
							<Icon icon={faEdit} /> Editor
						</Link>
						<Link to="/credits" className="btn btn-lg btn-block btn-default">
							<Icon icon={faBars} /> Credits
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
			rendererCache = new WebGLRenderer();
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
