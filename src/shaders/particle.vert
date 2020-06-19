#version 450

layout(set = 0, binding = 0) uniform UBOCamera {
  mat4 viewMatrix;
  mat4 projMatrix;
};

layout(set = 0, binding = 1) uniform UBOModel {
  mat4 modelMatrix;
};

layout(location = 0) in vec3 inPosition;

void main() {
  gl_Position = projMatrix * viewMatrix * vec4(inPosition, 1.0);
}
