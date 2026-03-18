// Blit shader - fullscreen quad + texture sample

@group(0) @binding(0) var tex: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
  // Fullscreen triangle trick: 3 vertices cover the screen
  var pos: vec2<f32>;
  var uv: vec2<f32>;
  switch vid {
    case 0u: { pos = vec2<f32>(-1.0, -1.0); uv = vec2<f32>(0.0, 1.0); }
    case 1u: { pos = vec2<f32>(3.0, -1.0); uv = vec2<f32>(2.0, 1.0); }
    case 2u: { pos = vec2<f32>(-1.0, 3.0); uv = vec2<f32>(0.0, -1.0); }
    default: { pos = vec2<f32>(0.0, 0.0); uv = vec2<f32>(0.0, 0.0); }
  }

  var out: VertexOutput;
  out.position = vec4<f32>(pos, 0.0, 1.0);
  out.uv = uv;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(tex, samp, in.uv);
}
