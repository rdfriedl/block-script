import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";

const ButtonGroup = styled.div`
	display: flex;

	${({ dir }) => {
		switch (dir) {
			case "vertical":
				return css`
					flex-direction: column;
					> :not(:last-child) {
						margin-bottom: 0.5em;
					}
					> :not(:first-child) {
						margin-top: 0.5em;
					}
				`;
			case "horizontal":
				return css`
					flex-direction: row;
					> :not(:last-child) {
						margin-right: 0.5em;
					}
					> :not(:first-child) {
						margin-left: 0.5em;
					}
				`;
		}
	}};
`;

ButtonGroup.propTypes = {
	dir: PropTypes.oneOf(["vertical", "horizontal"]),
};
ButtonGroup.defaultProps = {
	dir: "horizontal",
};

export default ButtonGroup;
