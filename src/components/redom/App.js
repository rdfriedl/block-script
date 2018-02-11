import { jsx } from "../jsx";
import RedomComponent from "../RedomComponent";

import { Router } from "../router";
import MenuView from "./views/Menu/loadable";
import CreditsView from "./views/Credits/loadable";

export default class App extends RedomComponent {
	createElement() {
		return (
			<div id="app">
				<Router
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
