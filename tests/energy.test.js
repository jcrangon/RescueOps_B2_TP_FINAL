import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateEnergy } from '../src/energy.js';

test('T01 - mission 5 km et charge 2 kg consomme 31 points', () => {
  assert.equal(estimateEnergy(5, 2), 31);
});

test('T02 - mission 1 km sans charge consomme 9 points', () => {
  assert.equal(estimateEnergy(1, 0), 9);
});

test('T09 - A-01 distance invalide refusée (RangeError)', () => {
  for (const distance of [0, -1, NaN, Infinity, '5', null, undefined]) {
    assert.throws(() => estimateEnergy(distance, 2), RangeError, `distance ${String(distance)}`);
  }
});

test('T10 - A-01 charge invalide refusée (RangeError)', () => {
  for (const payload of [-0.1, 5.1, NaN, Infinity, '2', null, undefined]) {
    assert.throws(() => estimateEnergy(5, payload), RangeError, `charge ${String(payload)}`);
  }
});

test('T11 - A-01 bornes de charge 0 et 5 kg acceptées', () => {
  assert.equal(estimateEnergy(5, 0), 25);
  assert.equal(estimateEnergy(5, 5), 40);
});
