const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  devtool: 'inline-source-map',
  plugins: [
    new ESLintPlugin(),
  ]
});