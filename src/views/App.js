import React, { Fragment } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { injectGlobal, ThemeProvider } from "styled-components";

import { dark } from "../ui/theme";

import MenuView from "./Menu/loadable";
import GameView from "./Game/loadable";
import EditorView from "./Editor/loadable";
import CreditsView from "./Credits/loadable";

injectGlobal`
	#app {
		height: 100%;
	}
`;

const App = () => (
	<ThemeProvider theme={dark}>
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

export default App;
