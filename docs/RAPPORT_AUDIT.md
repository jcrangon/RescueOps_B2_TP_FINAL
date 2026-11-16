# Rapport d'audit — RescueOps

Auteur : Anais
Pseudo GitHub : anais-sgln
Date : 09/11/2026
Commit de base : 5e99359aa7cb8ad6a79a67a02373300e8b5a6873

**Scénario de référence :** mission SOS-204 (5 km, 2 kg, coût 31 pts), drone DR-07 à 70 pts.

| ID | Règle RO | Fichier / fonction | Entrée, obtenu S0, attendu | Risque concret | Priorité P0/P1/P2 | Preuve du correctif (test / commit) |
|---|---|---|---|---|---|---|
| A-01 | RO-02 | `energy.js` / `estimateEnergy` | `(-1, 2)` → `7` ; `(5, 6)` → `43` ; `(NaN, 2)` → `NaN`. Attendu : `RangeError` | Coût faux ou `NaN` qui fausse le contrôle de batterie | P1 : contrat d'entrée, base de RO-04 | T09, T10, T11 (`energy.test.js`), commit `4f9b0eb` |
| A-02 | RO-04 | `dispatch.js` / `deployDrone` | Drone 35 pts, coût 31 → accepté, reste `4`. Attendu : `RangeError` (minimum 51) | Départ sans réserve de 20 pts | P0 : simulation non sûre | T12, T13, T16 (`dispatch.test.js`), commit `fc20916` |
| A-03 | RO-03 | `dispatch.js` / `deployDrone` | Drone `busy` → accepté ; mission déjà `en_route` → redéployée. Attendu : `Error` | Double affectation drone/mission | P0 : cœur du dispatch faussé | T14, T15, T16 (`dispatch.test.js`), commit `fc20916` |
| A-04 | RO-06 | `mission.js` / `advanceMission` | `planned → en_route`, `en_route → closed`, `on_site → en_route`, `canceled → en_route` → acceptés. Attendu : `Error` | Mission lancée sans drone, étapes sautées | P1 : cycle de vie non respecté | T17, T18, T19, T21 (`mission.test.js`), commit `97db3c0` |
| A-05 | RO-07 | `mission.js` / `cancelMission` | Mission `en_route` → `canceled`. Attendu : `Error` | Mission annulée en vol, drone resté `busy` | P1 : état incohérent | T20, T21 (`mission.test.js`), commit `97db3c0` |
| A-06 | RO-08 | `public.js` / `getPublicStatus` | Renvoie aussi `contactEmail`, `gps`, `priority` ; `history` non copiée. Attendu : `id`, `status`, copie de `history` | Fuite de données personnelles | P0 : donnée personnelle publique | T22, T23 (`public.test.js`), commit `1689ae0` |
| A-07 | RO-09 | `MissionCard.php` / `publicCard` | Renvoie aussi `contactEmail`, `gps`. Attendu : `id`, `statusLabel` | Fuite de données personnelles | P0 : donnée personnelle publique | P04, P05, P06 (`MissionCard.test.php`), commit `1689ae0` |

## D-01 — Dette technique reportable

- **Risque :** les statuts sont définis deux fois (JS et PHP). Un statut inconnu donne un avertissement PHP et un libellé `null`.
- **Raison du report :** entrées supposées bien formées dans le TP ; les 6 statuts actuels sont couverts (P2).
- **Mesure compensatoire :** tests des libellés PHP et des transitions JS.
- **Réévaluation :** à l'ajout d'un statut ou d'une source de données externe.

## Contrôles AVANT correction

Node.js v24.19.0, PHP 8.3.33.

- `npm test` : 8/8 verts.
- `php tests/MissionCard.test.php` : 3/3 verts.
- `php -l src/php/MissionCard.php` : aucune erreur.
- `npm run demo` : drone à 35 pts « ACCEPTÉ », email et GPS visibles dans la vue publique.
- Sorties A-01 à A-07 : obtenues par appel direct des fonctions avec Node et PHP, sur le scénario de référence.

**Limite :** les tests ne couvrent que les cas positifs, donc aucun des 7 défauts n'est détecté.

## Contrôles APRÈS correction

Même environnement, après le commit `1689ae0` et le test de revue T24.

- `npm test` : 24/24 verts (8 tests d'origine + 16 nouveaux).
- `php tests/MissionCard.test.php` : P01 à P06 verts.
- `php -l src/php/MissionCard.php` : aucune erreur.
- `npm run demo` : énergie 31, batterie 39 ; drone à 35 pts « REFUSÉ » ; vue publique limitée à `id`, `status`, `history`.

**Limite :** D-01 non corrigée (statut inconnu en PHP → avertissement et libellé `null`, constaté).

## Conclusion d'audit

Les 7 défauts sont corrigés et prouvés par des tests, sans changer les signatures ni la formule d'énergie. Les scénarios d'origine restent verts. Seule D-01 reste ouverte, documentée et différée (P2).
