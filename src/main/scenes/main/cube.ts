export const cubeVertexSize = 24;
export const cubePositionOffset = 0;
export const cubeUvOffset = 12;
export const cubeNearestRatioOffset = 20;
export const cubeIndexCount = 36;

// prettier-ignore
export const cubeIndexArray = new Uint16Array([
   0,  2,  1,  3,  2,  0,
   4,  6,  5,  7,  6,  4,
   8, 10,  9, 11, 10,  8,
  12, 14, 13, 15, 14, 12,
  16, 18, 17, 19, 18, 16,
  20, 22, 21, 23, 22, 20,
]);

// prettier-ignore
export const cubeVertexArray = new Float32Array([
  // float4 position, float2 uv, float nearestRatio

  // +x
  +1, -1, +1, 0, 0, 1,
  +1, +1, +1, 1, 0, 1,
  +1, +1, -1, 1, 1, 1,
  +1, -1, -1, 0, 1, 1,

  // +y
  +1, +1, +1, 0, 0, 1,
  -1, +1, +1, 1, 0, 1,
  -1, +1, -1, 1, 1, 1,
  +1, +1, -1, 0, 1, 1,

  // +z
  -1, +1, +1, 0, 0, 1,
  +1, +1, +1, 1, 0, 1,
  +1, -1, +1, 1, 1, 1,
  -1, -1, +1, 0, 1, 1,

  // -x
  -1, +1, +1, 0, 0, 0,
  -1, -1, +1, 1, 0, 0,
  -1, -1, -1, 1, 1, 0,
  -1, +1, -1, 0, 1, 0,

  // -y,
  -1, -1, +1, 0, 0, 0,
  +1, -1, +1, 1, 0, 0,
  +1, -1, -1, 1, 1, 0,
  -1, -1, -1, 0, 1, 0,

  // -z
  +1, +1, -1, 0, 0, 0,
  -1, +1, -1, 1, 0, 0,
  -1, -1, -1, 1, 1, 0,
  +1, -1, -1, 0, 1, 0,
]);
