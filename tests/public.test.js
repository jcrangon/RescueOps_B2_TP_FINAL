import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicStatus } from '../src/public.js';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

test('T08 - le suivi public affiche la référence et le statut', () => {
  const summary = getPublicStatus(mission());
  assert.equal(summary.id, 'SOS-204');
  assert.equal(summary.status, 'planned');
});

// --- RO-08 / A-07 : aucune donnée interne exposée ---

function deployedMission() {
  return deployDrone(drone(), mission()).mission;
}

test('T28 - le suivi public contient exactement id, status, history', () => {
  for (const m of [mission(), deployedMission()]) {
    assert.deepEqual(Object.keys(getPublicStatus(m)).sort(), ['history', 'id', 'status']);
  }
});

test('T29 - history est une copie : modifier la vue ne modifie pas la mission', () => {
  const m = deployedMission();
  const view = getPublicStatus(m);
  assert.notEqual(view.history, m.history);
  view.history.push('hack');
  assert.deepEqual(m.history, ['planned', 'en_route']);
});

test('T30 - aucune valeur sensible dans la sérialisation publique', () => {
  const json = JSON.stringify(getPublicStatus(deployedMission()));
  for (const secret of ['famille@example.test', '45.1201', '5.7123', 'critical', 'DR-07']) {
    assert.ok(!json.includes(secret), `fuite : ${secret}`);
  }
});
