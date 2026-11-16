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

test('T22 - A-06 vue publique limitée à id, status, history', () => {
  const deployed = deployDrone(drone(), mission()).mission;
  const summary = getPublicStatus(deployed);
  assert.deepEqual(Object.keys(summary).sort(), ['history', 'id', 'status']);
  for (const secret of ['contactEmail', 'gps', 'priority', 'droneId']) {
    assert.equal(secret in summary, false, secret);
  }
});

test('T23 - A-06 history est une copie, la source reste intacte', () => {
  const source = mission();
  const summary = getPublicStatus(source);
  assert.deepEqual(summary.history, source.history);
  assert.notEqual(summary.history, source.history);
  summary.history.push('hacked');
  assert.deepEqual(source.history, ['planned']);
});
