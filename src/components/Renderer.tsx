import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import Particlerenderer from '../particlerenderer';
import Gui from './Gui';
import { computeProperties, particleCounter } from './state';
import Stats from './Stats';

interface FrameStats {
  frameTime: number;
  cpuTime: number;
}

const Renderer = (): React.ReactElement => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [frameStats, setFrameStats] = useState<FrameStats>({ frameTime: 0, cpuTime: 0 });
  const [computePropertiesState] = useAtom(computeProperties);
  const [particleCount] = useAtom(particleCounter);

  const particlerenderer = useRef<Particlerenderer | null>(null);
  const particleChangeTimer = useRef<number>(0);

  const onFrameTimeChanged = (frameTime: number, cpuTime: number): void => {
    setFrameStats({ frameTime, cpuTime });
  };

  useEffect(() => {
    if (particlerenderer.current) {
      if (particleChangeTimer.current) {
        window.clearTimeout(particleChangeTimer.current);
      }
      particleChangeTimer.current = window.setTimeout(() => {
        void (async () => {
          console.log(`update particle count: ${particleCount}`);
          await particlerenderer.current?.computePipline.updateParticleCount(particleCount);
        })();
      }, 1000);
    } else if (canvasEl.current) {
      particlerenderer.current = new Particlerenderer(canvasEl.current, particleCount, onFrameTimeChanged);
      void particlerenderer.current.start();
    }
  }, [particleCount]);

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
    <>
      <canvas className="h-full w-full" ref={canvasEl} tabIndex={1} />
      <Stats frameTime={frameStats.frameTime} cpuTime={frameStats.cpuTime} />
      <Gui />
    </>
  );
};

export default Renderer;
