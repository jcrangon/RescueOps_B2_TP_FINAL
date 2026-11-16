import test from 'node:test';
import assert from 'node:assert/strict';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

test('T03 - départ de drone sur mission planifiée', () => {
  const result = deployDrone(drone(), mission());
  assert.equal(result.energyUsed, 31);
  assert.equal(result.drone.batteryPoints, 39);
  assert.equal(result.drone.status, 'busy');
  assert.equal(result.mission.status, 'en_route');
  assert.deepEqual(result.mission.history, ['planned', 'en_route']);
});

test('T04 - départ réussi ne mute pas les entrées', () => {
  const originalMission = mission();
  const originalDrone = drone();
  const mBefore = structuredClone(originalMission);
  const dBefore = structuredClone(originalDrone);
  deployDrone(originalDrone, originalMission);
  assert.deepEqual(originalMission, mBefore);
  assert.deepEqual(originalDrone, dBefore);
});

test('T12 - A-02 réserve insuffisante refusée (35 et 50 points)', () => {
  assert.throws(() => deployDrone(drone(35), mission()), RangeError);
  assert.throws(() => deployDrone(drone(50), mission()), RangeError);
});

test('T24 - R-01 batterie NaN refusée (RangeError)', () => {
  assert.throws(() => deployDrone(drone(NaN), mission()), RangeError);
});

test('T13 - A-02 drone à 51 points accepté, réserve restante 20', () => {
  const result = deployDrone(drone(51), mission());
  assert.equal(result.drone.batteryPoints, 20);
  assert.equal(result.mission.droneId, 'DR-07');
});

test('T14 - A-03 drone non disponible refusé', () => {
  assert.throws(() => deployDrone(drone(70, 'busy'), mission()), Error);
});

test('T15 - A-03 mission non planifiée refusée', () => {
  const deployed = deployDrone(drone(), mission()).mission;
  assert.throws(() => deployDrone(drone(), deployed), Error);
  assert.throws(() => deployDrone(drone(), { ...mission(), status: 'canceled' }), Error);
});

test('T16 - A-02/A-03 un refus ne mute pas les entrées', () => {
  const cases = [
    [drone(35), mission()],
    [drone(70, 'busy'), mission()],
    [drone(), { ...mission(), status: 'closed' }],
  ];
  for (const [d, m] of cases) {
    const dBefore = structuredClone(d);
    const mBefore = structuredClone(m);
    assert.throws(() => deployDrone(d, m));
    assert.deepEqual(d, dBefore);
    assert.deepEqual(m, mBefore);
  }
});
