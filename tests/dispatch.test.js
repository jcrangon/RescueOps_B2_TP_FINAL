import test from 'node:test';
import assert from 'node:assert/strict';
import { deployDrone, createDrone } from '../src/dispatch.js';
import { advanceMission, cancelMission } from '../src/mission.js';
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

// --- RO-04 / A-01 : réserve de 20 points ---

test('T13 - drone à 35 ou 50 points refusé par RangeError (réserve < 20)', () => {
  assert.throws(() => deployDrone(drone(35), mission()), RangeError);
  assert.throws(() => deployDrone(drone(50), mission()), RangeError);
});

test('T14 - drone à 51 points accepté avec exactement 20 points restants', () => {
  const result = deployDrone(drone(51), mission());
  assert.equal(result.energyUsed, 31);
  assert.equal(result.drone.batteryPoints, 20);
  assert.equal(result.mission.status, 'en_route');
});

test('T15 - refus pour réserve insuffisante sans mutation', () => {
  const m = mission();
  const d = drone(35);
  const mBefore = structuredClone(m);
  const dBefore = structuredClone(d);
  assert.throws(() => deployDrone(d, m), RangeError);
  assert.deepEqual(m, mBefore);
  assert.deepEqual(d, dBefore);
});

// --- RO-03 / A-03 et A-04 : statuts du drone et de la mission ---

const isPlainError = (err) => err instanceof Error && !(err instanceof RangeError);

test('T16 - drone non disponible refusé (busy, maintenance)', () => {
  for (const status of ['busy', 'maintenance']) {
    assert.throws(() => deployDrone(drone(70, status), mission()), isPlainError, status);
  }
});

test('T17 - mission non planifiée refusée (en_route, on_site, closed, canceled)', () => {
  const deployed = deployDrone(drone(), mission()).mission;
  const onSite = advanceMission(deployed, 'on_site');
  const closed = advanceMission(advanceMission(onSite, 'returning'), 'closed');
  const canceled = cancelMission(mission());
  for (const m of [deployed, onSite, closed, canceled]) {
    assert.throws(() => deployDrone(createDrone('DR-08', 70), m), isPlainError, m.status);
  }
});

test('T18 - refus de statut sans mutation des entrées', () => {
  const busy = drone(70, 'busy');
  const canceled = cancelMission(mission());
  const dBefore = structuredClone(busy);
  const mBefore = structuredClone(canceled);
  assert.throws(() => deployDrone(busy, mission()));
  assert.throws(() => deployDrone(drone(), canceled));
  assert.deepEqual(busy, dBefore);
  assert.deepEqual(canceled, mBefore);
});

test('T19 - mission aux données invalides refusée par RangeError sans mutation', () => {
  const m = { ...mission(), distanceKm: -2 };
  const d = drone();
  const dBefore = structuredClone(d);
  assert.throws(() => deployDrone(d, m), RangeError);
  assert.deepEqual(d, dBefore);
});

test('T20 - la mission déployée ne partage pas gps/history avec la source', () => {
  const m = mission();
  const result = deployDrone(drone(), m);
  assert.notEqual(result.mission.history, m.history);
  assert.notEqual(result.mission.gps, m.gps);
  assert.equal(result.mission.droneId, 'DR-07');
});
