import React, { Fragment } from "react";
import { hot } from "react-hot-loader";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";

import { dark } from "../ui/theme";

import MenuView from "./Menu";
import GameView from "./Game";
import EditorView from "./Editor";
import CreditsView from "./Credits";

const GlobalStyles = createGlobalStyle`
	#app {
		height: 100%;
	}
	html {
		background: rgb(64, 64, 64);
		color: white;
	}
`;

const App = () => (
	<ThemeProvider theme={dark}>
		<GlobalStyles/>
		<Router>
			<Fragment>
				<Route exact path="/" component={MenuView} />
				<Route exact path="/menu" component={MenuView} />
				<Route exact path="/play" component={GameView} />
				<Route exact path="/editor" component={EditorView} />
				<Route exact path="/credits" component={CreditsView} />
			</Fragment>
		</Router>
	</ThemeProvider>
);

export default hot(module)(App);
