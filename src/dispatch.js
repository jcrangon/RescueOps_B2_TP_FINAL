import { estimateEnergy } from './energy.js';

// RO-04 : réserve contractuelle minimale après départ (points fictifs).
export const MIN_RESERVE_POINTS = 20;

export function createDrone(id, batteryPoints, status = 'available') {
  return { id, batteryPoints, status };
}

export function deployDrone(drone, mission) {
  // RO-03 : seul un drone disponible peut être affecté à une mission planifiée.
  if (drone.status !== 'available') {
    throw new Error(`Drone ${drone.id} is not available (status: ${drone.status})`);
  }
  if (mission.status !== 'planned') {
    throw new Error(`Mission ${mission.id} cannot be deployed (status: ${mission.status})`);
  }

  // RO-02 : estimateEnergy lève RangeError si distance/charge invalides.
  const energyUsed = estimateEnergy(mission.distanceKm, mission.payloadKg);

  // RO-04 : refus avant toute modification si la réserve n'est pas respectée.
  const remaining = drone.batteryPoints - energyUsed;
  if (!(remaining >= MIN_RESERVE_POINTS)) {
    throw new RangeError(
      `Insufficient battery: ${drone.batteryPoints} - ${energyUsed} = ${remaining} < ${MIN_RESERVE_POINTS} reserve points`
    );
  }

  // RO-05 : nouveaux objets, entrées d'origine inchangées.
  return {
    drone: {
      ...drone,
      batteryPoints: remaining,
      status: 'busy',
    },
    mission: {
      ...mission,
      gps: { ...mission.gps },
      status: 'en_route',
      droneId: drone.id,
      history: [...mission.history, 'en_route'],
    },
    energyUsed,
  };
}
