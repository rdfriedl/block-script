module.exports = ( api ) => {
  const isTest = api.env( "test" );

  let targets = isTest ? {
    node: "current",
  } : {
    browsers: [
      "last 2 chrome versions",
      "last 2 firefox versions",
      "last 2 safari versions",
    ],
    node: "current",
  };

  return {
    presets: [
      [ "@babel/preset-env", { modules: isTest ? "commonjs" : false, targets } ],
      "@babel/preset-react"
    ],
    plugins: [
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-class-properties",
    ],
  };
};
