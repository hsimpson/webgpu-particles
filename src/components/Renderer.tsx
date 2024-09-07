import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import Particlerenderer from '../particlerenderer';
import Gui from './Gui';
import { ComputePropertiesAtom, ParticleCountAtom } from './state';
import Stats from './Stats';

interface FrameStats {
  frameTime: number;
  cpuTime: number;
}

const Renderer = (): React.ReactElement => {
  const canvasEl = useRef<HTMLCanvasElement>(undefined);
  const [frameStats, setFrameStats] = useState<FrameStats>({
    frameTime: 0,
    cpuTime: 0,
  });
  const [computePropertiesState] = useRecoilState(ComputePropertiesAtom);
  const [particleCountState] = useRecoilState(ParticleCountAtom);

  const particlerenderer = useRef<Particlerenderer>(undefined);
  const particleChangeTimer = useRef<number>(undefined);

  const onFrameTimeChanged = (frameTime: number, cpuTime): void => {
    setFrameStats({
      frameTime,
      cpuTime,
    });
  };

  useEffect(() => {
    if (particlerenderer.current) {
      if (particleChangeTimer.current) {
        window.clearTimeout(particleChangeTimer.current);
      }
      particleChangeTimer.current = window.setTimeout(() => {
        void (async () => {
          console.log(`update particle count: ${particleCountState}`);
          await particlerenderer.current.computePipline.updateParticleCount(particleCountState);
        })();
      }, 1000);
    } else {
      particlerenderer.current = new Particlerenderer(canvasEl.current, particleCountState, onFrameTimeChanged);
      particlerenderer.current.start();
    }
  }, [particleCountState]);

  useEffect(() => {
    if (particlerenderer.current) {
      particlerenderer.current.computePipline.force = computePropertiesState.force;
      particlerenderer.current.computePipline.gravity = computePropertiesState.gravity;
      particlerenderer.current.particleMaterial.color = new Float32Array([
        computePropertiesState.color.r / 255,
        computePropertiesState.color.g / 255,
        computePropertiesState.color.b / 255,
        computePropertiesState.color.a,
      ]);
    }
  }, [computePropertiesState]);

  return (
    <React.Fragment>
      <canvas className="w-full h-full" ref={canvasEl} tabIndex={1} />
      <Stats frameTime={frameStats.frameTime} cpuTime={frameStats.cpuTime} />
      <Gui />
    </React.Fragment>
  );
};

export default Renderer;
