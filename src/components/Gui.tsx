import React from 'react';
import Slider from './Slider';
import { ChromePicker, ColorResult } from 'react-color';
import { ComputePropertiesAtom, ParticleCountAtom } from './state';
import { useRecoilState, useResetRecoilState } from 'recoil';

const Gui = (): React.ReactElement => {
  const [computePropertiesState, setComputePropertiesState] = useRecoilState(ComputePropertiesAtom);
  const [particleCountState, setParticleCountState] = useRecoilState(ParticleCountAtom);
  const resetComputeProperties = useResetRecoilState(ComputePropertiesAtom);
  const resetParticleCount = useResetRecoilState(ParticleCountAtom);

  const onColorChange = (colorResult: ColorResult): void => {
    const color = {
      r: colorResult.rgb.r,
      g: colorResult.rgb.g,
      b: colorResult.rgb.b,
      a: colorResult.rgb.a || 1.0,
    };

    setComputePropertiesState({ ...computePropertiesState, color: color });
  };

  const onReset = (): void => {
    resetComputeProperties();
    resetParticleCount();
  };

  return (
    <div className="gui">
      <Slider
        min={1}
        max={10_100_000}
        step={100_000}
        value={particleCountState}
        onValueChange={(particleCount: number) => {
          setParticleCountState(particleCount);
        }}
        labelText={`Particle count: ${particleCountState.toLocaleString()}`}></Slider>
      <Slider
        min={30}
        max={1000}
        step={10}
        value={computePropertiesState.refreshRate}
        onValueChange={(refreshRate: number) => {
          setComputePropertiesState({ ...computePropertiesState, refreshRate });
        }}
        labelText={`Compute refresh rate: ${computePropertiesState.refreshRate} Hz`}></Slider>
      <Slider
        min={-20}
        max={20}
        step={0.01}
        value={computePropertiesState.gravity}
        onValueChange={(gravity: number) => {
          setComputePropertiesState({ ...computePropertiesState, gravity });
        }}
        labelText={`Gravity: ${computePropertiesState.gravity.toFixed(2)}`}></Slider>
      <Slider
        min={-50}
        max={50}
        step={0.01}
        value={computePropertiesState.force}
        onValueChange={(force: number) => {
          setComputePropertiesState({ ...computePropertiesState, force });
        }}
        labelText={`Force: ${computePropertiesState.force.toFixed(2)}`}></Slider>
      <ChromePicker color={computePropertiesState.color} onChange={onColorChange}></ChromePicker>
      <button onClick={onReset}>Reset to default values</button>
    </div>
  );
};

export default Gui;
