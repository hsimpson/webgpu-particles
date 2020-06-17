import { atom } from 'recoil';

const ComputeState = atom({
  key: 'compute',
  default: {
    particleCount: 100_000,
    gravity: 9.81,
    force: 20,
  },
});

export default ComputeState;
