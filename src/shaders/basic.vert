#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 0, binding = 0) uniform UBOCamera {
  mat4 viewMatrix;
  mat4 projMatrix;
};

layout(set = 1, binding = 0) uniform UBOModel {
  mat4 modelMatrix;
};

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec4 inColor;

layout(location = 0) out vec4 fragColor;

void main() {
  gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(inPosition, 1.0);
  fragColor   = inColor;
}
