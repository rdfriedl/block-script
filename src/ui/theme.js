import { css, injectGlobal } from "styled-components";

const dark = {
	button: {
		types: {
			default: css`
				border-color: #848484;
				color: white;

				:hover {
					border-color: #aaaaaa;
					color: white;
				}
			`,
			primary: css`
				border-color: #5bc0de;
				color: white;

				&:hover {
					border-color: #31b0d5;
					color: white;
				}
			`,
			success: css`
				border-color: #5cb85c;
				color: white;

				&:hover {
					border-color: #449d44;
					color: white;
				}
			`
		},
		sizes: {
			large: css`
				font-size: 1.3em;
				padding: 1em 2em;
			`,
			default: css`
				font-size: 1.2em;
				padding: 0.5em 1em;
			`,
			small: css`
				font-size: 1em;
				padding: 0.3em 0.8em;
			`,
			"extra-small": css`
				font-size: 0.8em;
				padding: 0.2em 0.5em;
			`
		}
	},
	link: css`
		color: darkseagreen;
	`
};

injectGlobal`
	html {
		background: rgb(64, 64, 64);
		color: white;
	}
`;

export { dark };