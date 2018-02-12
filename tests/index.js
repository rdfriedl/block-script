import "../src/index";

// import all the tests
let tests = require.context("../src", true, /\.spec/);
tests.keys().forEach(tests);
