import React, { Fragment, PureComponent } from "react";
import styled from "styled-components";

import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { LinkButton } from "../../ui";

const BackButton = styled(LinkButton)`
	position: absolute;
	top: 20px;
	left: 20px;
`;

export default class EditorView extends PureComponent {
	render() {
		return (
			<Fragment>
				<BackButton to="/">
					<Icon icon={faChevronLeft} /> Back
				</BackButton>

				<div className="flex-center-container">
					<div className="card">
						<div className="card-body">New Room</div>
					</div>
					<div className="card">
						<div className="card-body">Load Room</div>
					</div>
				</div>
			</Fragment>
		);
	}
}
