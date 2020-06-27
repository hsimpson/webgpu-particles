import React from 'react';
import Particlerenderer from '../particlerenderer';
import Stats from './Stats';
import Gui from './Gui';
import { ComputePropertiesAtom, ParticleCountAtom } from './state';
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
  const [computePropertiesState] = useRecoilState(ComputePropertiesAtom);
  const [particleCountState] = useRecoilState(ParticleCountAtom);

  const particlerenderer = React.useRef<Particlerenderer>(undefined);
  const particleChangeTimer = React.useRef<number>(undefined);

  const onFrameTimeChanged = (frameTime: number, cpuTime): void => {
    setFrameStats({
      frameTime,
      cpuTime,
    });
  };

  React.useEffect(() => {
    particlerenderer.current = new Particlerenderer(canvasEl.current, particleCountState, onFrameTimeChanged);
    particlerenderer.current.start();
  }, []);

  React.useEffect(() => {
    if (particlerenderer.current) {
      particlerenderer.current.computePipline.force = computePropertiesState.force;
      particlerenderer.current.computePipline.gravity = computePropertiesState.gravity;
      particlerenderer.current.particleMaterial.color = [
        computePropertiesState.color.r / 255,
        computePropertiesState.color.g / 255,
        computePropertiesState.color.b / 255,
        computePropertiesState.color.a,
      ];
      particlerenderer.current.computeRefreshRate = computePropertiesState.refreshRate;
    }
  }, [computePropertiesState]);

  React.useEffect(() => {
    if (particlerenderer.current) {
      if (particleChangeTimer.current) {
        window.clearTimeout(particleChangeTimer.current);
      }
      particleChangeTimer.current = window.setTimeout(() => {
        (async () => {
          console.log(`update particle count: ${particleCountState}`);
          await particlerenderer.current.computePipline.updateParticleCount(particleCountState);
        })();
      }, 1000);
    }
  }, [particleCountState]);

  return (
    <React.Fragment>
      <canvas className="webgpu_canvas" ref={canvasEl} tabIndex={1}></canvas>
      <Stats frameTime={frameStats.frameTime} cpuTime={frameStats.cpuTime}></Stats>
      <Gui></Gui>
    </React.Fragment>
  );
};

export default Renderer;
