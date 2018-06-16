import React, { Fragment, PureComponent } from "react";
import styled from "styled-components";
import { WebGLRenderer } from "three";

import { Button, ButtonGroup, LinkButton } from "../../ui";
import Icon from "@fortawesome/react-fontawesome";
import { faGamepad, faBars } from "@fortawesome/fontawesome-free-solid";
import { faEdit } from "@fortawesome/fontawesome-free-regular";
import GithubCorner from "./GithubCorner";
import MenuScene from "../../scenes/Menu";

const CreateBy = styled(Button.withComponent("a"))`
	position: fixed;
	right: 10px;
	bottom: 10px;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: -100;
`;

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
			<Fragment>
				<GithubCorner />
				<Canvas innerRef={el => (this.canvasContainer = el)} />
				<div className="flex-v" style={{ alignItems: "center" }}>
					<h1 className="text-center title" style={{ marginTop: "10vh" }}>
						Block-Script
					</h1>
					<ButtonGroup dir="vertical" className="col-xs-12 col-sm-8 col-md-6 col-lg-4" style={{ margin: "40px 0" }}>
						<LinkButton block type="success" to="/play">
							<Icon icon={faGamepad} /> Play
						</LinkButton>
						<LinkButton block type="primary" to="/editor">
							<Icon icon={faEdit} /> Editor
						</LinkButton>
						<LinkButton block to="/credits">
							<Icon icon={faBars} /> Credits
						</LinkButton>
					</ButtonGroup>
				</div>
				<CreateBy type="primary" size="extra-small" href="http://rdfriedl.co" target="_blank">
					Created by RDFriedl
				</CreateBy>
			</Fragment>
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
