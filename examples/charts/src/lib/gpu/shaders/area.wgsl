// Area renderer shader
// Triangle strip: vertex_index even/odd alternates between data value and baseline

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> points: array<vec2<f32>>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
  let pointIdx = vid / 2u;
  let isBottom = (vid % 2u) == 1u;
  let point = points[pointIdx];

  var pos: vec2<f32>;
  if isBottom {
    pos = vec2<f32>(point.x, 0.0); // baseline at y=0 (offset-adjusted)
  } else {
    pos = point;
  }

  let clipPos = u.transform * vec4<f32>(pos, 0.0, 1.0);

  var out: VertexOutput;
  out.position = clipPos;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(u.color.rgb, u.color.a * u.opacity * 0.3);
}
