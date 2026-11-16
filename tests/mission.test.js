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

// Missions à chaque étape du cycle, pour les tests de refus.
function stages() {
  const planned = mission();
  const enRoute = deployDrone(drone(), planned).mission;
  const onSite = advanceMission(enRoute, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');
  const canceled = cancelMission(mission());
  return { planned, enRoute, onSite, returning, closed, canceled };
}

test('T17 - A-04 planned -> en_route interdit hors deployDrone', () => {
  assert.throws(() => advanceMission(mission(), 'en_route'), Error);
});

test('T18 - A-04 saut, retour et répétition interdits', () => {
  const s = stages();
  assert.throws(() => advanceMission(s.enRoute, 'closed'), Error);    // saut
  assert.throws(() => advanceMission(s.onSite, 'en_route'), Error);   // retour
  assert.throws(() => advanceMission(s.enRoute, 'en_route'), Error);  // répétition
  assert.throws(() => advanceMission(s.enRoute, 'unknown'), Error);   // statut inconnu
});

test('T19 - A-04 aucune transition depuis closed ou canceled', () => {
  const s = stages();
  for (const next of ['planned', 'en_route', 'on_site', 'returning', 'closed', 'canceled']) {
    assert.throws(() => advanceMission(s.closed, next), Error);
    assert.throws(() => advanceMission(s.canceled, next), Error);
  }
});

test('T20 - A-05 annulation refusée après déploiement, fin ou annulation', () => {
  const s = stages();
  for (const m of [s.enRoute, s.onSite, s.returning, s.closed, s.canceled]) {
    assert.throws(() => cancelMission(m), Error, m.status);
  }
});

test('T21 - A-04/A-05 un refus ne mute pas la mission', () => {
  const s = stages();
  const before = structuredClone(s);
  assert.throws(() => advanceMission(s.planned, 'en_route'));
  assert.throws(() => advanceMission(s.enRoute, 'closed'));
  assert.throws(() => cancelMission(s.enRoute));
  assert.throws(() => cancelMission(s.closed));
  assert.deepEqual(s, before);
});
