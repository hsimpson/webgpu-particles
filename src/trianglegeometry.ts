import WebGPUInterleavedGeometry from './webgpuinterleavedgeometry';
//import WebGPUGeometry from './webgpugeometry';

/*
          C
          /\
         /  \
        /    \
       /      \
    B /________\ A
*/

// prettier-ignore
export const vertexArray = new Float32Array([
  1.0, -1.0, 0.0,   1.0, 0.0, 0.0, 1.0, //A red

  -1.0, -1.0, 0.0,   0.0, 1.0, 0.0, 1.0, //B green

  0.0, 1.0, 0.0,   0.0, 0.0, 1.0, 1.0, // C blue
]);

// prettier-ignore
export const positionArray = new Float32Array([
  1.0, -1.0, 0.0, // A

  -1.0, -1.0, 0.0, // B

  0.0, 1.0, 0.0, // C
]);

// prettier-ignore
export const colorArray = new Float32Array([
  1.0, 0.0, 0.0, 1.0, // red

  0.0, 1.0, 0.0, 1.0, // green

  0.0, 0.0, 1.0, 1.0, // blue
]);

const indicesArray = new Uint16Array([0, 1, 2]);

/**/
const geometry = new WebGPUInterleavedGeometry();
geometry.setVertices(vertexArray, 7 * Float32Array.BYTES_PER_ELEMENT);
geometry.setIndices(indicesArray);
geometry.addAttribute({ shaderLocation: 0, offset: 0, format: 'float32x3' });
geometry.addAttribute({ shaderLocation: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT, format: 'float32x4' });
/**/

/*/
const geometry = new WebGPUGeometry(3);
geometry.setIndices(indicesArray);
geometry.addAttribute({
  array: positionArray,
  stride: 3 * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 0, offset: 0, format: 'float3' },
});
geometry.addAttribute({
  array: colorArray,
  stride: 4 * Float32Array.BYTES_PER_ELEMENT,
  descriptor: { shaderLocation: 1, offset: 0, format: 'float4' },
});
/**/

export { geometry as TriangleGeometry };
