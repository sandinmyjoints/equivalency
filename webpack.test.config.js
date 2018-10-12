module.exports = {
  output: {
    filename: '[name].min.js',
  },
  module: require('./webpack.config.js').module,
};
