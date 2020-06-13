import WebGPUGeometry from './webgpugeometry';
import { BoxDimensions } from './boxgeometry';
import { vec3 } from 'gl-matrix';

const numOffParticles = 10000;

const positionArray = new Float32Array(numOffParticles * 3);
//const velocityArray = new Float32Array(numOffParticles * 3);
//velocityArray.fill(0.0);

const geometry = new WebGPUGeometry(numOffParticles);
geometry.addAttribute({
  array: positionArray,
  stride: 3 * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 0, offset: 0, format: 'float3' },
});
/*
geometry.addAttribute({
  array: colorArray,
  stride: 4 * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 1, offset: 0, format: 'float4' },
});
*/

const randomVector = (): vec3 => {
  return [
    Math.random() * BoxDimensions[0] - BoxDimensions[0] / 2,
    Math.random() * BoxDimensions[1] - BoxDimensions[1] / 2,
    Math.random() * BoxDimensions[2] - BoxDimensions[2] / 2,
  ];
};

// fill with random data
for (let i = 0; i < numOffParticles; i += 3) {
  const randomPos = randomVector();
  positionArray.set(randomPos, i);
}

export { geometry as ParticleGeometry };
