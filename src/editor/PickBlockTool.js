import { Group, Raycaster, MOUSE, Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Vector2 } from "three";

export default class PickBlockTool extends Group {
	constructor(camera, map, renderer) {
		super();
		this.enabled = false;
		this.camera = camera;
		this.map = map;
		this.renderer = renderer;

		this.raycaster = new Raycaster();
		this.useMousePosition = true;
		this.mousePosition = new Vector2();

		this.target = undefined;
		this.pickedBlock = undefined;

		this.onPick = undefined;

		this.mouseButtons = {
			PICK: MOUSE.LEFT
		};

		// bind events
		renderer.domElement.addEventListener("mousemove", event => {
			this.mousePosition.set(
				(event.offsetX / renderer.domElement.clientWidth) * 2 - 1,
				-(event.offsetY / renderer.domElement.clientHeight) * 2 + 1
			);

			this.update();
		});

		// pick block
		renderer.domElement.addEventListener("mouseup", event => {
			this.mousePosition.set(
				(event.offsetX / renderer.domElement.clientWidth) * 2 - 1,
				-(event.offsetY / renderer.domElement.clientHeight) * 2 + 1
			);

			this.update();

			// pick
			if (this.enabled && this.target && event.button == this.mouseButtons.PICK) {
				this.pickedBlock = this.map.getBlock(this.target.target);
				if (this.onPick && this.pickedBlock) this.onPick(this.pickedBlock);
			}
		});

		// create objects
		this.selectionFace = new Mesh(
			new PlaneBufferGeometry(1, 1),
			new MeshBasicMaterial({
				color: 0x5555ff,
				transparent: true,
				opacity: 0.5,
				depthTest: false
			})
		);
		this.selectionFace.up = new Vector3(0, 0, 1);
		this.selectionFace.scale.copy(this.map.blockSize);
		this.add(this.selectionFace);

		// update
		this.updateObjects();
	}

	getTarget(mouse) {
		let info = {};
		this.raycaster.setFromCamera(mouse, this.camera);

		let intersects = this.raycaster.intersectObject(this.map, true);

		if (intersects.length) {
			for (let i = 0; i < intersects.length; i++) {
				let intersection = intersects[i];

				if (!this.testCollision || this.testCollision(intersects.object)) {
					info.point = intersection.point.clone();
					info.normal = intersection.face.normal.clone();
					// make the normal 1/4 the size of the blocks
					let n = intersection.face.normal
						.clone()
						.multiply(this.map.blockSize)
						.divideScalar(4);
					// get target
					info.target = intersection.point
						.clone()
						.sub(n)
						.divide(this.map.blockSize)
						.floor();

					break;
				}
			}
		}

		return info;
	}

	updateObjects() {
		if (this.enabled && this.target) {
			this.selectionFace.visible = true;
			this.selectionFace.position.copy(
				this.target.target
					.clone()
					.add(new Vector3(0.5, 0.5, 0.5))
					.multiply(this.map.blockSize)
			);
			this.selectionFace.position.add(
				this.map.blockSize
					.clone()
					.divideScalar(2)
					.multiply(this.target.normal)
					.multiplyScalar(1.05)
			);
			this.selectionFace.quaternion.setFromUnitVectors(this.selectionFace.up, this.target.normal);
		} else this.selectionFace.visible = false;

		return this;
	}

	update() {
		if (this.enabled) {
			let target = this.getTarget(this.useMousePosition ? this.mousePosition : new Vector2());
			if (target.target) this.target = target;
			else this.target = undefined;
		}

		this.updateObjects();
	}
}
