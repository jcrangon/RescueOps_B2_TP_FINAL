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

const statuses = ['planned', 'en_route', 'on_site', 'returning', 'closed', 'canceled'];
const allowedNext = { en_route: 'on_site', on_site: 'returning', returning: 'closed' };

for (const status of statuses) {
  test(`RO-06 - transitions interdites depuis ${status}, sans mutation`, () => {
    const original = { ...mission(), status, history: [status] };
    const before = structuredClone(original);
    for (const target of [...statuses, 'unknown']) {
      if (target === allowedNext[status]) continue;
      assert.throws(() => advanceMission(original, target), Error);
      assert.deepEqual(original, before);
    }
  });
}

test('RO-06 - étapes autorisées créent de nouveaux objets', () => {
  let original = deployDrone(drone(), mission()).mission;
  for (const target of ['on_site', 'returning', 'closed']) {
    const before = structuredClone(original);
    const result = advanceMission(original, target);
    assert.notStrictEqual(result, original);
    assert.notStrictEqual(result.history, original.history);
    assert.equal(result.status, target);
    assert.deepEqual(result.history, [...before.history, target]);
    assert.deepEqual(original, before);
    original = result;
  }
});

for (const status of statuses.filter(status => status !== 'planned')) {
  test(`RO-07 - annulation refusée depuis ${status}, sans mutation`, () => {
    const original = { ...mission(), status, history: [status] };
    const before = structuredClone(original);
    assert.throws(() => cancelMission(original), Error);
    assert.deepEqual(original, before);
  });
}

test('RO-07 - annulation planifiée crée un objet et un historique indépendants', () => {
  const original = mission();
  const before = structuredClone(original);
  const result = cancelMission(original);
  assert.notStrictEqual(result, original);
  assert.notStrictEqual(result.history, original.history);
  assert.equal(result.status, 'canceled');
  assert.deepEqual(result.history, ['planned', 'canceled']);
  assert.deepEqual(original, before);
});
