export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const wrapIndex = (value, length) => {
  if (value < 0) {
    return length - (Math.abs(value) % length || length);
  }
  return value % length;
};

export const createRange = (count) => Array.from({ length: count }, (_, index) => index);

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (start, end, alpha) => start + (end - start) * alpha;

export const sumArray = (arr) => arr.reduce((total, value) => total + value, 0);

export const averageArray = (arr) => {
  if (!arr.length) return 0;
  return sumArray(arr) / arr.length;
};

export const easeInOut = (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const createId = (() => {
  let seed = 0;
  return (prefix = 'id') => {
    seed += 1;
    return `${prefix}-${seed}`;
  };
})();
