import React from "react";
import styled from "styled-components";
import Icon from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { LinkButton } from "../../ui";

const BackButton = styled(LinkButton)`
	position: fixed;
	top: 20px;
	left: 20px;
	z-index: 100;
`;

const CreditsView = () => (
	<div>
		<BackButton to="/">
			<Icon icon={faChevronLeft} />
			<span> Back</span>
		</BackButton>

		<div className="col-md-8 col-md-offset-2 text-center" style={{ marginBottom: "10vh" }}>
			<div className="page-header">
				<h1>Block Script</h1>
			</div>
			<h4>
				Created by:{" "}
				<a href="https://rdfriedl.com/" target="_blank">
					rdfriedl
				</a>
			</h4>
			<div className="page-header">
				<h1>Sound</h1>
			</div>
			<div className="page-header">
				<h1>Textures</h1>
			</div>
			<h4>
				All block textures are from:{" "}
				<a href="http://dokucraft.co.uk/" target="_blank">
					Dokucraft
				</a>
			</h4>
			<div className="page-header text-center">
				<h1>Fonts</h1>
			</div>
			<h4>
				All fonts are from:{" "}
				<a href="http://www.iamcal.com/misc/fonts/" target="_blank">
					iamcal.com
				</a>
			</h4>
		</div>
	</div>
);

export default CreditsView;
