import {
  SYMBOLS,
  ADJACENCY_RULES,
  PHASE2_AMBIENT_TEXT,
  CONNECTION_REACTIONS,
} from '../utils/constants';
import { createRange, randomFromArray } from '../utils/helpers';

const FACE_KEYS = ['front', 'back', 'left', 'right', 'top', 'bottom'];
const SYMBOL_IDS = SYMBOLS.map((symbol) => symbol.id);

const PHASE2_TARGETS = {
  front: [
    'tree',
    'water',
    'tree',
    'water',
    'tree',
    'water',
    'tree',
    'water',
    'tree',
  ],
  right: [
    'fire',
    'wind',
    'fire',
    'wind',
    'fire',
    'wind',
    'fire',
    'wind',
    'fire',
  ],
  left: [
    'star',
    'eye',
    'star',
    'eye',
    'star',
    'eye',
    'star',
    'eye',
    'star',
  ],
  back: [
    'spiral',
    'infinity',
    'spiral',
    'infinity',
    'spiral',
    'infinity',
    'spiral',
    'infinity',
    'spiral',
  ],
  top: ['crystal', 'tree', 'water', 'crystal', 'eye', 'star', 'crystal', 'fire', 'wind'],
  bottom: ['star', 'infinity', 'spiral', 'water', 'crystal', 'tree', 'fire', 'wind', 'eye'],
};

const shuffleFace = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const rand = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[rand]] = [copy[rand], copy[i]];
  }
  return copy;
};

export const cyclePhase2Symbol = (currentId) => {
  const currentIndex = SYMBOL_IDS.indexOf(currentId);
  if (currentIndex === -1) return SYMBOL_IDS[0];
  return SYMBOL_IDS[(currentIndex + 1) % SYMBOL_IDS.length];
};

export const createPhase2State = () => {
  const faces = FACE_KEYS.reduce((acc, faceKey) => {
    const template = PHASE2_TARGETS[faceKey];
    const randomized = shuffleFace(template);
    acc[faceKey] = randomized;
    return acc;
  }, {});

  return {
    faces,
    adjacency: [],
    lastReaction: null,
    ambientIndex: 0,
    ambientTimer: 0,
  };
};

export const checkPhase2Win = (faces) => {
  return FACE_KEYS.every((faceKey) => {
    const target = PHASE2_TARGETS[faceKey];
    const current = faces[faceKey];
    return target.every((symbolId, index) => current[index] === symbolId);
  });
};

const neighborIndex = (gridSize, row, col) => row * gridSize + col;

export const buildAdjacencyMatches = (faces) => {
  const matches = [];
  const gridSize = 3;
  FACE_KEYS.forEach((faceKey) => {
    const face = faces[faceKey];
    createRange(gridSize).forEach((row) => {
      createRange(gridSize - 1).forEach((col) => {
        const left = face[neighborIndex(gridSize, row, col)];
        const right = face[neighborIndex(gridSize, row, col + 1)];
        if (ADJACENCY_RULES[left]?.includes(right) || ADJACENCY_RULES[right]?.includes(left)) {
          matches.push({
            face: faceKey,
            indices: [
              neighborIndex(gridSize, row, col),
              neighborIndex(gridSize, row, col + 1),
            ],
            pair: [left, right],
          });
        }
      });
    });
    createRange(gridSize - 1).forEach((row) => {
      createRange(gridSize).forEach((col) => {
        const top = face[neighborIndex(gridSize, row, col)];
        const bottom = face[neighborIndex(gridSize, row + 1, col)];
        if (ADJACENCY_RULES[top]?.includes(bottom) || ADJACENCY_RULES[bottom]?.includes(top)) {
          matches.push({
            face: faceKey,
            indices: [
              neighborIndex(gridSize, row, col),
              neighborIndex(gridSize, row + 1, col),
            ],
            pair: [top, bottom],
          });
        }
      });
    });
  });
  return matches;
};

export const getReactionLine = (pair) => {
  const normalized = pair.sort().join('-');
  const match = CONNECTION_REACTIONS.find((reaction) => {
    const sortedPair = [...reaction.pair].sort().join('-');
    return sortedPair === normalized;
  });
  return match ? match.text : randomFromArray(PHASE2_AMBIENT_TEXT);
};

export const FACE_KEYS_PHASE2 = FACE_KEYS;
