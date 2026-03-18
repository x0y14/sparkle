// Candlestick renderer shader
// 1 instance = 1 candle = 18 vertices (3 quads: body, upper wick, lower wick)

struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

struct CandleInstance {
  x: f32,
  open: f32,
  high: f32,
  low: f32,
  close: f32,
  width: f32,
  _pad0: f32,
  _pad1: f32,
  colorUp: vec4<f32>,
  colorDown: vec4<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> candles: array<CandleInstance>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
  let c = candles[iid];
  let isUp = c.close >= c.open;
  let bodyTop = select(c.open, c.close, isUp);
  let bodyBot = select(c.close, c.open, isUp);
  let halfW = c.width * 0.5;
  let wickW = max(c.width * 0.1, 1.0);

  var pos: vec2<f32>;
  let quadIdx = vid / 6u;
  let vertIdx = vid % 6u;

  switch quadIdx {
    // Body quad
    case 0u: {
      switch vertIdx {
        case 0u: { pos = vec2<f32>(c.x - halfW, bodyBot); }
        case 1u: { pos = vec2<f32>(c.x + halfW, bodyBot); }
        case 2u: { pos = vec2<f32>(c.x - halfW, bodyTop); }
        case 3u: { pos = vec2<f32>(c.x + halfW, bodyBot); }
        case 4u: { pos = vec2<f32>(c.x + halfW, bodyTop); }
        case 5u: { pos = vec2<f32>(c.x - halfW, bodyTop); }
        default: { pos = vec2<f32>(c.x, bodyBot); }
      }
    }
    // Upper wick
    case 1u: {
      switch vertIdx {
        case 0u: { pos = vec2<f32>(c.x - wickW, bodyTop); }
        case 1u: { pos = vec2<f32>(c.x + wickW, bodyTop); }
        case 2u: { pos = vec2<f32>(c.x - wickW, c.high); }
        case 3u: { pos = vec2<f32>(c.x + wickW, bodyTop); }
        case 4u: { pos = vec2<f32>(c.x + wickW, c.high); }
        case 5u: { pos = vec2<f32>(c.x - wickW, c.high); }
        default: { pos = vec2<f32>(c.x, bodyTop); }
      }
    }
    // Lower wick
    case 2u: {
      switch vertIdx {
        case 0u: { pos = vec2<f32>(c.x - wickW, c.low); }
        case 1u: { pos = vec2<f32>(c.x + wickW, c.low); }
        case 2u: { pos = vec2<f32>(c.x - wickW, bodyBot); }
        case 3u: { pos = vec2<f32>(c.x + wickW, c.low); }
        case 4u: { pos = vec2<f32>(c.x + wickW, bodyBot); }
        case 5u: { pos = vec2<f32>(c.x - wickW, bodyBot); }
        default: { pos = vec2<f32>(c.x, c.low); }
      }
    }
    default: { pos = vec2<f32>(0.0, 0.0); }
  }

  let clipPos = u.transform * vec4<f32>(pos, 0.0, 1.0);
  let color = select(c.colorDown, c.colorUp, isUp);

  var out: VertexOutput;
  out.position = clipPos;
  out.color = color;
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color.rgb, in.color.a * u.opacity);
}
