import React, { Fragment } from "react";
import styled from "styled-components";

import { Button, ButtonGroup, LinkButton, ThreeRenderer } from "../../ui";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faGamepad, faBars } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import GithubCorner from "./GithubCorner";
import MenuScene from "../../scenes/Menu";

const CreateBy = styled(Button.withComponent("a"))`
	position: fixed;
	right: 10px;
	bottom: 10px;
`;

const Canvas = styled(ThreeRenderer)`
	position: fixed;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: -100;
`;

const PageLayout = styled.div`
	display: flex;
	flex-direction: column;
	padding: 10vh 35vw;
	justify-content: center;
	align-items: center;
`;

const MenuButtons = styled(ButtonGroup)`
	width: 100%;
	margin: 2em 0;
`;

const rendererRef = renderer => {
	renderer.setClearColor(0x404040, 1);
};

const MenuView = () => (
	<Fragment>
		<GithubCorner />
		{/*<Canvas rendererId="full-screen" showStats rendererRef={rendererRef} scene={MenuScene.inst} />*/}
		<PageLayout>
			<h1 className="text-center title" style={{ marginTop: "10vh" }}>
				Block-Script
			</h1>
			<MenuButtons dir="vertical">
				<LinkButton type="success" to="/play">
					<Icon icon={faGamepad} /> Play
				</LinkButton>
				<LinkButton type="primary" to="/editor">
					<Icon icon={faEdit} /> Editor
				</LinkButton>
				<LinkButton to="/credits">
					<Icon icon={faBars} /> Credits
				</LinkButton>
			</MenuButtons>
		</PageLayout>
		<CreateBy type="primary" size="extra-small" href="http://rdfriedl.com" target="_blank">
			Created by RDFriedl
		</CreateBy>
	</Fragment>
);

export default MenuView;
