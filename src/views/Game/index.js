import React, { Fragment, PureComponent } from "react";
import styled from "styled-components";

import GameScene from "../../scenes/Game";
import ThreeRenderer from "../../ui/ThreeRenderer";

const PointerLockOverlay = styled.div`
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
`;

class GameView extends PureComponent {
	constructor(...args) {
		super(...args);

		this.state = {
			hasPointerLock: false
		};

		this.handleRequestPointerLock = this.handleRequestPointerLock.bind(this);
		this.handleExitPointerLock = this.handleExitPointerLock.bind(this);
		this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
	}

	componentDidMount() {
		document.addEventListener("pointerlockchange", this.handlePointerLockChange);
		document.addEventListener("mozpointerlockchange", this.handlePointerLockChange);
		document.addEventListener("webkitpointerlockchange", this.handlePointerLockChange);
	}
	componentWillUnmount() {
		document.removeEventListener("pointerlockchange", this.handlePointerLockChange);
		document.removeEventListener("mozpointerlockchange", this.handlePointerLockChange);
		document.removeEventListener("webkitpointerlockchange", this.handlePointerLockChange);
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
			<Fragment>
				<ThreeRenderer rendererId="full-screen" showStats scene={GameScene.inst} />

				{!this.state.hasPointerLock && (
					<PointerLockOverlay onClick={this.handleRequestPointerLock}>
						<h1>Click to enable Pointer Lock</h1>
					</PointerLockOverlay>
				)}
			</Fragment>
		);
	}
}

export default GameView;
