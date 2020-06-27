import { atom } from 'recoil';

export const ComputePropertiesAtom = atom({
  key: 'computePropertiesAtom',
  default: {
    gravity: 9.81,
    force: 20,
    refreshRate: 60,
    color: {
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    },
  },
});

export const ParticleCountAtom = atom({
  key: 'particleCountAtom',
  default: 100_000,
});
