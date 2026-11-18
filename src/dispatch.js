import { estimateEnergy } from './energy.js';

export function createDrone(id, batteryPoints, status = 'available') {
  return { id, batteryPoints, status };
}

export function deployDrone(drone, mission) {
  if (drone.status !== 'available' || mission.status !== 'planned') {
    throw new Error('Drone ou mission indisponible');
  }

  const energyUsed = estimateEnergy(
    mission.distanceKm,
    mission.payloadKg
  );

  if (drone.batteryPoints - energyUsed < 20) {
    throw new RangeError('Batterie insuffisante');
  }

  return {
    drone: {
      ...drone,
      batteryPoints: drone.batteryPoints - energyUsed,
      status: 'busy',
    },
    mission: {
      ...mission,
      status: 'en_route',
      droneId: drone.id,
      history: [...mission.history, 'en_route'],
    },
    energyUsed,
  };
}