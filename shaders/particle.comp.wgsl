[[block]] struct ComputeParams {
  vHalfBounding : vec4<f32>;
  vForcePos : vec4<f32>;
  fDeltaTime: f32;
  fGravity: f32;
  fForce: f32;
  fForceOn: f32;
};

[[block]] struct ParticlesA {
  pos : [[stride(16)]] array<vec4<f32>>;
};

[[block]] struct ParticlesB {
  vel : [[stride(16)]] array<vec4<f32>>;
};

[[group(0), binding(0)]] var<uniform> params : ComputeParams;
[[group(0), binding(1)]] var<storage, read_write> positions : ParticlesA;
[[group(0), binding(2)]] var<storage, read_write> velocities : ParticlesB;

let EPSILON: vec3<f32> = vec3<f32>(0.0001, 0.0001, 0.0001);

[[stage(compute), workgroup_size(64)]]
fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {

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
    if(params.fGravity > 0.0) {
      velocity.y = velocity.y * -0.45;  // if its on the bottom we extra dampen
    }
    velocity.x = velocity.x * 0.9;
  } elseif (position.y > v3BB_half.y) {  // TOP
    position.y = 2.0 * v3BB_half.y - position.y;
    if(params.fGravity < 0.0) {
      velocity.y = velocity.y * 0.45;  // if its on the top we extra dampen
    }
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
