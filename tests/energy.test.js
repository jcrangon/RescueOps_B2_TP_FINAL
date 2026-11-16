import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateEnergy } from '../src/energy.js';

test('T01 - mission 5 km et charge 2 kg consomme 31 points', () => {
  assert.equal(estimateEnergy(5, 2), 31);
});

test('T02 - mission 1 km sans charge consomme 9 points', () => {
  assert.equal(estimateEnergy(1, 0), 9);
});

test('RO-02 - distance invalide refusée', () => {
  for (const distance of [0, -1, Infinity, -Infinity, NaN, '5', null, undefined]) {
    assert.throws(() => estimateEnergy(distance, 2), RangeError);
  }
});

test('RO-02 - charge invalide refusée', () => {
  for (const payload of [-1, 5.01, Infinity, -Infinity, NaN, '2', null, undefined]) {
    assert.throws(() => estimateEnergy(5, payload), RangeError);
  }
});

test('RO-01/02 - bornes et arrondi conservés', () => {
  assert.equal(estimateEnergy(1, 0), 9);
  assert.equal(estimateEnergy(1, 5), 24);
  assert.equal(estimateEnergy(0.1, 0), 6);
});
