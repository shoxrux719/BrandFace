import test from 'node:test';
import assert from 'node:assert/strict';
import {forwardDestination, gestureDestination, remapReaderPosition, visibleSlots, wrap} from '../src/carouselMath.js';

test('last-to-first progresses forward, including repeated cycles', () => {
  for (const last of [9, 19, 99, 9999]) {
    const destination = forwardDestination(last, 0, 10);
    assert.equal(destination, last + 1);
    assert.equal(wrap(destination, 10), 0);
  }
});
test('backwards cycles resolve a valid last chapter', () => {
  assert.equal(wrap(-1, 10), 9);
  assert.equal(wrap(-11, 10), 9);
});
test('virtual slides retain their relative positions across the cycle boundary', () => {
  const before = visibleSlots(9.999);
  const after = visibleSlots(10.001);
  const shared = before.filter(slot => after.includes(slot));
  assert.deepEqual(shared, [9, 10, 11]);
  for (const slot of shared) assert.ok(Math.abs((slot - 9.999) - (slot - 10.001)) < .003);
});
test('a short deliberate gesture advances and a tiny accidental movement does not', () => {
  assert.equal(gestureDestination(9.25, 9, 1), 10);
  assert.equal(gestureDestination(9.02, 9, 1), 9);
  assert.equal(gestureDestination(-.25, 0, -1), -1);
});
test('phone pages also cross the last-to-first boundary in the same direction', () => {
  for (const last of [19,39,199]) {
    assert.equal(forwardDestination(last,0,20),last+1);
    assert.equal(wrap(last+1,20),0);
  }
  assert.equal(wrap(-1,20),19);
});
test('changing between a phone page and a spread retains its chapter and cycle', () => {
  assert.equal(remapReaderPosition(9,1,2),18);
  assert.equal(remapReaderPosition(19,2,1),9);
  assert.equal(remapReaderPosition(39,2,1),19);
  assert.equal(remapReaderPosition(-1,2,1),-1);
  assert.equal(remapReaderPosition(9.8,1,2),20);
});
