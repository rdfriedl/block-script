// import the utils
import '../src/js/util.js';

// import all the tests
var testsContext = require.context('.', true, /\.spec/)
testsContext.keys().forEach(testsContext)
