// Bar renderer shader
// Each instance receives a rect (x, y, w, h) and color
// Expands to 6 vertices (2 triangles) per bar

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

struct BarInstance {
  rect: vec4<f32>,  // x, y, width, height in data space
  color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> bars: array<BarInstance>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let bar = bars[iid];
  let x = bar.rect.x;
  let y = bar.rect.y;
  let w = bar.rect.z;
  let h = bar.rect.w;

  // 6 vertices: two triangles forming a quad
  var pos: vec2<f32>;
  switch vid % 6u {
    case 0u: { pos = vec2<f32>(x, y); }
    case 1u: { pos = vec2<f32>(x + w, y); }
    case 2u: { pos = vec2<f32>(x, y + h); }
    case 3u: { pos = vec2<f32>(x + w, y); }
    case 4u: { pos = vec2<f32>(x + w, y + h); }
    case 5u: { pos = vec2<f32>(x, y + h); }
    default: { pos = vec2<f32>(x, y); }
  }

  let clipPos = u.transform * vec4<f32>(pos, 0.0, 1.0);

  var out: VertexOutput;
  out.position = clipPos;
  out.color = bar.color;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color.rgb, in.color.a * u.opacity);
}
