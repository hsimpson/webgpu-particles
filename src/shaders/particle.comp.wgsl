[[block]] struct ComputeParams {
  [[offset(0)]] vHalfBounding : vec4<f32>;
  [[offset(16)]] vForcePos : vec4<f32>;
  [[offset(32)]] fDeltaTime: f32;
  [[offset(36)]] fGravity: f32;
  [[offset(40)]] fForce: f32;
  [[offset(44)]] fForceOn: f32;
};

[[block]] struct ParticlesA {
  [[offset(0)]] pos : [[stride(16)]] array<vec4<f32>>;
};

[[block]] struct ParticlesB {
  [[offset(0)]] vel : [[stride(16)]] array<vec4<f32>>;
};

[[group(0), binding(0)]] var<uniform> params : ComputeParams;
[[group(0), binding(1)]] var<storage_buffer> positions : ParticlesA;
[[group(0), binding(2)]] var<storage_buffer> velocities : ParticlesB;

[[builtin(global_invocation_id)]] var<in> GlobalInvocationID : vec3<u32>;

var EPSILON: vec3<f32> = vec3<f32>(0.0001, 0.0001, 0.0001);

[[stage(compute)]]
fn main() -> void {

  var index: u32 = GlobalInvocationID.x;

  var position: vec4<f32> = positions.pos[index];
  var velocity: vec4<f32> = velocities.vel[index];

  // Update Particle positions
  position = position + (velocity * params.fDeltaTime);

  // Add in fGravity
  velocity.y = velocity.y - (params.fGravity * params.fDeltaTime);

  var v3BB_half: vec3<f32> = params.vHalfBounding.xyz - EPSILON;

  // Face collision detection
  if (position.x < -v3BB_half.x) {  // LEFT
    position.x = -2.0 * v3BB_half.x - position.x;
    velocity.x = velocity.x * -0.9;
  } elseif (position.x > v3BB_half.x) {  // RIGHT
    position.x = 2.0 * v3BB_half.x - position.x;
    velocity.x = velocity.x * -0.9;
  }

  if (position.y < -v3BB_half.y) {  // BOTTOM
    position.y = -2.0 * v3BB_half.y - position.y;
    velocity.y = velocity.y * -0.45;  // if its on the bottom we extra dampen
    velocity.x = velocity.x * 0.9;
  } elseif (position.y > v3BB_half.y) {  // TOP
    position.y = 2.0 * v3BB_half.y - position.y;
    velocity.y = velocity.y * -0.9;
  }

  if (position.z < -v3BB_half.z) {  // FRONT
    position.z = -2.0 * v3BB_half.z - position.z;
    velocity.z = velocity.z * -0.9;
  } elseif (position.z > v3BB_half.z) {  // BACK
    position.z = 2.0 * v3BB_half.z - position.z;
    velocity.z = velocity.z * -0.9;
  }

  var force: u32 = u32(params.fForceOn);
  if(force != 0u) {
    var d: vec4<f32> = params.vForcePos - position;
    var dist: f32 = sqrt(d.x * d.x + d.y * d.y + d.z * d.z);
    if (dist < 1.0) {
      dist = 1.0;  // This line prevents anything that is really close from
                   // getting a huge force
    }

    var f: f32 = params.fForce * params.fDeltaTime;
    velocity = velocity + (d / vec4<f32>(dist, dist, dist, dist) * vec4<f32>(f, f, f, f));
  }

  positions.pos[index] = position;
  velocities.vel[index] = velocity;
  
  return;
}
