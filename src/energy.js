// Simulation pédagogique : coût en points de batterie, sans pilotage réel.
export function estimateEnergy(distanceKm, payloadKg) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new RangeError('La distance doit être un nombre fini supérieur à 0');
  }
  if (!Number.isFinite(payloadKg) || payloadKg < 0 || payloadKg > 5) {
    throw new RangeError('La charge doit être un nombre fini entre 0 et 5');
  }
  return Math.ceil(distanceKm * 4 + payloadKg * 3 + 5);
}
