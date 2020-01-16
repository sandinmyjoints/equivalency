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
                // 'entry' means we have to explicitly tell core-js what
                // features to polyfill, which is done at the top of index.js.
                // The other setting, 'usage', will automatically detect them,
                // but it produces a larger bundle size (perhaps due to false
                // positives?).
                { modules: 'commonjs', useBuiltIns: 'entry', corejs: 3.6 },
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
