struct UBOCamera {
  viewMatrix: mat4x4<f32>,
  projMatrix: mat4x4<f32>,
};

struct UBOModel {
  modelMatrix: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> camera: UBOCamera;
@group(0) @binding(1) var<uniform> model: UBOModel;

@vertex
fn main(@location(0) inPosition: vec3<f32>) -> @builtin(position) vec4<f32> {
  return camera.projMatrix * camera.viewMatrix * model.modelMatrix * vec4<f32>(inPosition, 1.0);
}
