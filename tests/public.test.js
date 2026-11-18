
import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicStatus } from '../src/public.js';
import { mission } from './helpers.js';

// T08 - Suivi public
test('T08 - le suivi public affiche la référence et le statut', () => {
  const summary = getPublicStatus(mission());

  assert.equal(summary.id, 'SOS-204');
  assert.equal(summary.status, 'planned');
});

// T19 - Confidentialité et copie de l'historique
test('T19 - clés publiques exactes et historique indépendant', () => {
  const original = mission();
  const summary = getPublicStatus(original);

  // Vérifier les trois champs autorisés
  assert.deepEqual(
    Object.keys(summary),
    ['id', 'status', 'history']
  );

  // Vérifier le contenu de l'historique
  assert.deepEqual(summary.history, ['planned']);

  // Vérifier que l'historique est une copie
  assert.notStrictEqual(
    summary.history,
    original.history
  );

  // Modifier la copie publique
  summary.history.push('unexpected');

  // L'historique original ne doit pas changer
  assert.deepEqual(original.history, ['planned']);
});
