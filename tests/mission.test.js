import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceMission, cancelMission } from '../src/mission.js';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

test('T05 - mission créée planifiée avec historique', () => {
  const m = mission();
  assert.equal(m.status, 'planned');
  assert.deepEqual(m.history, ['planned']);
});

test('T06 - mission déployée suit normalement son parcours', () => {
  const deployed = deployDrone(drone(), mission()).mission;
  const onSite = advanceMission(deployed, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');
  assert.equal(closed.status, 'closed');
  assert.deepEqual(closed.history, ['planned', 'en_route', 'on_site', 'returning', 'closed']);
});

test('T07 - annulation planifiée conserve la source', () => {
  const original = mission();
  const canceled = cancelMission(original);
  assert.equal(canceled.status, 'canceled');
  assert.deepEqual(canceled.history, ['planned', 'canceled']);
  assert.equal(original.status, 'planned');
});

// --- Aide : missions dans chaque statut, obtenues par le parcours légal ---
function missionsByStatus() {
  const planned = mission();
  const enRoute = deployDrone(drone(), mission()).mission;
  const onSite = advanceMission(enRoute, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');
  const canceled = cancelMission(mission());
  return { planned, enRoute, onSite, returning, closed, canceled };
}

// --- RO-03 / A-04 : advanceMission ne remplace pas deployDrone ---

test('T21 - advanceMission refuse planned -> en_route (réservé à deployDrone)', () => {
  assert.throws(() => advanceMission(mission(), 'en_route'), Error);
});

// --- RO-06 / A-05 : une étape à la fois, ni retour ni répétition ---

test('T22 - sauts refusés', () => {
  const { planned, enRoute, onSite } = missionsByStatus();
  assert.throws(() => advanceMission(planned, 'closed'), Error);
  assert.throws(() => advanceMission(planned, 'on_site'), Error);
  assert.throws(() => advanceMission(enRoute, 'returning'), Error);
  assert.throws(() => advanceMission(enRoute, 'closed'), Error);
  assert.throws(() => advanceMission(onSite, 'closed'), Error);
});

test('T23 - retours arrière et répétitions refusés', () => {
  const { enRoute, onSite, returning } = missionsByStatus();
  assert.throws(() => advanceMission(onSite, 'en_route'), Error);
  assert.throws(() => advanceMission(returning, 'on_site'), Error);
  assert.throws(() => advanceMission(enRoute, 'en_route'), Error);
  assert.throws(() => advanceMission(onSite, 'on_site'), Error);
  assert.throws(() => advanceMission(returning, 'returning'), Error);
});

test('T24 - aucune transition depuis closed ou canceled, statut inconnu refusé', () => {
  const { enRoute, closed, canceled } = missionsByStatus();
  for (const target of ['planned', 'en_route', 'on_site', 'returning', 'closed', 'canceled']) {
    assert.throws(() => advanceMission(closed, target), Error, `closed -> ${target}`);
    assert.throws(() => advanceMission(canceled, target), Error, `canceled -> ${target}`);
  }
  assert.throws(() => advanceMission(enRoute, 'lost'), Error);
  assert.throws(() => advanceMission(enRoute, 'canceled'), Error);
});

test('T25 - transition refusée sans mutation de la source', () => {
  const { onSite } = missionsByStatus();
  const before = structuredClone(onSite);
  assert.throws(() => advanceMission(onSite, 'en_route'));
  assert.deepEqual(onSite, before);
});

// --- RO-07 / A-06 : annulation seulement depuis planned ---

test('T26 - annulation refusée après déploiement et depuis un état terminal', () => {
  const { enRoute, onSite, returning, closed, canceled } = missionsByStatus();
  for (const m of [enRoute, onSite, returning, closed, canceled]) {
    assert.throws(() => cancelMission(m), Error, m.status);
  }
});

test('T27 - annulation refusée sans mutation de la source', () => {
  const { onSite } = missionsByStatus();
  const before = structuredClone(onSite);
  assert.throws(() => cancelMission(onSite));
  assert.deepEqual(onSite, before);
});
