// RO-08 : vue publique limitée à id, status, history (copie).
// contactEmail, gps, priority et droneId restent internes.
export function getPublicStatus(mission) {
  return {
    id: mission.id,
    status: mission.status,
    history: [...mission.history],
  };
}
