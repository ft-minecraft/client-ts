export const cubeVertexSize = 12;
export const cubePositionOffset = 0;
export const cubeIndexCount = 36;

// prettier-ignore
export const cubeIndexArray = new Uint16Array([
   0,  1,  2,  3,  0,  2,
   4,  5,  6,  7,  4,  6,
   8,  9, 10, 11,  8, 10,
  12, 13, 14, 15, 12, 14,
  16, 17, 18, 18, 19, 16,
  20, 21, 22, 23, 20, 22,
]);

// prettier-ignore
export const cubeVertexArray = new Float32Array([
  // float4 position
  1, -1, 1,
  -1, -1, 1,
  -1, -1, -1,
  1, -1, -1,
  1, 1, 1,
  1, -1, 1,
  1, -1, -1,
  1, 1, -1,
  -1, 1, 1,
  1, 1, 1,
  1, 1, -1,
  -1, 1, -1,
  -1, -1, 1,
  -1, 1, 1,
  -1, 1, -1,
  -1, -1, -1,
  1, 1, 1,
  -1, 1, 1,
  -1, -1, 1,
  1, -1, 1,
  1, -1, -1,
  -1, -1, -1,
  -1, 1, -1,
  1, 1, -1,
]);
