
import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateEnergy } from '../src/energy.js';

test('T01 - mission 5 km et charge 2 kg consomme 31 points', () => {
  assert.equal(estimateEnergy(5, 2), 31);
});

test('T02 - mission 1 km sans charge consomme 9 points', () => {
  assert.equal(estimateEnergy(1, 0), 9);
});

test('T09 - distances invalides refusées', () => {
  const invalidDistances = [
    0,
    -1,
    Infinity,
    -Infinity,
    NaN,
    '5',
    null,
  ];

  for (const distance of invalidDistances) {
    assert.throws(
      () => estimateEnergy(distance, 2),
      RangeError
    );
  }
});

test('T10 - charges invalides refusées', () => {
  const invalidPayloads = [
    -0.1,
    5.1,
    Infinity,
    -Infinity,
    NaN,
    '2',
    null,
  ];

  for (const payload of invalidPayloads) {
    assert.throws(
      () => estimateEnergy(5, payload),
      RangeError
    );
  }
});

test('T11 - limites de charge acceptées', () => {
  assert.equal(estimateEnergy(1, 0), 9);
  assert.equal(estimateEnergy(1, 5), 24);
  assert.equal(estimateEnergy(0.5, 2), 13);
});
