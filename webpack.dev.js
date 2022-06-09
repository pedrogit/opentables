const { merge } = require("webpack-merge");
const ESLintPlugin = require("eslint-webpack-plugin");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:3001",
      secure: false,
    },
  },
  devtool: "inline-source-map",
  plugins: [new ESLintPlugin()],
});
