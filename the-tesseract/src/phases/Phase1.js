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
    // Check if all cells on this face are the same color (any color)
    const firstColor = face[0];
    return face.every((cellColor) => cellColor === firstColor);
  });
};

export const normalizePhase1Faces = (faces) =>
  FACE_KEYS.reduce((acc, faceKey) => {
    acc[faceKey] = faces[faceKey] || Array(4).fill(PHASE1_COLORS[0]);
    return acc;
  }, {});

export const isPhase1FaceAligned = (faceKey, cells = []) => {
  if (!cells || cells.length === 0) return false;
  // Check if all cells are the same color (any color)
  const firstColor = cells[0];
  return cells.every((color) => color === firstColor);
};
