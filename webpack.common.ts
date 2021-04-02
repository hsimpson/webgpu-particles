import { Configuration, WebpackPluginInstance } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const commonConfig: Configuration = {
  entry: './src/index.tsx',

  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: ['ts-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    (new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/shaders/*.spv',
          to: '[name][ext]',
        },
        {
          from: './src/shaders/*.wgsl',
          to: '[name][ext]',
        },
      ],
    }) as unknown) as WebpackPluginInstance, // FIXME
  ],
};

export { commonConfig };
