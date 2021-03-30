import { vec3, vec4 } from 'gl-matrix';
import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';

/* the cube:

     v5-----------v6
    / |          / |
   /  |         /  |
  v2----------v1   |
  |   |        |   |
  |   |        |   |
  |  v4--------|--v7
  | /          |  /
  |/           | /
  v3-----------v0

*/

const BoxDimensions: vec3 = [8, 5, 5];
const color: vec4 = [1, 1, 1, 1];

const halfx = BoxDimensions[0] / 2;
const halfy = BoxDimensions[1] / 2;
const halfz = BoxDimensions[2] / 2;

// prettier-ignore
const vertexArray = new Float32Array([
  // front vertices:
  halfx, -halfy, -halfz, ...color,
  halfx, halfy, -halfz, ...color,
  -halfx, halfy, -halfz, ...color,
  -halfx, -halfy, -halfz, ...color,

  // back vertices:
  -halfx, -halfy, halfz, ...color,
  -halfx, halfy, halfz, ...color,
  halfx, halfy, halfz, ...color,
  halfx, -halfy, halfz, ...color,
]);

// prettier-ignore
const indicesArray = new Uint16Array([
  // front
  0, 1, 1, 2, 2, 3, 3, 0,

  // left
  3, 2, 2, 5, 5, 4, 4, 3,

  // right
  7, 6, 6, 1, 1, 0, 0, 7,

  // back
  4, 5, 5, 6, 6, 7, 7, 4
]);

const geometry = new WebGPUInterleavedGeometry();
geometry.setVertices(vertexArray, 7 * Float32Array.BYTES_PER_ELEMENT);
geometry.setIndices(indicesArray);
geometry.addAttribute({ shaderLocation: 0, offset: 0, format: 'float32x3' });
geometry.addAttribute({ shaderLocation: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT, format: 'float32x4' });

export { geometry as BoxGeometry, BoxDimensions };
