import React, { Fragment } from "react";
import styled from "styled-components";
import Icon from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/fontawesome-free-solid";
import { LinkButton, ExternalLink } from "../../ui";

const BackButton = styled(LinkButton)`
	position: fixed;
	top: 20px;
	left: 20px;
	z-index: 100;
`;

const PageLayout = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
`;

const CenterText = styled.div`
	text-align: center;
	width: 50%;
	margin-bottom: 10vh;
`;

const CreditsView = () => (
	<Fragment>
		<BackButton to="/">
			<Icon icon={faChevronLeft} />
			<span> Back</span>
		</BackButton>

		<PageLayout>
			<CenterText>
				<h1>Block Script</h1>
				<h4>
					Created by:{" "}
					<ExternalLink href="https://rdfriedl.com/" target="_blank">
						rdfriedl
					</ExternalLink>
				</h4>
				<hr />
				<h1>Textures</h1>
				<h4>
					All block textures are from:{" "}
					<ExternalLink href="http://dokucraft.co.uk/" target="_blank">
						Dokucraft
					</ExternalLink>
				</h4>
				<hr />
				<h1>Fonts</h1>
				<h4>
					All fonts are from:{" "}
					<ExternalLink href="http://www.iamcal.com/misc/fonts/" target="_blank">
						iamcal.com
					</ExternalLink>
				</h4>
			</CenterText>
		</PageLayout>
	</Fragment>
);

export default CreditsView;
