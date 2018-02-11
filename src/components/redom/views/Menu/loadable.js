import Loadable from "../../../RedomLoadable";

export default Loadable({
	load: () => import("./index.js"),
});
