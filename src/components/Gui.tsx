import { useAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import React from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import Slider from './Slider';
import { computeProperties, particleCounter } from './state';

const Gui = (): React.ReactElement => {
  const [computePropertiesState, setComputePropertiesState] = useAtom(computeProperties);
  const [particleCountState, setParticleCountState] = useAtom(particleCounter);
  const resetComputeProperties = useResetAtom(computeProperties);
  const resetParticleCount = useResetAtom(particleCounter);

  const onColorChange = (colorResult: ColorResult): void => {
    const color = {
      r: colorResult.rgb.r,
      g: colorResult.rgb.g,
      b: colorResult.rgb.b,
      a: colorResult.rgb.a ?? 1.0,
    };

    setComputePropertiesState({ ...computePropertiesState, color: color });
  };

  const onReset = (): void => {
    resetComputeProperties();
    resetParticleCount();
  };

  return (
    <div className="absolute top-28 left-0 flex w-72 flex-col gap-1 bg-white/10 p-2 text-gray-200">
      <Slider
        min={1_000}
        max={10_000_000}
        step={1_000}
        value={particleCountState}
        onValueChange={(particleCount: number) => {
          setParticleCountState(particleCount);
        }}
        labelText={`Particle count: ${particleCountState.toLocaleString()}`}
      />
      <Slider
        min={-20}
        max={20}
        step={0.01}
        value={computePropertiesState.gravity}
        onValueChange={(gravity: number) => {
          setComputePropertiesState({ ...computePropertiesState, gravity });
        }}
        labelText={`Gravity: ${computePropertiesState.gravity.toFixed(2)}`}
      />
      <Slider
        min={-50}
        max={50}
        step={0.01}
        value={computePropertiesState.force}
        onValueChange={(force: number) => {
          setComputePropertiesState({ ...computePropertiesState, force });
        }}
        labelText={`Force: ${computePropertiesState.force.toFixed(2)}`}
      />
      <ChromePicker color={computePropertiesState.color} onChange={onColorChange} />
      <button className="my-2 rounded bg-red-500 px-4 py-1 text-white hover:bg-red-700" onClick={onReset}>
        Reset to default values
      </button>
      <div className="descriptionItem">
        <span>Space: activate force</span>
      </div>
      <div className="descriptionItem">
        <span>W: Move force -Z</span>
      </div>
      <div className="descriptionItem">
        <span>A: Move force -X</span>
      </div>
      <div className="descriptionItem">
        <span>S: Move force +Z</span>
      </div>
      <div className="descriptionItem">
        <span>D: Move force +X</span>
      </div>
      <div className="descriptionItem">
        <span>Page up: Move force +Y</span>
      </div>
      <div className="descriptionItem">
        <span>Page down: Move force -Y</span>
      </div>
    </div>
  );
};

export default Gui;
