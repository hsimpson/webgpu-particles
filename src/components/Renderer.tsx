import React from 'react';
import Particlerenderer from '../particlerenderer';
import Stats from './Stats';
import Gui from './Gui';
import ComputeState from './state';
import { useRecoilState } from 'recoil';

const Renderer = (): React.ReactElement => {
  const canvasEl = React.useRef<HTMLCanvasElement>(undefined);
  const [frameTimeState, setFrameTimeState] = React.useState<number>(0);
  const [guiState] = useRecoilState(ComputeState);

  const particlerenderer = React.useRef<Particlerenderer>(undefined);

  const onFrameTimeChanged = (frameTime: number): void => {
    setFrameTimeState(frameTime);
  };

  React.useEffect(() => {
    particlerenderer.current = new Particlerenderer(canvasEl.current, guiState.particleCount, onFrameTimeChanged);
    particlerenderer.current.start();
  }, []);

  React.useEffect(() => {
    if (particlerenderer.current) {
      particlerenderer.current.computePipline.force = guiState.force;
      particlerenderer.current.computePipline.gravity = guiState.gravity;

      (async () => {
        await particlerenderer.current.computePipline.updateParticleCount(guiState.particleCount);
      })();
    }
  }, [guiState]);

  return (
    <React.Fragment>
      <canvas className="webgpu_canvas" ref={canvasEl} tabIndex={1}></canvas>
      <Stats frameTime={frameTimeState}></Stats>
      <Gui></Gui>
    </React.Fragment>
  );
};

export default Renderer;
