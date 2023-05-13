import { BoxDimensions } from './boxgeometry';
import { vec3 } from 'wgpu-matrix';

export function createBuffer(
  device: GPUDevice,
  arr: Float32Array | Uint16Array,
  usage: GPUBufferUsageFlags
): GPUBuffer {
  const buffer = device.createBuffer({
    mappedAtCreation: true,
    size: arr.byteLength,
    usage,
  });

  const bufferMapped = buffer.getMappedRange();

  const writeArray = arr instanceof Float32Array ? new Float32Array(bufferMapped) : new Uint16Array(bufferMapped);
  writeArray.set(arr);
  buffer.unmap();

  return buffer;
}

export function createRandomParticles(count: number, elements: number): Float32Array {
  const randomVector = () => {
    return vec3.create(
      Math.random() * BoxDimensions[0] - BoxDimensions[0] / 2,
      Math.random() * BoxDimensions[1] - BoxDimensions[1] / 2,
      Math.random() * BoxDimensions[2] - BoxDimensions[2] / 2
    );
  };

  // fill with random data
  const array = new Float32Array(count * elements);
  for (let i = 0; i < count * elements; i += elements) {
    const randomPos = randomVector();
    array.set(randomPos, i);
  }

  return array;
}
