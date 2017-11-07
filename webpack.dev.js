/* eslint-disable */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  watch: true,
  devServer: {
    port: 8090,
    hot: false,
    inline: false,
    watchContentBase: true
  }
});