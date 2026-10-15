export const wrap = (value, count) => ((value % count) + count) % count;
export const visibleSlots = (position) => {
  const base = Math.floor(position);
  return [base - 1, base, base + 1, base + 2];
};
export const forwardDestination = (position, index, count) => {
  const from = Math.round(position);
  return from + wrap(index - wrap(from, count), count);
};
export const gestureDestination = (target, origin, direction) => {
  if (Math.abs(target - origin) < .08) return origin;
  return direction > 0 ? Math.ceil(target - .035) : Math.floor(target + .035);
};
// Retain the same chapter and cycle when the phone page format changes to a spread.
export const remapReaderPosition = (position, fromScale, toScale) =>
  Math.floor(Math.round(position) / fromScale) * toScale;
