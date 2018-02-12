import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import MenuView from "./Menu/loadable";
import CreditsView from "./Credits/loadable";

const App = () => (
	<Router>
		<div>
			<Route exact path="/" component={MenuView} />
			<Route exact path="/menu" component={MenuView} />
			<Route exact path="/credits" component={CreditsView} />
		</div>
	</Router>
);

export default App;
