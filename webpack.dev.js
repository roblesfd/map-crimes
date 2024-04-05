const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    open: true,
    watchFiles: ['src/**/*'],
  },
  optimization: {
    runtimeChunk: 'single',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
});
