import { commonConfig } from './webpack.common';
import merge from 'webpack-merge';

const prodConfig = merge(commonConfig, {
  mode: 'production',
});

export default prodConfig;
