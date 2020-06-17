import React from 'react';
import Slider from './Slider';
import ComputeState from './state';
import { useRecoilState } from 'recoil';

const Gui = (): React.ReactElement => {
  const [guiState, setGuiState] = useRecoilState(ComputeState);

  return (
    <div className="gui">
      <Slider
        min={1}
        max={5_000_000}
        step={1000}
        value={guiState.particleCount}
        onValueChange={(particleCount: number) => {
          setGuiState({ ...guiState, particleCount });
        }}
        labelText={`Particle count: ${guiState.particleCount.toLocaleString()}`}></Slider>
      <Slider
        min={-20}
        max={20}
        step={0.01}
        value={guiState.gravity}
        onValueChange={(gravity: number) => {
          setGuiState({ ...guiState, gravity });
        }}
        labelText={`Gravity: ${guiState.gravity.toFixed(2)}`}></Slider>
      <Slider
        min={-50}
        max={50}
        step={0.01}
        value={guiState.force}
        onValueChange={(force: number) => {
          setGuiState({ ...guiState, force });
        }}
        labelText={`Force: ${guiState.force.toFixed(2)}`}></Slider>
    </div>
  );
};

export default Gui;
