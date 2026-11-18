
import test from 'node:test';
import assert from 'node:assert/strict';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

// T03 - Déploiement normal
test('T03 - départ de drone sur mission planifiée', () => {
  const result = deployDrone(drone(), mission());

  assert.equal(result.energyUsed, 31);
  assert.equal(result.drone.batteryPoints, 39);
  assert.equal(result.drone.status, 'busy');
  assert.equal(result.mission.status, 'en_route');
  assert.deepEqual(
    result.mission.history,
    ['planned', 'en_route']
  );
});

// T04 - Absence de mutation
test('T04 - départ réussi ne mute pas les entrées', () => {
  const originalMission = mission();
  const originalDrone = drone();

  const mBefore = structuredClone(originalMission);
  const dBefore = structuredClone(originalDrone);

  deployDrone(originalDrone, originalMission);

  assert.deepEqual(originalMission, mBefore);
  assert.deepEqual(originalDrone, dBefore);
});

// T12 - Batterie insuffisante
test('T12 - batterie 35 ou 50 refusée sans mutation', () => {
  for (const battery of [35, 50]) {
    const originalMission = mission();
    const originalDrone = drone(battery);

    const beforeMission = structuredClone(originalMission);
    const beforeDrone = structuredClone(originalDrone);

    assert.throws(
      () => deployDrone(originalDrone, originalMission),
      RangeError
    );

    assert.deepEqual(originalMission, beforeMission);
    assert.deepEqual(originalDrone, beforeDrone);
  }
});

// T13 - Limite autorisée à 51 points
test('T13 - seuil 51 autorisé', () => {
  const originalMission = mission();
  const originalDrone = drone(51);

  const result = deployDrone(originalDrone, originalMission);

  assert.equal(result.energyUsed, 31);
  assert.equal(result.drone.batteryPoints, 20);
  assert.equal(result.drone.status, 'busy');
  assert.equal(result.mission.droneId, 'DR-07');

  assert.deepEqual(
    result.mission.history,
    ['planned', 'en_route']
  );

  assert.notStrictEqual(result.drone, originalDrone);
  assert.notStrictEqual(result.mission, originalMission);
  assert.notStrictEqual(result.mission.history, originalMission.history);

  assert.equal(originalMission.status, 'planned');
  assert.equal(originalDrone.batteryPoints, 51);
});

// T14 - Drone déjà occupé
test('T14 - drone busy refusé sans mutation', () => {
  const originalMission = mission();
  const originalDrone = drone(70, 'busy');

  const beforeMission = structuredClone(originalMission);
  const beforeDrone = structuredClone(originalDrone);

  assert.throws(
    () => deployDrone(originalDrone, originalMission),
    Error
  );

  assert.deepEqual(originalMission, beforeMission);
  assert.deepEqual(originalDrone, beforeDrone);
});

// T15 - Mission déjà déployée
test('T15 - mission en_route refusée sans mutation', () => {
  const originalMission = deployDrone(
    drone(),
    mission()
  ).mission;

  const originalDrone = drone();

  const beforeMission = structuredClone(originalMission);
  const beforeDrone = structuredClone(originalDrone);

  assert.throws(
    () => deployDrone(originalDrone, originalMission),
    Error
  );

  assert.deepEqual(originalMission, beforeMission);
  assert.deepEqual(originalDrone, beforeDrone);
});
