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
            presets: [['@babel/preset-env', { useBuiltIns: 'usage' }]],
            plugins: ['transform-es2015-modules-commonjs'],
          },
        },
      },
    ],
  },
};
