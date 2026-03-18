// Grid renderer shader
// Instanced 1px-width quads for grid lines

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> lines: array<vec4<f32>>; // x0, y0, x1, y1

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let line = lines[iid];
  let p0 = vec2<f32>(line.x, line.y);
  let p1 = vec2<f32>(line.z, line.w);

  var pos: vec2<f32>;
  switch vid % 6u {
    case 0u: { pos = p0 + vec2<f32>(-0.5, 0.0); }
    case 1u: { pos = p0 + vec2<f32>(0.5, 0.0); }
    case 2u: { pos = p1 + vec2<f32>(-0.5, 0.0); }
    case 3u: { pos = p0 + vec2<f32>(0.5, 0.0); }
    case 4u: { pos = p1 + vec2<f32>(0.5, 0.0); }
    case 5u: { pos = p1 + vec2<f32>(-0.5, 0.0); }
    default: { pos = p0; }
  }

  let clipPos = vec2<f32>(
    pos.x / u.canvasSize.x * 2.0 - 1.0,
    1.0 - pos.y / u.canvasSize.y * 2.0
  );

  var out: VertexOutput;
  out.position = vec4<f32>(clipPos, 0.0, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(u.color.rgb, u.color.a * u.opacity);
}
