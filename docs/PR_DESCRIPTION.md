# [RescueOps] Audit et correctifs A-01 à A-07

## Problème observé

Les tests S0 étaient verts, mais le code ne respectait pas `REGLES_METIER.md` : énergie non validée, drone à 35 pts accepté (reste 4), double affectation, transitions libres, annulation en vol, email et GPS exposés en public (JS et PHP).

## Exigences traitées : RO-xx et constats A-xx

| Constat | Règle | Priorité |
|---|---|---|
| A-01 validation énergie | RO-02 | P1 |
| A-02 réserve de 20 pts | RO-04 | P0 |
| A-03 statuts drone/mission | RO-03 | P0 |
| A-04 transitions | RO-06 | P1 |
| A-05 annulation | RO-07 | P1 |
| A-06 vue publique JS | RO-08 | P0 |
| A-07 carte publique PHP | RO-09 | P0 |

Détail : `docs/RAPPORT_AUDIT.md`.

## Correctifs (fichier / fonction / comportement)

- `src/energy.js` / `estimateEnergy` : `RangeError` si distance ≤ 0 ou charge hors [0, 5], ou valeur non numérique/non finie. Formule inchangée.
- `src/dispatch.js` / `deployDrone` : `Error` si drone non `available` ou mission non `planned` ; `RangeError` si réserve < 20 pts.
- `src/mission.js` / `advanceMission` : seule l'étape suivante est permise (`en_route → on_site → returning → closed`).
- `src/mission.js` / `cancelMission` : annulation seulement depuis `planned`.
- `src/public.js` / `getPublicStatus` : uniquement `id`, `status`, copie de `history`.
- `src/php/MissionCard.php` / `publicCard` : uniquement `id`, `statusLabel`.

## Tests réellement exécutés : commandes et résultats

Node.js v24.19.0, PHP 8.3.33.

| Commande | Résultat |
|---|---|
| `npm test` | 24 tests, 24 pass, 0 fail |
| `php tests/MissionCard.test.php` | P01 à P06 OK |
| `php -l src/php/MissionCard.php` | No syntax errors detected |
| `npm run demo` | énergie 31, batterie 39, drone à 35 pts « REFUSÉ », vue publique sans email ni GPS |

## Non-régression / objets non mutés

- Les 8 tests JS et 3 tests PHP d'origine sont inchangés et verts.
- T04, T16, T21, T23 vérifient que les entrées ne sont pas modifiées, en cas de succès comme de refus.

## Risques résiduels et dette D-01

D-01 : statuts définis deux fois (JS et PHP) ; un statut inconnu en PHP donne un avertissement et un libellé `null`. Différé (P2) car les entrées sont supposées bien formées dans le TP.

## Points précis à relire

- `deployDrone` : ordre des contrôles (statuts, puis énergie, puis réserve).
- `advanceMission` : table `NEXT_STATUS`, qui bloque aussi `planned` et `canceled`.

## Modifications faites après revue (dans cette même PR)

- R-01 : ajout du test T24 (batterie `NaN` refusée).
- R-02 : statut inconnu en PHP non corrigé, rattaché à D-01.

Voir `docs/REVUE.md` (auto-revue).

## Preuve de livraison
URL réelle : https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/5
Branche source dans mon fork : TP_RescueOps_Anais_Sgln
Branche cible dans le dépôt du formateur : main
Statut final de la PR : Ready for review, non mergée
