// Scatter renderer shader
// Each instance is a point, expanded to a quad
// Fragment shader uses circle SDF + smoothstep for anti-aliasing

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

struct PointInstance {
  position: vec2<f32>,
  radius: f32,
  _pad: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> pointsData: array<PointInstance>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) radius: f32,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let point = pointsData[iid];
  let clipCenter = u.transform * vec4<f32>(point.position, 0.0, 1.0);

  let screenCenter = vec2<f32>(
    (clipCenter.x + 1.0) * 0.5 * u.canvasSize.x,
    (1.0 - clipCenter.y) * 0.5 * u.canvasSize.y
  );

  let r = point.radius + 1.0; // +1 for AA
  // 4 vertices: quad corners
  var offset: vec2<f32>;
  switch vid % 4u {
    case 0u: { offset = vec2<f32>(-r, -r); }
    case 1u: { offset = vec2<f32>(r, -r); }
    case 2u: { offset = vec2<f32>(-r, r); }
    case 3u: { offset = vec2<f32>(r, r); }
    default: { offset = vec2<f32>(0.0, 0.0); }
  }

  let screenPos = screenCenter + offset;
  let clipPos = vec2<f32>(
    screenPos.x / u.canvasSize.x * 2.0 - 1.0,
    1.0 - screenPos.y / u.canvasSize.y * 2.0
  );

  var out: VertexOutput;
  out.position = vec4<f32>(clipPos, 0.0, 1.0);
  out.uv = offset / r;
  out.radius = point.radius;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let dist = length(in.uv) * (in.radius + 1.0) - in.radius;
  let alpha = 1.0 - smoothstep(0.0, 1.0, dist);
  return vec4<f32>(u.color.rgb, u.color.a * alpha * u.opacity);
}
