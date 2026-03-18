// Line renderer shader
// Segment-based instancing: each instance is a line segment between two adjacent points
// Vertex shader reads adjacent points via instance_index, expands to quad in screen space
// Fragment shader applies SDF anti-aliasing

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
  @location(0) dist: f32,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let p0 = points[iid];
  let p1 = points[iid + 1u];

  let clip0 = u.transform * vec4<f32>(p0, 0.0, 1.0);
  let clip1 = u.transform * vec4<f32>(p1, 0.0, 1.0);

  let screen0 = vec2<f32>(
    (clip0.x + 1.0) * 0.5 * u.canvasSize.x,
    (1.0 - clip0.y) * 0.5 * u.canvasSize.y
  );
  let screen1 = vec2<f32>(
    (clip1.x + 1.0) * 0.5 * u.canvasSize.x,
    (1.0 - clip1.y) * 0.5 * u.canvasSize.y
  );

  let dir = normalize(screen1 - screen0);
  let normal = vec2<f32>(-dir.y, dir.x);
  let halfWidth = u.lineWidth * 0.5 + 1.0; // +1 for AA

  // 4 vertices per segment: 0=start-left, 1=start-right, 2=end-left, 3=end-right
  let cornerIdx = vid % 4u;
  var screenPos: vec2<f32>;
  var d: f32;

  switch cornerIdx {
    case 0u: { screenPos = screen0 - normal * halfWidth; d = -halfWidth; }
    case 1u: { screenPos = screen0 + normal * halfWidth; d = halfWidth; }
    case 2u: { screenPos = screen1 - normal * halfWidth; d = -halfWidth; }
    case 3u: { screenPos = screen1 + normal * halfWidth; d = halfWidth; }
    default: { screenPos = screen0; d = 0.0; }
  }

  let clipPos = vec2<f32>(
    screenPos.x / u.canvasSize.x * 2.0 - 1.0,
    1.0 - screenPos.y / u.canvasSize.y * 2.0
  );

  var out: VertexOutput;
  out.position = vec4<f32>(clipPos, 0.0, 1.0);
  out.dist = d;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let halfWidth = u.lineWidth * 0.5;
  let dist = abs(in.dist) - halfWidth;
  let alpha = 1.0 - smoothstep(0.0, 1.0, dist);
  return vec4<f32>(u.color.rgb, u.color.a * alpha * u.opacity);
}
