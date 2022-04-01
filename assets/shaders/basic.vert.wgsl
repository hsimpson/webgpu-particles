struct UBOCamera {
  viewMatrix: mat4x4<f32>,
  projMatrix: mat4x4<f32>
};

struct UBOModel {
  modelMatrix: mat4x4<f32>
};

@group(0) @binding(0) var<uniform> camera: UBOCamera;
@group(0) @binding(1) var<uniform> model: UBOModel;

struct VertexInput {
  @location(0) inPosition: vec3<f32>,
  @location(1) inColor: vec4<f32>,
};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
};


@stage(vertex)
fn main(vertexInput: VertexInput) -> VertexOutput {
  var vertexOutput: VertexOutput;
  vertexOutput.position = camera.projMatrix * camera.viewMatrix * model.modelMatrix * vec4<f32>(vertexInput.inPosition, 1.0);
  vertexOutput.fragColor = vertexInput.inColor;
  return vertexOutput;
}
