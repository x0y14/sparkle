// Crosshair renderer shader
// Draws horizontal and vertical lines as quads

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

struct CrosshairData {
  posX: f32,    // screen X
  posY: f32,    // screen Y
  plotLeft: f32,
  plotTop: f32,
  plotRight: f32,
  plotBottom: f32,
  _pad0: f32,
  _pad1: f32,
}

@group(0) @binding(1) var<uniform> crosshair: CrosshairData;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
  let hw = 0.5; // half width of crosshair line

  var pos: vec2<f32>;
  // First 6 vertices: vertical line, Next 6: horizontal line
  let lineIdx = vid / 6u;
  let vertIdx = vid % 6u;

  if lineIdx == 0u {
    // Vertical line
    switch vertIdx {
      case 0u: { pos = vec2<f32>(crosshair.posX - hw, crosshair.plotTop); }
      case 1u: { pos = vec2<f32>(crosshair.posX + hw, crosshair.plotTop); }
      case 2u: { pos = vec2<f32>(crosshair.posX - hw, crosshair.plotBottom); }
      case 3u: { pos = vec2<f32>(crosshair.posX + hw, crosshair.plotTop); }
      case 4u: { pos = vec2<f32>(crosshair.posX + hw, crosshair.plotBottom); }
      case 5u: { pos = vec2<f32>(crosshair.posX - hw, crosshair.plotBottom); }
      default: { pos = vec2<f32>(0.0, 0.0); }
    }
  } else {
    // Horizontal line
    switch vertIdx {
      case 0u: { pos = vec2<f32>(crosshair.plotLeft, crosshair.posY - hw); }
      case 1u: { pos = vec2<f32>(crosshair.plotRight, crosshair.posY - hw); }
      case 2u: { pos = vec2<f32>(crosshair.plotLeft, crosshair.posY + hw); }
      case 3u: { pos = vec2<f32>(crosshair.plotRight, crosshair.posY - hw); }
      case 4u: { pos = vec2<f32>(crosshair.plotRight, crosshair.posY + hw); }
      case 5u: { pos = vec2<f32>(crosshair.plotLeft, crosshair.posY + hw); }
      default: { pos = vec2<f32>(0.0, 0.0); }
    }
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
  return vec4<f32>(u.color.rgb, u.color.a * u.opacity * 0.6);
}
