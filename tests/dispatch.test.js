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

test('RO-03 - drone indisponible refusé sans mutation', () => {
  for (const status of ['busy', 'charging', 'unknown']) {
    const d = drone(70, status);
    const m = mission();
    const before = structuredClone({ d, m });
    assert.throws(() => deployDrone(d, m), Error);
    assert.deepEqual({ d, m }, before);
  }
});

test('RO-03 - mission non planifiée refusée sans mutation', () => {
  for (const status of ['en_route', 'on_site', 'returning', 'closed', 'canceled', 'unknown']) {
    const d = drone();
    const m = { ...mission(), status };
    const before = structuredClone({ d, m });
    assert.throws(() => deployDrone(d, m), Error);
    assert.deepEqual({ d, m }, before);
  }
});

test('RO-05 - nouveaux objets et drone affecté après départ', () => {
  const d = drone();
  const m = mission();
  const result = deployDrone(d, m);
  assert.notStrictEqual(result.drone, d);
  assert.notStrictEqual(result.mission, m);
  assert.notStrictEqual(result.mission.history, m.history);
  assert.equal(result.mission.droneId, d.id);
  result.mission.history.push('on_site');
  assert.deepEqual(m.history, ['planned']);
});

test('RO-04 - réserve insuffisante refusée sans mutation', () => {
  for (const battery of [0, 30, 35, 50]) {
    const d = drone(battery);
    const m = mission();
    const before = structuredClone({ d, m });
    assert.throws(() => deployDrone(d, m), RangeError);
    assert.deepEqual({ d, m }, before);
  }
});

test('RO-04 - réserve de 20 points exactement acceptée', () => {
  const result = deployDrone(drone(51), mission());
  assert.equal(result.energyUsed, 31);
  assert.equal(result.drone.batteryPoints, 20);
  assert.equal(result.drone.status, 'busy');
  assert.equal(result.mission.status, 'en_route');
});

test('Revue R-01 - énergie invalide refuse le départ sans mutation', () => {
  for (const values of [{ distanceKm: 0 }, { payloadKg: 6 }]) {
    const d = drone();
    const m = { ...mission(), ...values };
    const before = structuredClone({ d, m });
    assert.throws(() => deployDrone(d, m), RangeError);
    assert.deepEqual({ d, m }, before);
  }
});
