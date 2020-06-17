import WebGPUGeometry from './webgpugeometry';

import { createRandomParticles } from './webgpuhelpers';

export default class ParticleGeometry extends WebGPUGeometry {
  public constructor(particleCount: number, elements: 3 | 4) {
    super(particleCount);
    const positionArray = createRandomParticles(particleCount, elements);
    this.addAttribute({
      array: positionArray,
      stride: elements * Float32Array.BYTES_PER_ELEMENT,
      descriptor: {
        shaderLocation: 0,
        offset: 0,
        format: elements === 3 ? 'float3' : 'float4',
      },
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
    });
  }
}
