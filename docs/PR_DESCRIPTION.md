# [RescueOps] Description complète de PR à remplir

## Problème observé

Les 8 tests JS et 3 vérifications PHP de départ passaient, mais plusieurs bugs restaient : départ avec trop peu de batterie, étapes sautées, annulation après départ et e-mail/GPS visibles publiquement. Cette PR corrige les 7 problèmes du rapport. La formule d'énergie et les libellés PHP restent les mêmes.

## Exigences traitées : RO-xx et constats A-xx

- A-01 / RO-02 -> distance et charge valides, sinon `RangeError`.
- A-02 / RO-03/05 -> drone disponible, mission planifiée, nouveaux objets.
- A-03 / RO-04 -> réserve de 20 points minimum : 50 refusé, 51 accepté pour un coût de 31.
- A-04 / RO-03/06 -> départ avec un drone obligatoire, puis étapes dans l'ordre.
- A-05 / RO-07 -> annulation seulement depuis `planned`.
- A-06 / RO-08 -> suivi JS limité à `id`, `status`, copie de `history`.
- A-07 / RO-09 -> carte PHP limitée à `id`, `statusLabel`.
- RO-01 conservée ; RO-10/11 -> rapport, résultats des tests et auto-revue dans la même PR.

## Correctifs (fichier / fonction / comportement)

- `src/energy.js`, `estimateEnergy` -> 2 conditions avant le calcul.
- `src/dispatch.js`, `deployDrone` -> vérifier les statuts et la réserve avant le départ.
- `src/mission.js` -> tableau des 3 transitions autorisées ; annulation limitée à `planned`.
- `src/public.js` -> retirer les données privées et copier l'historique.
- `src/php/MissionCard.php` -> retirer contact et GPS.
- `tests/` -> anciens tests conservés, nouveaux tests pour montrer les bugs avant de les corriger.
- `docs/` -> rapport, dette D-01, résultats et auto-revue remplis. Un commit par correction.

## Tests réellement exécutés : commandes et résultats

Avant chaque correction -> les tests ont montré le bug. Les échecs sont notés dans le rapport.

| Commande | Résultat final |
|---|---|
| `npm.cmd test -- --test-reporter=spec` | 33 tests JS réussis, 0 échec. |
| `php tests/MissionCard.test.php` | 11 vérifications conformes. |
| `php -l src/php/MissionCard.php` | Syntaxe valide. |
| `php -l tests/MissionCard.test.php` | Syntaxe valide. |
| `npm.cmd run demo` | Coût 31, batterie 39, départ à 35 refusé, suivi sans données privées. |
| `git diff 5e99359 --check` | Aucune erreur. |

Sous PowerShell, `npm.cmd` évite le blocage de `npm.ps1`.

## Non-régression / objets non mutés

Les anciens tests sont conservés. Les coûts restent à 31 et 9 points dans les exemples du TP. Les charges de 0 et 5 kg sont acceptées, et les 6 libellés PHP sont vérifiés. Départ, changement de statut et annulation -> les objets de départ restent inchangés, même en cas d'erreur. Modifier l'historique public ne change pas celui de la mission.

## Risques résiduels et dette D-01

Pas de tests automatiques sur GitHub (CI) -> P2. En attendant, lancer les tests sur le PC avant chaque livraison. À revoir avant la prochaine livraison ou un travail en équipe. Aucun P0 laissé de côté. Pas de relecture par un autre élève ; le TP suppose que les données de `createMission` et `createDrone` sont correctes.

## Points précis à relire

- Réserve : `< 20` doit refuser ; exactement 20 doit passer.
- `planned -> en_route` doit passer uniquement par `deployDrone`.
- Les vues publiques ne doivent exposer aucun champ privé.

## Modifications faites après revue (dans cette même PR)

Auto-revue avec l'aide d'une IA, notée dans `REVUE.md` -> 2 tests ajoutés (`27a617a`) : refus du départ avec une distance ou une charge interdite, et suivi public après un vrai départ. Les deux passent. Pas de relecture par un autre élève ni d'approbation GitHub.

## Preuve de livraison
URL réelle : https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/1
Branche source dans mon fork : `L3criminio:TP_RescueOps_Gregory_Compastie`
Branche cible dans le dépôt du formateur : `jcrangon/RescueOps_B2_TP_FINAL:main`
Statut final de la PR : Ready for review, ouverte et non fusionnée.
