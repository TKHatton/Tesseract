import { CONSTELLATION_FACE_ORDER } from '../utils/constants';
import { wrapIndex } from '../utils/helpers';

const CONSTELLATION_PATTERNS = {
  front: [
    [-0.2, -0.3],
    [0.1, -0.1],
    [0.3, 0.15],
  ],
  back: [
    [-0.3, 0.2],
    [-0.1, -0.2],
    [0.2, -0.35],
  ],
  left: [
    [-0.25, -0.05],
    [-0.05, 0.25],
    [0.15, -0.35],
  ],
  right: [
    [-0.15, 0.35],
    [0.05, 0.1],
    [0.25, -0.2],
  ],
  top: [
    [-0.3, 0.1],
    [0, -0.1],
    [0.3, 0.2],
  ],
  bottom: [
    [-0.3, -0.2],
    [0.1, 0.05],
    [0.3, 0.25],
  ],
};

const ORBIT_SPEEDS = [0.25, 0.32, 0.36, 0.42, 0.46, 0.5];

export const createPhase3State = () => {
  const faces = CONSTELLATION_FACE_ORDER.map((key, index) => {
    const orientation = Math.floor(Math.random() * 4);
    return {
      key,
      orbitRadius: 3.3 + index * 0.2,
      orbitSpeed: ORBIT_SPEEDS[index],
      orientation,
      target: 0,
      pattern: CONSTELLATION_PATTERNS[key],
      aligned: orientation === 0,
    };
  });

  return {
    faces,
    selected: null,
    connections: 0,
  };
};

export const rotateFaceOrientation = (faces, key, delta) => {
  return faces.map((face) => {
    if (face.key !== key) return face;
    const next = wrapIndex(face.orientation + delta, 4);
    return {
      ...face,
      orientation: next,
      aligned: next === face.target,
    };
  });
};

export const countAlignedFaces = (faces) => faces.filter((face) => face.aligned).length;

export const checkPhase3Win = (state) => {
  return state.faces.every((face) => face.aligned);
};

export const CONSTELLATION_PALETTE = {
  base: '#FFFFFF',
  lightning: '#00BFFF',
};
