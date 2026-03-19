struct Uniforms {
  canvasSize: vec2<f32>,
}
struct RectInstance {
  rect: vec4<f32>,    // x, y, w, h
  color: vec4<f32>,   // rgba
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> rects: array<RectInstance>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let r = rects[iid];
  let x = r.rect.x; let y = r.rect.y; let w = r.rect.z; let h = r.rect.w;
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
  let clipPos = vec2<f32>(pos.x / u.canvasSize.x * 2.0 - 1.0, 1.0 - pos.y / u.canvasSize.y * 2.0);
  var out: VertexOutput;
  out.position = vec4<f32>(clipPos, 0.0, 1.0);
  out.color = r.color;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return in.color;
}
