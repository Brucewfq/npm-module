/**
 @Author: Bruce.wan
 @CreateTime: 2020/11/27 14:15
 @Description:
 */
var webpack = require('webpack');
var path = require('path');

module.exports = {
  mode: "development",
  entry: {
    entry: './src/logger.js'
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: "logger.js",
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader:'babel-loader'
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [],
  devServer: {}
}
