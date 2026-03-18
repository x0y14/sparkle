struct Uniforms {
  transform: mat4x4<f32>,
  canvasSize: vec2<f32>,
  lineWidth: f32,
  opacity: f32,
  color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

fn clipToScreen(clip: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    (clip.x + 1.0) * 0.5 * u.canvasSize.x,
    (1.0 - clip.y) * 0.5 * u.canvasSize.y
  );
}

fn screenToClip(screen: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    screen.x / u.canvasSize.x * 2.0 - 1.0,
    1.0 - screen.y / u.canvasSize.y * 2.0
  );
}

fn sdfAlpha(dist: f32) -> f32 {
  return 1.0 - smoothstep(0.0, fwidth(dist), dist);
}
