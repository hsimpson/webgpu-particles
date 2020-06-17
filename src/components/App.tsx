import React from 'react';
import Renderer from './Renderer';
import { RecoilRoot } from 'recoil';

const App = (): React.ReactElement => {
  return (
    <RecoilRoot>
      <Renderer></Renderer>
    </RecoilRoot>
  );
};

export default App;
