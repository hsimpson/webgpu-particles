import { vec3, vec4 } from 'gl-matrix';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';

const red: vec4 = [1, 0, 0, 1];
const green: vec4 = [0, 1, 0, 1];
const blue: vec4 = [0, 0, 1, 1];

const CrossHairDimensions: vec3 = [1, 1, 1];

const halfx = CrossHairDimensions[0] / 2;
const halfy = CrossHairDimensions[1] / 2;
const halfz = CrossHairDimensions[2] / 2;

// prettier-ignore
const vertexArray = new Float32Array([
  // x axis
  -halfx, 0, 0, ...red,
  halfx, 0, 0, ...red,

  // y axis
  0, -halfy, 0, ...green,
  0, halfy, 0, ...green,

  // z axis
  0, 0, -halfz, ...blue,
  0, 0, halfz, ...blue,
]);

// prettier-ignore
const indicesArray = new Uint16Array([
  // x axis
  0, 1,

  // y axis
  2, 3,

  // z axis
  4, 5
]);

const geometry = new WebGPUInterleavedGeometry();
geometry.setVertices(vertexArray, 7 * Float32Array.BYTES_PER_ELEMENT);
geometry.setIndices(indicesArray);
geometry.addAttribute({ shaderLocation: 0, offset: 0, format: 'float3' });
geometry.addAttribute({ shaderLocation: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT, format: 'float4' });

export { geometry as CrossHairGeometry };
