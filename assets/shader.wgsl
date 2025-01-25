struct Uniforms {
  modelViewProjectionMatrix: mat4x4f,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) Position: vec4f,
  @location(0) fragPosition: vec4f,
}

@vertex
fn vs_main(
  @location(0) position: vec3f,
) -> VertexOutput {
  var output: VertexOutput;
  output.Position = uniforms.modelViewProjectionMatrix * vec4(position, 1.0);
  output.fragPosition = 0.5 * (vec4(position, 1.0) + vec4(1.0, 1.0, 1.0, 1.0));
  return output;
}

@fragment
fn fs_main(
  @location(0) fragPosition: vec4f
) -> @location(0) vec4f {
  return fragPosition;
}
