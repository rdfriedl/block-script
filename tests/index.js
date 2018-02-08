// import the utils
import "../src/util.js";
import "../src/three-changes.js";

// import all the tests
let tests = require.context("../src", true, /\.spec/);
tests.keys().forEach(tests);
