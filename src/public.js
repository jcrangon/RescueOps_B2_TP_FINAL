// Vue publique (RO-08) : uniquement id, status et une copie de history.
export function getPublicStatus(mission) {
  return {
    id: mission.id,
    status: mission.status,
    history: [...mission.history],
  };
}
