import { mount, unmount } from "redom";
import RouterLink from "./RouterLink";
import { router } from "./Router";

describe("RouterLink", () => {
	let link;

	beforeEach(() => {
		link = new RouterLink({
			href: "/some/route",
		});

		mount(document.body, link);
	});

	afterEach(() => {
		unmount(document.body, link);
	});

	it("should attach an onclick event listener", () => {
		link.el.onclick.should.be.a("function");
	});

	it("should call router.navigate when clicked", () => {
		sinon.stub(router, "navigate");
		let event = { preventDefault: sinon.stub() };

		link.el.onclick(event);

		event.preventDefault.should.have.been.called;
		router.navigate.should.have.been.calledWith("/some/route");

		router.navigate.restore();
	});
});
