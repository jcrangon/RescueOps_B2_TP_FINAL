
import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceMission, cancelMission } from '../src/mission.js';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

// T05 - Création de mission
test('T05 - mission créée planifiée avec historique', () => {
  const m = mission();

  assert.equal(m.status, 'planned');
  assert.deepEqual(m.history, ['planned']);
});

// T06 - Parcours normal
test('T06 - mission déployée suit normalement son parcours', () => {
  const deployed = deployDrone(drone(), mission()).mission;

  const onSite = advanceMission(deployed, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');

  assert.equal(closed.status, 'closed');

  assert.deepEqual(closed.history, [
    'planned',
    'en_route',
    'on_site',
    'returning',
    'closed',
  ]);
});

// T07 - Annulation avant départ
test('T07 - annulation planifiée conserve la source', () => {
  const original = mission();
  const canceled = cancelMission(original);

  assert.equal(canceled.status, 'canceled');
  assert.deepEqual(canceled.history, ['planned', 'canceled']);
  assert.equal(original.status, 'planned');
});

// T16 - Transitions interdites
test('T16 - départ et sauts d étapes refusés', () => {
  const planned = mission();
  const enRoute = deployDrone(drone(), planned).mission;

  for (const nextStatus of ['en_route', 'on_site', 'closed']) {
    assert.throws(
      () => advanceMission(planned, nextStatus),
      Error
    );
  }

  assert.throws(
    () => advanceMission(enRoute, 'closed'),
    Error
  );

  assert.deepEqual(planned.history, ['planned']);
  assert.deepEqual(enRoute.history, ['planned', 'en_route']);
});

// T17 - Répétitions et retours interdits
test('T17 - répétitions et retours interdits', () => {
  const enRoute = deployDrone(drone(), mission()).mission;
  const onSite = advanceMission(enRoute, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');
  const canceled = cancelMission(mission());

  const invalidTransitions = [
    [enRoute, 'en_route'],
    [onSite, 'on_site'],
    [onSite, 'en_route'],
    [returning, 'on_site'],
    [closed, 'returning'],
    [canceled, 'on_site'],
    [enRoute, 'canceled'],
    [enRoute, 'unknown'],
  ];

  for (const [source, target] of invalidTransitions) {
    const before = structuredClone(source);

    assert.throws(
      () => advanceMission(source, target),
      Error
    );

    assert.deepEqual(source, before);
  }
});

// T18 - Annulations interdites
test('T18 - annulation après départ ou clôture refusée', () => {
  const enRoute = deployDrone(drone(), mission()).mission;
  const onSite = advanceMission(enRoute, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');
  const canceled = cancelMission(mission());

  const invalidMissions = [
    enRoute,
    onSite,
    returning,
    closed,
    canceled,
  ];

  for (const source of invalidMissions) {
    const before = structuredClone(source);

    assert.throws(
      () => cancelMission(source),
      Error
    );

    assert.deepEqual(source, before);
  }

  assert.deepEqual(canceled.history, ['planned', 'canceled']);
});
