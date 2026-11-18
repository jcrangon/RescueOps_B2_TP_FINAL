# [RescueOps] Correction des règles métier et de la confidentialité

**Auteur :** Rayane Badi
**GitHub :** Badi763
**Branche :** `TP_RescueOps_Rayane_Badi`

## Problème observé

Au départ, les 8 tests JavaScript réussissaient, mais plusieurs règles métier n'étaient pas respectées.

Un drone pouvait être envoyé avec une batterie insuffisante, une mission pouvait sauter des étapes ou être annulée après son départ. Les vues publiques affichaient également des informations internes comme l'email et les coordonnées GPS.

Cette Pull Request corrige les sept anomalies A-01 à A-07 identifiées dans le rapport d'audit.

## Règles métier corrigées

- **RO-01 :** conservation de la formule de calcul d'énergie.
- **RO-02 :** validation des distances et des charges.
- **RO-03 :** vérification de la disponibilité des drones et des missions.
- **RO-04 :** respect des 20 points minimum de réserve de batterie.
- **RO-05 :** création de nouveaux objets sans modifier les originaux.
- **RO-06 :** respect des transitions autorisées entre les statuts.
- **RO-07 :** annulation possible uniquement avant le déploiement.
- **RO-08 :** protection des données dans le suivi public JavaScript.
- **RO-09 :** protection des données dans la carte publique PHP.

## Modifications réalisées

| Fichier | Modification |
|---|---|
| `src/energy.js` | Validation des distances et des charges avant le calcul. |
| `src/dispatch.js` | Vérification des statuts et de la réserve de batterie. |
| `src/mission.js` | Contrôle des transitions et de l'annulation des missions. |
| `src/public.js` | Limitation des champs publics et copie de l'historique. |
| `src/php/MissionCard.php` | Suppression de l'email et du GPS de la carte publique. |
| `tests/energy.test.js` | Tests des valeurs interdites et des limites. |
| `tests/dispatch.test.js` | Tests des batteries insuffisantes et des affectations interdites. |
| `tests/mission.test.js` | Tests des transitions et annulations interdites. |
| `tests/public.test.js` | Vérification des champs publics et de l'historique. |
| `tests/MissionCard.test.php` | Vérification des champs publics et des libellés PHP. |
| `docs/RAPPORT_AUDIT.md` | Rapport des sept anomalies et de la dette technique D-01. |
| `docs/REVUE.md` | Deux remarques d'auto-revue documentées. |

## Tests réellement exécutés

### JavaScript

Commande :

`npm test`

Résultat :

- 19 tests réussis.
- 0 échec.
- Les 8 tests initiaux sont toujours fonctionnels.

### PHP

Commande :

`php tests/MissionCard.test.php`

Résultat :

- 10 vérifications conformes.
- Les champs publics respectent la liste autorisée.
- Les libellés des statuts sont conservés.

Commande :

`php -l src/php/MissionCard.php`

Résultat :

- Aucune erreur de syntaxe.

### Démonstration

Commande :

`npm run demo`

Résultats :

- Drone avec 70 points : départ autorisé.
- Énergie consommée : 31 points.
- Batterie restante : 39 points.
- Drone avec 35 points : départ refusé.
- Vue publique : uniquement `id`, `status` et `history`.

### Vérification Git

Commande :

`git diff --check`

Résultat : aucune erreur signalée.

## Non-régression et absence de mutation

Les tests vérifient que les comportements initiaux conformes sont conservés.

Le calcul d'énergie reste inchangé :

- 5 km et 2 kg : 31 points.
- 1 km et 0 kg : 9 points.

Les tests vérifient également que les fonctions ne modifient pas les objets d'origine lors des opérations interdites.

Le tableau `history` renvoyé publiquement est une copie indépendante.

## Commits réalisés

| Commit | Description |
|---|---|
| `0944a9c` | Validation des distances et des charges |
| `b18cd2b` | Sécurisation de l'affectation et de la réserve de batterie |
| `f40cf74` | Contrôle des transitions et des annulations |
| `b39e931` | Protection des données publiques JavaScript et PHP |

## Risques résiduels et dette technique

La dette technique D-01 concerne l'absence de tests automatiques sur GitHub.

Cette amélioration est reportée car elle ne fait pas partie des fonctionnalités demandées dans ce TP.

Pour limiter les risques, les tests JavaScript et PHP ainsi que les contrôles Git sont exécutés manuellement avant la publication des modifications.

Les tests couvrent les scénarios demandés, sans garantir une couverture exhaustive de toutes les entrées possibles.

## Points à relire

1. Le contrôle de la réserve minimale de batterie dans `deployDrone`.
2. Les transitions interdites dans `advanceMission`.
3. L'annulation après déploiement dans `cancelMission`.
4. Les champs exposés dans les sorties publiques JavaScript et PHP.
5. L'absence de modification des objets d'origine.

## Revue / auto-revue

Une auto-revue a été préparée et documentée dans `docs/REVUE.md`.

Deux remarques concernent :

- Le respect de la limite de batterie à 50 et 51 points.
- La confidentialité des données publiques et la copie de l'historique.

Les tests correspondants sont réussis. Aucune modification supplémentaire du code n'a été nécessaire après cette auto-revue.

Aucune approbation GitHub par un relecteur externe n'est revendiquée.

## Livraison GitHub

**Dépôt source :** `badi763/RescueOps_B2_TP_FINAL`

**Branche source :** `TP_RescueOps_Rayane_Badi`

**Dépôt cible :** `jcrangon/RescueOps_B2_TP_FINAL`

**Branche cible :** `main`

**URL réelle de la Pull Request :** `https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/2`

**Statut :** Draft PR pendant la finalisation, puis Ready for review.

La Pull Request ne doit pas être fusionnée sans l'accord du formateur.