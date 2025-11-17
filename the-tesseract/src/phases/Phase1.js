import { PHASE1_COLORS, PHASES } from '../utils/constants';
import { randomFromArray } from '../utils/helpers';

const FACE_KEYS = ['front', 'back', 'left', 'right', 'top', 'bottom'];
const TARGETS = PHASES[0].targetFaces;

export const createPhase1State = () => {
  const faces = FACE_KEYS.reduce((acc, face) => {
    acc[face] = Array(4)
      .fill(null)
      .map(() => randomFromArray(PHASE1_COLORS));
    return acc;
  }, {});

  return {
    faces,
    tutorial: {
      rotated: false,
      colorChanged: false,
    },
  };
};

export const cyclePhase1Color = (currentColor) => {
  const currentIndex = PHASE1_COLORS.indexOf(currentColor);
  if (currentIndex === -1) return PHASE1_COLORS[0];
  return PHASE1_COLORS[(currentIndex + 1) % PHASE1_COLORS.length];
};

export const checkPhase1Win = (state) => {
  return FACE_KEYS.every((faceKey) => {
    const face = state.faces[faceKey];
    return face.every((cellColor) => cellColor === TARGETS[faceKey]);
  });
};

export const normalizePhase1Faces = (faces) =>
  FACE_KEYS.reduce((acc, faceKey) => {
    acc[faceKey] = faces[faceKey] || Array(4).fill(PHASE1_COLORS[0]);
    return acc;
  }, {});

export const isPhase1FaceAligned = (faceKey, cells = []) => {
  const target = TARGETS[faceKey];
  if (!target) return false;
  return cells.every((color) => color === target);
};
