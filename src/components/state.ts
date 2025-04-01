import { atomWithReset } from 'jotai/utils';

export const computeProperties = atomWithReset({
  gravity: 9.81,
  force: 20,
  color: {
    r: 255,
    g: 0,
    b: 0,
    a: 0.5,
  },
});

export const particleCounter = atomWithReset(100_000);
