import { jsx } from "../../../jsx";
import RedomComponent from "../../../RedomComponent";

import * as THREE from "three";
import "../../../../three-changes.js";
import VoxelMap from "../../../../voxel/VoxelMap";
import * as blocks from "../../../../blocks/defaultBlocks.js";
import * as ChunkUtils from "../../../../ChunkUtils.js";
import CollisionWorld from "../../../../collisions/CollisionWorld";
import CollisionEntityBox from "../../../../collisions/types/box";
import CollisionEntityVoxelMap from "../../../../collisions/types/voxelMap";

import GithubCorner from "./GithubCorner";
import { RouterLink } from "../../../router";

import "./index.pcss";
export default class MenuView extends RedomComponent {
	createElement() {
		this.createRenderer();
		this.createScene();
		this.createCollisions();

		requestAnimationFrame(this.updateScene.bind(this));

		return (
			<div className="menu-view">
				{this.renderer.domElement}
				<GithubCorner />
				<div className="flex-v" style="align-items: center">
					<h1 className="text-center title" style="margin-top: 10vh">
						Block-Script
					</h1>
					<div className="col-xs-12 col-sm-8 col-md-6 col-lg-4" style="margin: 40px 0;">
						<RouterLink href="/play" className="btn btn-lg btn-block btn-success">
							<i className="fa fa-gamepad" /> Play
						</RouterLink>
						<RouterLink href="/editor" className="btn btn-lg btn-block btn-info">
							<i className="fa fa-cubes" /> Editor
						</RouterLink>
						<RouterLink href="/help" className="btn btn-lg btn-block btn-default">
							<i className="fa fa-question" /> Help
						</RouterLink>
						<RouterLink href="/settings" className="btn btn-lg btn-block btn-default">
							<i className="fa fa-cogs" /> Settings
						</RouterLink>
						<RouterLink href="/credits" className="btn btn-lg btn-block btn-default">
							<i className="fa fa-bars" /> Credits
						</RouterLink>
					</div>
				</div>
				<a className="created-by btn btn-info btn-xs" href="http://rdfriedl.github.io" target="_blank">
					Created by RDFriedl
				</a>
			</div>
		);
	}
	createRenderer() {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor(0x2b3e50, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	createScene() {
		this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
		this.camera.position.z = 600;
		this.camera.position.y = 100;

		// resize
		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		this.scene = new THREE.Scene();
		this.clock = new THREE.Clock();

		//create voxel map
		this.map = new VoxelMap();
		this.map.blockManager.registerBlock(blocks);
		this.scene.add(this.map);

		// build the map
		const blockList = Object.keys(blocks).map(key => blocks[key].UID); //.filter(UID => !UID.includes('glass'));
		ChunkUtils.drawCube(
			this.map,
			new THREE.Vector3(-10, -1, -10),
			new THREE.Vector3(10, 0, 10),
			function() {
				return blockList[Math.floor(Math.random() * blockList.length)];
			},
			"solid",
		);
		ChunkUtils.drawCube(
			this.map,
			new THREE.Vector3(-10, 0, -10),
			new THREE.Vector3(10, 1, 10),
			function() {
				return blockList[Math.floor(Math.random() * blockList.length)];
			},
			"frame",
		);
		this.map.updateChunks();

		// create box mesh
		this.boxMesh = new THREE.Mesh(
			new THREE.BoxGeometry(50, 50, 50),
			new THREE.MeshLambertMaterial({ color: 0xff0000 }),
		);
		this.scene.add(this.boxMesh);

		// add lights
		let light = new THREE.DirectionalLight(0xffffff);
		light.intensity = 0.5;
		light.position.set(1, 1, 1);
		this.scene.add(light);

		let ambient = new THREE.AmbientLight(0x666666);
		ambient.intensity = 0.5;
		this.scene.add(ambient);

		//if we are debugging add this to global scope
		if (process.env.NODE_ENV === "development") window.menuScene = this.scene;
	}
	createCollisions() {
		this.collisionWorld = new CollisionWorld();
		this.collisionMap = new CollisionEntityVoxelMap(this.map);

		this.box = new CollisionEntityBox(new THREE.Vector3(50, 50, 50));
		this.box.onCollision = (entity, normal) => {
			if (normal.y !== 0) {
				this.box.velocity.y = 0;
			}
		};

		this.collisionWorld.addEntity(this.collisionMap);
		this.collisionWorld.addEntity(this.box);
	}
	updateScene() {
		let dtime = Math.min(this.clock.getDelta(), 0.5); //clamp delta time

		this.animateScene(dtime);
		this.renderScene(dtime);

		requestAnimationFrame(this.updateScene.bind(this));
	}
	animateScene(dtime) {
		this.collisionWorld.step(dtime);

		this.boxMesh.position.copy(this.box.position);

		// jump box
		this.jumpTime = this.jumpTime || 0;
		this.jumpTime += dtime;
		if (this.jumpTime > 1 / 0.5) {
			if (this.box.velocity.y > -10) {
				this.box.velocity.y = +400;
			}
			this.jumpTime = 0;
		}

		if (this.box.position.y < -100) {
			this.resetScene();
		}
	}
	renderScene() {
		this.renderer.render(this.scene, this.camera);
	}
	resetScene() {
		this.box.position.set(0, 100, 0);
		this.box.velocity.set((Math.random() * 2 - 1) * 100, 50, (Math.random() * 2 - 1) * 100);
	}
}
