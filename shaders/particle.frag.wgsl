[[block]] struct Color {
  [[offset(0)]] color : vec4<f32>;
};

[[group(0), binding(2)]] var<uniform> color : Color;

[[location(0)]] var<out> outColor : vec4<f32>;

[[stage(fragment)]]
fn main() -> void {
  outColor = color.color;
  return;
}
