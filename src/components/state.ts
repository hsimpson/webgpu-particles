import { atom } from 'recoil';

const ComputeState = atom({
  key: 'compute',
  default: {
    particleCount: 100_000,
    gravity: 9.81,
    force: 20,
    color: {
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    },
  },
});

export default ComputeState;
