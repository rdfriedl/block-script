import React from "react";
import styled from "styled-components";

const ExternalLink = styled.a`
	text-decoration: none;

	${({ theme }) => theme.link};
`;

export default ExternalLink;
