import { el, svg } from "redom";

const svgElements = [
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animate",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"audio",
	"canvas",
	"circle",
	"clipPath",
	"color-profile",
	"cursor",
	"defs",
	"desc",
	"discard",
	"ellipse",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"filter",
	"font",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignObject",
	"g",
	"glyph",
	"glyphRef",
	"hatch",
	"hatchpath",
	"hkern",
	"iframe",
	"image",
	"line",
	"linearGradient",
	"marker",
	"mask",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"metadata",
	"missing-glyph",
	"mpath",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"radialGradient",
	"rect",
	"script",
	"set",
	"solidcolor",
	"stop",
	"style",
	"svg",
	"switch",
	"symbol",
	"text",
	"textPath",
	"title",
	"tref",
	"tspan",
	"unknown",
	"use",
	"video",
	"view",
	"vkern",
];

export function jsx(node, props = {}, ...children) {
	if (typeof node === "function") {
		return new node(props || {}, ...children);
	} else if (svgElements.includes(node)) {
		return svg(node, props, ...children);
	} else if (node) {
		return el(node, props, ...children);
	} else {
		throw new Error("node cannot be undefined or null");
	}
}
