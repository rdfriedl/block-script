import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import _get from "lodash/get";

const Button = styled.button`
	display: inline-block;
	line-height: 1.2em;
	text-align: center;
	background: none;
	border: 2px solid;
	border-radius: 3px;
	text-decoration: none;
	
	:hover {
		text-decoration: none;
	}

	${props =>
		props.block
			? css`
					width: 100%;
			  `
			: null}
	
	// type
	${({ type, theme }) => _get(theme.button.types, type, theme.button.types.default)}
	
	// size
	${({ size, theme }) => _get(theme.button.sizes, size, theme.button.sizes.default)}
`;

Button.propTypes = {
	type: PropTypes.oneOf(["default", "primary", "success"]),
	size: PropTypes.oneOf(["large", "normal", "small", "extra-small"]),
	block: PropTypes.bool
};

Button.defaultProps = {
	type: "default",
	block: false
};

export default Button;
