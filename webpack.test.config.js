module.exports = {
  entry: './index.js',
  mode: 'development',
  output: {
    filename: '[name].min.js',
  },
  module: require('./webpack.config.js').module,
};
