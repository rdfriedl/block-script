import Loadable from "react-loadable";

export default Loadable({
	loader: () => import("./index.js"),
	loading: () => "Loading...",
});
