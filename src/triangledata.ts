/*
          C
          /\
         /  \
        /    \
       /      \
    B /________\ A
*/

export const VERTEXARRAYINTERLEAVED = new Float32Array([
  1.0,
  -1.0,
  0.0,
  1.0, // A
  1.0,
  0.0,
  0.0,
  1.0, // red

  -1.0,
  -1.0,
  0.0,
  1.0, // B
  0.0,
  1.0,
  0.0,
  1.0, // green

  0.0,
  1.0,
  0.0,
  1.0, // C
  0.0,
  0.0,
  1.0,
  1.0, // blue
]);

export const POSARRAY = new Float32Array([
  1.0,
  -1.0,
  0.0,
  1.0, // A

  -1.0,
  -1.0,
  0.0,
  1.0, // B

  0.0,
  1.0,
  0.0,
  1.0, // C
]);

export const COLORARRAY = new Float32Array([
  1.0,
  0.0,
  0.0,
  1.0, // red

  0.0,
  1.0,
  0.0,
  1.0, // green

  0.0,
  0.0,
  1.0,
  1.0, // blue
]);

export const INDICES = new Uint16Array([0, 1, 2]);
