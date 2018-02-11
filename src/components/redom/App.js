import { el } from "redom";
import RedomComponent from "../RedomComponent";
import MenuView from "./views/Menu";

export default class App extends RedomComponent {
	createElement() {
		this.el = el("div#app", [new MenuView()]);
	}
}
