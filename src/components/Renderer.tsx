import React from 'react';
import Particlerenderer from '../particlerenderer';
import Stats from './Stats';
import Gui from './Gui';
import ComputeState from './state';
import { useRecoilState } from 'recoil';

interface FrameStats {
  frameTime: number;
  cpuTime: number;
}

const Renderer = (): React.ReactElement => {
  const canvasEl = React.useRef<HTMLCanvasElement>(undefined);
  const [frameStats, setFrameStats] = React.useState<FrameStats>({
    frameTime: 0,
    cpuTime: 0,
  });
  const [guiState] = useRecoilState(ComputeState);

  const particlerenderer = React.useRef<Particlerenderer>(undefined);

  const onFrameTimeChanged = (frameTime: number, cpuTime): void => {
    setFrameStats({
      frameTime,
      cpuTime,
    });
  };

  React.useEffect(() => {
    particlerenderer.current = new Particlerenderer(canvasEl.current, guiState.particleCount, onFrameTimeChanged);
    particlerenderer.current.start();
  }, []);

  React.useEffect(() => {
    if (particlerenderer.current) {
      particlerenderer.current.computePipline.force = guiState.force;
      particlerenderer.current.computePipline.gravity = guiState.gravity;
      particlerenderer.current.particleMaterial.color = [
        guiState.color.r / 255,
        guiState.color.g / 255,
        guiState.color.b / 255,
        guiState.color.a,
      ];

      (async () => {
        await particlerenderer.current.computePipline.updateParticleCount(guiState.particleCount);
      })();
    }
  }, [guiState]);

  return (
    <React.Fragment>
      <canvas className="webgpu_canvas" ref={canvasEl} tabIndex={1}></canvas>
      <Stats frameTime={frameStats.frameTime} cpuTime={frameStats.cpuTime}></Stats>
      <Gui></Gui>
    </React.Fragment>
  );
};

export default Renderer;
