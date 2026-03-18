// Pie/Donut renderer shader
// Each instance is a slice, expanded to a quad covering the full pie area
// Fragment shader uses atan2 + distance SDF for slice boundaries

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

struct SliceInstance {
  startAngle: f32,
  endAngle: f32,
  innerRadius: f32,
  outerRadius: f32,
  color: vec4<f32>,
  center: vec2<f32>,
  maxRadius: f32,
  _pad: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> slices: array<SliceInstance>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) localPos: vec2<f32>,
  @location(1) @interpolate(flat) sliceIdx: u32,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let slice = slices[iid];
  let r = slice.maxRadius + 2.0;

  var offset: vec2<f32>;
  switch vid % 6u {
    case 0u: { offset = vec2<f32>(-r, -r); }
    case 1u: { offset = vec2<f32>(r, -r); }
    case 2u: { offset = vec2<f32>(-r, r); }
    case 3u: { offset = vec2<f32>(r, -r); }
    case 4u: { offset = vec2<f32>(r, r); }
    case 5u: { offset = vec2<f32>(-r, r); }
    default: { offset = vec2<f32>(0.0, 0.0); }
  }

  let screenPos = slice.center + offset;
  let clipPos = vec2<f32>(
    screenPos.x / u.canvasSize.x * 2.0 - 1.0,
    1.0 - screenPos.y / u.canvasSize.y * 2.0
  );

  var out: VertexOutput;
  out.position = vec4<f32>(clipPos, 0.0, 1.0);
  out.localPos = offset;
  out.sliceIdx = iid;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let slice = slices[in.sliceIdx];
  let dist = length(in.localPos);
  var angle = atan2(in.localPos.y, in.localPos.x);
  if angle < 0.0 { angle += 6.283185307; }

  let inRadius = step(slice.innerRadius, dist) * step(dist, slice.outerRadius);
  let inAngle = step(slice.startAngle, angle) * step(angle, slice.endAngle);

  let edgeDist = min(dist - slice.innerRadius, slice.outerRadius - dist);
  let alpha = smoothstep(0.0, 1.0, edgeDist) * inRadius * inAngle;

  return vec4<f32>(slice.color.rgb, slice.color.a * alpha * u.opacity);
}
