struct Uniforms {
    modelViewProjectionMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var nearestSampler: sampler;
@group(0) @binding(3) var myTexture: texture_2d<f32>;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(1) fragUV: vec2f,
    @location(2) fragNearestRatio: f32,
}

@vertex
fn vs_main(
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) nearestRatio: f32,
) -> VertexOutput {
    var output: VertexOutput;
    output.position = uniforms.modelViewProjectionMatrix * vec4(position, 1.0);
    output.fragUV = uv;
    output.fragNearestRatio = nearestRatio;
    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    return mix(textureSample(myTexture, linearSampler, input.fragUV), textureSample(myTexture, nearestSampler, input.fragUV), input.fragNearestRatio);
}
