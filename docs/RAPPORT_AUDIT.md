# Rapport d'audit — RescueOps

**Auteur :** Rayane Badi
**Pseudo GitHub :** Badi763
**Date de l'audit :** 09/11/2026
**Mise à jour des preuves :** 18/11/2026
**Commit de base :** `5e99359aa7cb8ad6a79a67a02373300e8b5a6873`
**Branche de correction :** `TP_RescueOps_Rayane_Badi`

## Constats d'audit

| ID | Règle RO | Fichier / fonction | Entrée, obtenu S0, attendu | Risque concret | Priorité P0/P1/P2 | Preuve du correctif (test / commit) |
|---|---|---|---|---|---|---|
| A-01 | RO-02 | `src/energy.js` / `estimateEnergy` | Distance 0, charge 2 : S0 renvoie 11. Distance `Infinity` : S0 renvoie `Infinity`. Distance 5 km, charge 5.1 kg : S0 renvoie 41. Attendu : `RangeError` dans les trois cas. | Le calcul accepte des valeurs hors des limites prévues. | P1 — validation fonctionnelle importante. | Tests T09, T10, T11 réussis dans `tests/energy.test.js`. Commit `0944a9c`. |
| A-02 | RO-04 | `src/dispatch.js` / `deployDrone` | Mission de 5 km, 2 kg, coût de 31 points. Avec 35 points, S0 autorise le départ avec 4 points restants. Attendu : refus. Avec 50 points : refus ; avec 51 points : acceptation et 20 points restants. | Un drone peut être affecté avec une réserve inférieure au minimum de 20 points. | P0 — départ risqué dans la simulation. | Tests T12 (35 et 50 refusés) et T13 (51 accepté) réussis. Commit `b18cd2b`. |
| A-03 | RO-03 | `src/dispatch.js` / `deployDrone` | S0 accepte un drone déjà `busy` ou une mission déjà `en_route`. Attendu : lever une erreur avant toute modification des entrées. | Une deuxième affectation peut être enregistrée par erreur. | P0 — incohérence bloquante pour l'affectation. | Tests T14 et T15 : refus et absence de mutation. Commit `b18cd2b`. |
| A-04 | RO-06 | `src/mission.js` / `advanceMission` | S0 accepte `planned` → `closed` et `en_route` → `closed`. Attendu : progression uniquement `en_route` → `on_site` → `returning` → `closed`, une étape à la fois. | Une mission peut être clôturée sans avoir suivi les étapes prévues. | P1 — cycle métier incorrect. | Tests T06, T16 et T17 : parcours normal, refus des sauts, répétitions et retours. Commit `f40cf74`. |
| A-05 | RO-07 | `src/mission.js` / `cancelMission` | S0 permet d'annuler une mission `en_route`. Attendu : annulation possible seulement depuis `planned`. | Le suivi peut présenter comme annulée une mission déjà commencée. | P1 — statut incohérent. | Tests T07 et T18 : annulation initiale autorisée, refus après départ ou fin de mission et absence de mutation. Commit `f40cf74`. |
| A-06 | RO-08 | `src/public.js` / `getPublicStatus` | S0 renvoie `id`, `status`, `history`, `contactEmail`, `gps` et `priority`. Le tableau `history` est partagé avec la mission. Attendu : exactement `id`, `status`, `history` avec une copie de l'historique. | Divulgation d'informations internes et risque de modification de l'historique par la sortie publique. | P0 — confidentialité. | Test T19 : clés exactes et copie indépendante de `history`. Commit `b39e931`. |
| A-07 | RO-09 | `src/php/MissionCard.php` / `publicCard` | S0 renvoie `id`, `statusLabel`, `contactEmail` et `gps`. Attendu : exactement `id` et `statusLabel`. | L'email du contact et le GPS apparaissent sur la carte publique. | P0 — confidentialité. | Tests PHP P04 et P05 : clés exactes et libellés. `php tests/MissionCard.test.php` : 10 vérifications conformes. Commit `b39e931`. |

## D-01 — Dette technique reportable

Le dépôt ne lance pas automatiquement les tests sur GitHub. Sans contrôle automatique, un futur changement pourrait introduire une régression sans être détecté avant la mise en ligne.

La mise en place d'une CI est reportée car elle n'est pas demandée dans ce TP. En attendant, les contrôles manuels sont :

```bash
npm test
php tests/MissionCard.test.php
php -l src/php/MissionCard.php
npm run demo
git diff --check
```

**Responsable :** Rayane Badi. **Réévaluation :** si le formateur demande l'automatisation, ou si le projet doit être réutilisé.

## Contrôles AVANT correction

Sur la version de départ S0 :

- `npm test` : 8 tests JavaScript réussis. Ils ne couvraient pas tous les scénarios interdits.
- `npm run demo` : avec 35 points au départ et 31 points consommés, le déploiement était accepté et il restait seulement 4 points.
- La sortie publique JavaScript contenait l'email, le GPS et la priorité.
- Les cas A-01 à A-06 ont été reproduits avec les entrées précisées dans le tableau ; pour A-07, les champs non autorisés étaient visibles dans le code PHP initial.
- Aucune exécution des tests PHP avant la correction n'est revendiquée dans ce rapport.

## Contrôles APRÈS correction

Commandes et résultats réellement observés sur le projet corrigé :

| Commande | Résultat |
|---|---|
| `npm test` | **19 tests réussis**, 0 échec. Les 8 scénarios initiaux restent verts. |
| `php tests/MissionCard.test.php` | **10 vérifications conformes**, y compris les clés publiques exactes et les six libellés. |
| `php -l src/php/MissionCard.php` | `No syntax errors detected in src/php/MissionCard.php`. |
| `npm run demo` | Départ avec 70 points autorisé, consommation 31, batterie restante 39. Départ avec 35 points refusé. |
| `git diff --check` | Aucune erreur signalée lors du contrôle. |

La sortie publique JavaScript après déploiement présente seulement `id`, `status` et `history`. Les tests T04, T12 à T15, T17 et T18 vérifient l'absence de mutation pour les scénarios couverts. Le test T19 vérifie la copie de l'historique public.

## Conclusion d'audit

Les sept anomalies A-01 à A-07 ont été corrigées. Les tests JavaScript, les contrôles PHP, la syntaxe PHP et la démonstration ont été vérifiés avec succès. Les modifications sont enregistrées dans quatre commits de correction sur la branche `TP_RescueOps_Rayane_Badi`.

Il reste à intégrer le présent rapport mis à jour dans cette branche, terminer la description de la Pull Request et l'auto-revue, puis vérifier la PR réelle du fork `badi763/RescueOps_B2_TP_FINAL` vers la branche `main` du dépôt du formateur. La PR ne doit pas être fusionnée sans son accord.
