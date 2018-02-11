import { jsx } from "../jsx";
import RedomComponent from "../RedomComponent";

import { Router } from "../router";
import MenuView from "./views/Menu";
import CreditsView from "./views/Credits";

export default class App extends RedomComponent {
	createElement() {
		return (
			<div id="app">
				<Router
					id="router"
					routes={{
						"/": MenuView,
						"/menu": MenuView,
						"/credits": CreditsView,
					}}
				/>
			</div>
		);
	}
}
