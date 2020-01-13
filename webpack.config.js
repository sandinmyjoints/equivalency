const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const plugins = [];
if (process.env.ANALYZE_BUNDLE) plugins.push(new BundleAnalyzerPlugin());

module.exports = {
  entry: './index.js',
  output: {
    filename: 'equivalency.min.js',
    libraryTarget: 'commonjs2',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                { modules: 'commonjs', useBuiltIns: false },
              ],
            ],
            plugins: [['@babel/plugin-transform-runtime']],
          },
        },
      },
    ],
  },
  plugins,
};
