# Trace de revue — RescueOps

PR : https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/5
Auteur : Anais (anais-sgln)
Relecteur (pair GitHub OU auto-revue explicitement indiquée) : **auto-revue** par l'auteur, aucun pair disponible
Date : 16/11/2026

| Remarque | Fichier / fonction / ligne | Règle et scénario vérifiable | Risque | Demande proposée | Réponse de l'auteur | Test / correction / verdict |
|---|---|---|---|---|---|---|
| R-01 | `src/dispatch.js` / `deployDrone` / contrôle de réserve | RO-04 : drone avec `batteryPoints = NaN` | Avec `remaining < 20`, `NaN` passerait le contrôle (comparaison toujours fausse) | Vérifier que le code refuse ce cas et le tester | Le code utilise `!(remaining >= 20)`, donc `NaN` est refusé ; aucun test ne le prouvait | Ajout de T24 → vert. **Corrigé** |
| R-02 | `src/php/MissionCard.php` / `publicCard` | RO-09 : statut `'unknown'` → avertissement PHP et `statusLabel` `null` (constaté) | Carte publique avec libellé vide | Ajouter une valeur par défaut ou une exception | Hors contrat : entrées supposées bien formées ; une exception changerait le comportement attendu | Non corrigé, rattaché à **D-01** (P2). **Accepté comme dette** |

## Vérifications rejouées après réponse

- `npm test` : 24/24 verts.
- `php tests/MissionCard.test.php` : P01 à P06 OK.
- `php -l src/php/MissionCard.php` : aucune erreur.

## Verdict final motivé (ne pas inventer une approbation GitHub)

Auto-revue favorable : R-01 corrigée et testée, R-02 documentée en dette D-01. Aucune approbation GitHub d'un pair n'a été obtenue.
