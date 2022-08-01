struct UBOParticle {
  color: vec4<f32>,
};

@group(0) @binding(2) var<uniform> particles: UBOParticle;

@fragment
fn main() -> @location(0) vec4<f32> {
  return particles.color;
}
