import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const ExternalLink = styled.a`
	text-decoration: none;

	${({ theme }) => theme.link};
`;

ExternalLink.propTypes = {};
ExternalLink.defaultProps = {};

export default ExternalLink;
