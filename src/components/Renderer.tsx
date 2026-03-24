import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import Particlerenderer from '../particlerenderer';
import Gui from './Gui';
import { computeProperties, particleCounter } from './state';
import Stats from './Stats';

// interface FrameStats {
//   frameTime: number;
//   cpuTime: number;
// }

const Renderer = (): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameStats, setFrameStats] = useState({ frameTime: 0, cpuTime: 0 });
  const [computePropertiesState] = useAtom(computeProperties);
  const [particleCount] = useAtom(particleCounter);

  const particleRendererRef = useRef<Particlerenderer | null>(null);
  const particleChangeTimerRef = useRef(0);

  const onFrameTimeChanged = (frameTime: number, cpuTime: number): void => {
    setFrameStats({ frameTime, cpuTime });
  };

  useEffect(() => {
    if (particleRendererRef.current) {
      if (particleChangeTimerRef.current) {
        window.clearTimeout(particleChangeTimerRef.current);
      }
      particleChangeTimerRef.current = window.setTimeout(() => {
        void (async () => {
          console.log(`update particle count: ${particleCount}`);
          await particleRendererRef.current?.computePipeline.updateParticleCount(particleCount);
        })();
      }, 1000);
    } else if (canvasRef.current) {
      particleRendererRef.current = new Particlerenderer(canvasRef.current, particleCount, onFrameTimeChanged);
      void particleRendererRef.current.start();
    }
  }, [particleCount]);

  useEffect(() => {
    if (particleRendererRef.current) {
      particleRendererRef.current.computePipeline.force = computePropertiesState.force;
      particleRendererRef.current.computePipeline.gravity = computePropertiesState.gravity;
      particleRendererRef.current.particleMaterial.color = new Float32Array([
        computePropertiesState.color.r / 255,
        computePropertiesState.color.g / 255,
        computePropertiesState.color.b / 255,
        computePropertiesState.color.a,
      ]);
    }
  }, [computePropertiesState]);

  return (
    <>
      <canvas className="h-full w-full" ref={canvasRef} tabIndex={1} />
      <Stats frameTime={frameStats.frameTime} cpuTime={frameStats.cpuTime} />
      <Gui />
    </>
  );
};

export default Renderer;
