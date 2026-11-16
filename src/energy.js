// Simulation pédagogique : coût en points de batterie, sans pilotage réel.
export const MAX_PAYLOAD_KG = 5;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// RO-02 : validation stricte AVANT calcul (pas de conversion implicite).
function assertValidInputs(distanceKm, payloadKg) {
  if (!isFiniteNumber(distanceKm) || distanceKm <= 0) {
    throw new RangeError('Invalid distanceKm: finite number > 0 expected');
  }
  if (!isFiniteNumber(payloadKg) || payloadKg < 0 || payloadKg > MAX_PAYLOAD_KG) {
    throw new RangeError(`Invalid payloadKg: finite number between 0 and ${MAX_PAYLOAD_KG} expected`);
  }
}

// RO-01 : formule contractuelle, inchangée.
export function estimateEnergy(distanceKm, payloadKg) {
  assertValidInputs(distanceKm, payloadKg);
  return Math.ceil(distanceKm * 4 + payloadKg * 3 + 5);
}
