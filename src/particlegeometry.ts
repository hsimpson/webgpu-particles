import WebGPUGeometry from './webgpugeometry';
import { BoxDimensions } from './boxgeometry';
import { vec3 } from 'gl-matrix';

export const NumOffParticles = 500_000;
const numElements = 4;
const positionArray = new Float32Array(NumOffParticles * numElements);

const geometry = new WebGPUGeometry(NumOffParticles);
geometry.name = 'ParticleGeometry';
geometry.addAttribute({
  array: positionArray,
  stride: numElements * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 0, offset: 0, format: 'float3' },
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
});

const randomVector = (): vec3 => {
  return [
    Math.random() * BoxDimensions[0] - BoxDimensions[0] / 2,
    Math.random() * BoxDimensions[1] - BoxDimensions[1] / 2,
    //0,
    Math.random() * BoxDimensions[2] - BoxDimensions[2] / 2,
    //1.0,
  ];
};

// fill with random data
for (let i = 0; i < NumOffParticles * numElements; i += numElements) {
  const randomPos = randomVector();
  positionArray.set(randomPos, i);
}

export { geometry as ParticleGeometry };
