import "../src/index";

import { preventBootstrap } from "../src/bootstrap";
preventBootstrap();

// import all the tests
let tests = require.context("../src", true, /\.spec/);
tests.keys().forEach(tests);
