// RO-06 : seule étape suivante autorisée pour advanceMission.
// planned -> en_route est volontairement ABSENT : seul deployDrone l'effectue (RO-03).
// closed et canceled sont terminaux (aucune entrée).
const NEXT_STATUS = Object.freeze({
  en_route: 'on_site',
  on_site: 'returning',
  returning: 'closed',
});

export function createMission({ id, contactEmail, gps, distanceKm, payloadKg, priority }) {
  return {
    id,
    contactEmail,
    gps: { ...gps },
    distanceKm,
    payloadKg,
    priority,
    status: 'planned',
    history: ['planned'],
  };
}

export function advanceMission(mission, nextStatus) {
  const expected = NEXT_STATUS[mission.status];
  if (expected === undefined || nextStatus !== expected) {
    throw new Error(
      `Mission transition not allowed: ${mission.status} -> ${nextStatus}` +
        (expected ? ` (expected ${expected})` : '')
    );
  }
  return {
    ...mission,
    gps: { ...mission.gps },
    status: nextStatus,
    history: [...mission.history, nextStatus],
  };
}

// RO-07 : annulation uniquement avant déploiement.
export function cancelMission(mission) {
  if (mission.status !== 'planned') {
    throw new Error(`Mission cancellation not allowed (status: ${mission.status})`);
  }
  return {
    ...mission,
    gps: { ...mission.gps },
    status: 'canceled',
    history: [...mission.history, 'canceled'],
  };
}
