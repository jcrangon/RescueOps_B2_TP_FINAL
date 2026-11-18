// Simulation pédagogique : coût en points de batterie.
export function estimateEnergy(distanceKm, payloadKg) {
  if (
    typeof distanceKm !== 'number' ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0
  ) {
    throw new RangeError('Distance invalide');
  }

  if (
    typeof payloadKg !== 'number' ||
    !Number.isFinite(payloadKg) ||
    payloadKg < 0 ||
    payloadKg > 5
  ) {
    throw new RangeError('Charge invalide');
  }

  return Math.ceil(distanceKm * 4 + payloadKg * 3 + 5);
}