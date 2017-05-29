var CompressionPlugin = require("compression-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
var webpack = require("webpack");
var path = require('path');

module.exports = merge(common, {
  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'floweditor.js',
    publicPath: "/",
    sourceMapFilename: '[name].map'
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new UglifyJSPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true,
        drop_console: true
      },
      comments: false
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});