import React from 'react';
import Renderer from './Renderer';
import { RecoilRoot } from 'recoil';
import WebGPURenderer from '../webgpurenderer';
import ErrorMessage from './ErrorMessage';

const App = (): React.ReactElement => {
  return (
    <RecoilRoot>{WebGPURenderer.supportsWebGPU() ? <Renderer></Renderer> : <ErrorMessage></ErrorMessage>}</RecoilRoot>
  );
};

export default App;
