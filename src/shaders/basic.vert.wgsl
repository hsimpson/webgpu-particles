[[block]] struct UBOCamera {
  [[offset(0)]] viewMatrix : mat4x4<f32>;
  [[offset(64)]] projMatrix : mat4x4<f32>;
};

[[block]] struct UBOModel {
  [[offset(0)]] modelMatrix : mat4x4<f32>;
};

[[group(0), binding(0)]] var<uniform> camera : UBOCamera;
[[group(0), binding(1)]] var<uniform> model : UBOModel;

[[location(0)]] var<in> inPosition : vec3<f32>;
[[location(1)]] var<in> inColor : vec4<f32>;

[[builtin(position)]] var<out> Position : vec4<f32>;
[[location(0)]] var<out> fragColor : vec4<f32>;

[[stage(vertex)]]
fn main() -> void {
  Position = camera.projMatrix * camera.viewMatrix * model.modelMatrix * vec4<f32>(inPosition, 1.0);
  fragColor = inColor;
  return;
}
