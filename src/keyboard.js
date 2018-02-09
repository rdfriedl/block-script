import keypress from "keypress";

function simulateKeyEvent(el, char, type) {
	let e = document.createEvent("KeyboardEvent");
	if (e.initKeyboardEvent) {
		e.initKeyboardEvent(
			type || "keypress",
			true,
			true,
			window,
			char,
			char,
			0,
			0,
			0,
			true,
		);
	} else
		e.initKeyEvent(
			type || "keypress",
			true,
			true,
			window,
			char,
			char,
			0,
			0,
			0,
			true,
		);
	Object.defineProperty(e, "keyCode", {
		value: char,
	});
	el.dispatchEvent(e);
}

// add mouse events to keypress
keypress._keycode_dictionary[301] = "LMB";
keypress._keycode_dictionary[302] = "MMB";
keypress._keycode_dictionary[303] = "RMB";
keypress._keycode_dictionary[304] = "MWU";
keypress._keycode_dictionary[305] = "MWD";

export default class Keyboard extends keypress.Listener {
	constructor(...args) {
		super(...args);

		let mapButtons = [1, 2, 3];
		this.element.addEventListener("mousedown", event => {
			simulateKeyEvent(this.element, 300 + mapButtons[event.button], "keydown");
		});
		this.element.addEventListener("mouseup", event => {
			simulateKeyEvent(this.element, 300 + mapButtons[event.button], "keyup");
		});
		this.element.addEventListener("mousewheel", event => {
			var char = 0;
			if (event.deltaY > 0) char = 304;
			if (event.deltaY < 0) char = 305;
			simulateKeyEvent(this.element, char, "keydown");
		});
	}
}
