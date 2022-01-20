struct Color {
  color : vec4<f32>;
};

[[group(0), binding(2)]] var<uniform> unforms : Color;

[[stage(fragment)]]
fn main() -> [[location(0)]] vec4<f32> {
  return unforms.color;
}
