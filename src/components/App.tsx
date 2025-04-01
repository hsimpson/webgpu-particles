import React from 'react';
import WebGPURenderer from '../webgpurenderer';
import ErrorMessage from './ErrorMessage';
import Renderer from './Renderer';

const App = (): React.ReactElement => {
  return WebGPURenderer.supportsWebGPU() ? <Renderer /> : <ErrorMessage />;
};

export default App;
