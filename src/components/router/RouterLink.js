import { jsx } from "../jsx";
import RedomComponent from "../RedomComponent";
import { router } from "./Router";

class RouterLink extends RedomComponent {
	onmount() {
		this.el.onclick = e => {
			e.preventDefault();
			router.navigate(this.props.href);
		};
	}
	createElement(props, ...children) {
		return <a {...props}>{children}</a>;
	}
}

export default RouterLink;
