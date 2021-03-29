import { commonConfig } from './webpack.common';
import { merge } from 'webpack-merge';
import webpack from 'webpack';

const devConfig = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  devServer: {
    contentBase: './dist',
    open: true,
  },
} as webpack.Configuration);

export default devConfig;
