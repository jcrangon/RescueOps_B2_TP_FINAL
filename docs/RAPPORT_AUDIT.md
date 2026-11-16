# Rapport d'audit — RescueOps

Auteur : Grégory Compastié
Pseudo GitHub : L3criminio
Date : 09/11/2026
Audit et corrections : 16/11/2026
Commit de base : 5e99359aa7cb8ad6a79a67a02373300e8b5a6873

S0 = code de départ, avant les corrections.

| ID | Règle RO | Fichier / fonction | Entrée, obtenu S0, attendu | Risque concret | Priorité P0/P1/P2 | Preuve du correctif (test / commit) |
|---|---|---|---|---|---|---|
| A-01 | RO-02 | `src/energy.js`, `estimateEnergy` | Distance 0, charge 2 -> 11 ; distance 5, charge -1 -> 22. Attendu : `RangeError`. | Calcul avec des valeurs interdites. | P1 : distance et charge non vérifiées. | 2 conditions ajoutées -> `energy.test.js`, valeurs interdites et limites 0/5 kg ; `82bdb58`. |
| A-02 | RO-03/05 | `src/dispatch.js`, `deployDrone` | Drone `busy` ou mission `en_route` -> départ accepté. Attendu : `Error`, objets inchangés. | Un drone occupé peut repartir. | P0 : départ dangereux dans la simulation. | Vérifier `available` et `planned` -> `dispatch.test.js`, refus et nouveaux objets ; `42c12b9`. |
| A-03 | RO-04 | `src/dispatch.js`, `deployDrone` | Coût 31 : batterie 35 -> reste 4 ; batterie 50 -> reste 19. Attendu : `RangeError` ; 51 doit passer. | Pas assez de batterie en réserve. | P0 : réserve obligatoire de 20 non respectée. | Vérifier la réserve -> `dispatch.test.js`, 0/30/35/50 refusés, 51 accepté ; `09183b8`. |
| A-04 | RO-03/06 | `src/mission.js`, `advanceMission` | `planned -> en_route` sans drone et `en_route -> closed` acceptés. Attendu : `Error`, mission inchangée. | Mission lancée sans drone ou étapes sautées. | P0 : départ sans vérifier le drone ni la batterie. | Autoriser seulement les 3 étapes prévues -> `mission.test.js`, essais depuis les 6 statuts ; `554a9d3`. |
| A-05 | RO-07 | `src/mission.js`, `cancelMission` | `en_route -> canceled` accepté. Attendu : `Error` ; annulation seulement depuis `planned`. | Mission annulée après le départ. | P1 : règle d'annulation non respectée. | Vérifier `planned` -> `mission.test.js`, 5 refus et annulation avec historique, sans changer l'original ; `2638f17`. |
| A-06 | RO-08 | `src/public.js`, `getPublicStatus` | SOS-204 -> e-mail, GPS et priorité visibles ; modifier l'historique public modifie aussi la mission. Attendu : `id`, `status`, copie de `history`. | Données privées visibles et mission modifiable depuis le suivi. | P0 : données personnelles publiques, selon le barème. | Retirer les champs privés et copier l'historique -> `public.test.js`, champs exacts et copie séparée ; `960b25f`. |
| A-07 | RO-09 | `src/php/MissionCard.php`, `publicCard` | SOS-204 -> carte avec `contactEmail` et `gps`. Attendu : seulement `id`, `statusLabel`. | E-mail et GPS visibles publiquement. | P0 : données personnelles publiques, selon le barème. | Retirer contact et GPS -> `MissionCard.test.php`, champs exacts, 6 libellés et mission inchangée ; `b5e85fb`. |

## D-01 — Dette technique reportable

Pas de tests automatiques sur GitHub (CI) -> risque de pousser du code sans le tester. P2 : mise en place reportée pour corriger d'abord les bugs du TP. En attendant, lancer les tests JS/PHP et vérifier la syntaxe et le diff avant chaque livraison. Responsable : Grégory Compastié ; à revoir avant la prochaine livraison ou un travail en équipe. Aucun P0 n'est laissé de côté.

## Contrôles AVANT correction

- `npm.cmd test` -> 8 tests JS réussis.
- `php tests/MissionCard.test.php` -> 3 vérifications conformes.
- `php -l src/php/MissionCard.php` -> syntaxe valide.
- `npm.cmd run demo` -> coût 31, batterie 39 ; e-mail et GPS publics ; départ à 35 accepté avec 4 points restants.
- Les tests de départ vérifient surtout les cas qui fonctionnent, pas tous les cas interdits.

Tests ajoutés et lancés avant chaque correction :

| Commande ciblée | Échecs observés avant le fix |
|---|---|
| `node --test tests/energy.test.js` | 2 : distance et charge invalides acceptées. |
| `node --test tests/dispatch.test.js` (A-02) | 2 : drone occupé et mission non planifiée acceptés. |
| `node --test tests/dispatch.test.js` (A-03) | 1 : réserve insuffisante acceptée. |
| `node --test tests/mission.test.js` (A-04) | 6 : transitions interdites acceptées depuis chaque statut. |
| `node --test --test-name-pattern=RO-07 tests/mission.test.js` | 3 : annulation en route, sur place et au retour acceptée. |
| `node --test tests/public.test.js` | 2 : champs privés présents et historique partagé. |
| `php tests/MissionCard.test.php` | Arrêt sur P04 : contact et GPS encore présents. |

Dans une boucle, un test s'arrête au premier échec. Après correction, toutes les valeurs sont testées.

## Contrôles APRÈS correction

- `npm.cmd test -- --test-reporter=spec` -> 33 tests JS réussis, 0 échec.
- `php tests/MissionCard.test.php` -> 11 vérifications conformes.
- `php -l src/php/MissionCard.php` et `php -l tests/MissionCard.test.php` -> syntaxe valide.
- `npm.cmd run demo` -> coût 31, batterie 39, suivi sans données privées ; départ à 35 refusé.
- `git diff --check` et `git diff 5e99359 --check` -> aucune erreur.
- RO-01 et les libellés PHP conservés ; règles métier non modifiées.
- Auto-revue avec l'aide d'une IA -> 2 tests ajoutés : départ avec une distance ou une charge interdite, et suivi public après départ.
- Limites : tests lancés sur le PC, sans tests automatiques sur GitHub ni relecture par un autre élève. Le TP suppose que les données de `createMission` et `createDrone` sont correctes.

## Conclusion d'audit

A-01 à A-07 corrigés et testés. Aucun P0 laissé de côté ; D-01 reste en P2. Les anciens tests passent toujours. Le résumé de la PR et l'auto-revue sont dans `PR_DESCRIPTION.md` et `REVUE.md`.
