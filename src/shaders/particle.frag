#version 460

layout(set = 0, binding = 2) uniform Color {
  vec4 color;
};

layout(location = 0) out vec4 outColor;

void main() {
  //outColor = vec4(1.0, 0.0, 0.0, 0.2);
  outColor = color;
}
