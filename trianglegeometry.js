import WebGPUInterleavedGeometry from "./webgpuinterleavedgeometry.js";
export const vertexArray = new Float32Array([
  1,
  -1,
  0,
  1,
  0,
  0,
  1,
  -1,
  -1,
  0,
  0,
  1,
  0,
  1,
  0,
  1,
  0,
  0,
  0,
  1,
  1
]);
export const positionArray = new Float32Array([
  1,
  -1,
  0,
  -1,
  -1,
  0,
  0,
  1,
  0
]);
export const colorArray = new Float32Array([
  1,
  0,
  0,
  1,
  0,
  1,
  0,
  1,
  0,
  0,
  1,
  1
]);
const indicesArray = new Uint16Array([0, 1, 2]);
const geometry = new WebGPUInterleavedGeometry();
geometry.setVertices(vertexArray, 7 * Float32Array.BYTES_PER_ELEMENT);
geometry.setIndices(indicesArray);
geometry.addAttribute({shaderLocation: 0, offset: 0, format: "float32x3"});
geometry.addAttribute({shaderLocation: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT, format: "float32x4"});
export {geometry as TriangleGeometry};
