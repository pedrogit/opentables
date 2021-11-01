var path = require("path");
module.exports = {
  entry: "./client/index.js",
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js"
  },
  module: {
  rules: [{ test: /\.js$/, exclude: "/node_modules/", loader: "babel-loader"
  }]
  }
};