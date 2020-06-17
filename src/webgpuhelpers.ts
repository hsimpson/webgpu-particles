import { BoxDimensions } from './boxgeometry';
import { vec3 } from 'gl-matrix';

export function createBuffer(
  device: GPUDevice,
  arr: Float32Array | Uint16Array,
  usage: GPUBufferUsageFlags
): GPUBuffer {
  const [buffer, bufferMapped] = device.createBufferMapped({
    size: arr.byteLength,
    usage,
  });
  const writeArray = arr instanceof Float32Array ? new Float32Array(bufferMapped) : new Uint16Array(bufferMapped);
  writeArray.set(arr);
  buffer.unmap();

  return buffer;
}

export function createRandomParticles(count: number, elements: number): Float32Array {
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
  const array = new Float32Array(count * elements);
  for (let i = 0; i < count * elements; i += elements) {
    const randomPos = randomVector();
    array.set(randomPos, i);
  }

  return array;
}
