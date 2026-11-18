import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateEnergy } from '../src/energy.js';

test('T01 - mission 5 km et charge 2 kg consomme 31 points', () => {
  assert.equal(estimateEnergy(5, 2), 31);
});

test('T02 - mission 1 km sans charge consomme 9 points', () => {
  assert.equal(estimateEnergy(1, 0), 9);
});

// --- RO-02 / A-02 : entrées invalides refusées avant calcul ---

test('T09 - distance invalide lève RangeError', () => {
  for (const d of [0, -1, -0.5, Infinity, -Infinity, NaN, '5', null, undefined, {}]) {
    assert.throws(() => estimateEnergy(d, 2), RangeError, `distance ${String(d)}`);
  }
});

test('T10 - charge invalide lève RangeError', () => {
  for (const p of [-1, -0.01, 5.01, 6, Infinity, NaN, '2', null, undefined]) {
    assert.throws(() => estimateEnergy(5, p), RangeError, `charge ${String(p)}`);
  }
});

test('T11 - bornes de charge 0 et 5 kg incluses', () => {
  assert.equal(estimateEnergy(5, 0), 25);
  assert.equal(estimateEnergy(5, 5), 40);
});

test('T12 - petite distance strictement positive acceptée (arrondi supérieur)', () => {
  assert.equal(estimateEnergy(0.1, 0), 6);
});
