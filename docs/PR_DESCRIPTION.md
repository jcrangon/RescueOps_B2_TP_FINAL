# [RescueOps] Audit et correctifs : réserve batterie, énergie, affectation, cycle de mission, confidentialité

## Problème observé

Sur la base S0 (`5e99359`), les 8 tests JS et 3 vérifications PHP sont verts, mais le contrat `docs/REGLES_METIER.md` n'est pas respecté :

- un drone à **35 points** part quand même et finit à **4 points** (`npm run demo` affiche « ACCEPTÉ … (risque métier) ») ;
- `estimateEnergy` accepte distance nulle/négative, `NaN`, `Infinity`, chaînes, charge hors 0–5 kg (une distance négative peut même **augmenter** la batterie) ;
- un drone `busy`/`maintenance` peut être déployé, une mission déjà `en_route` ou `canceled` peut être redéployée, et `advanceMission` permet `planned → en_route` sans drone ;
- `advanceMission` accepte sauts, retours, répétitions et transitions depuis `closed`/`canceled` ;
- `cancelMission` annule une mission en vol ;
- le suivi public JS et la carte PHP exposent `contactEmail`, `gps` (et `priority` en JS) ; `history` est partagé par référence.

## Exigences traitées : RO-xx et constats A-xx

| Constat | Règle | Priorité | Commit |
|---|---|---|---|
| A-01 réserve de 20 points non contrôlée | RO-04 | P0 | `7afbd3c` |
| A-02 validation distance / charge absente | RO-02 | P0 | `78d023e` |
| A-03 drone non disponible déployé | RO-03 | P0 | `7afbd3c` |
| A-04 mission non planifiée déployée / `planned → en_route` hors `deployDrone` | RO-03 | P0 | `7afbd3c`, `bda4e37` |
| A-05 transitions non contrôlées | RO-06 | P1 | `bda4e37` |
| A-06 annulation après déploiement | RO-07 | P1 | `bda4e37` |
| A-07 fuite contact / GPS / priorité (JS + PHP), historique partagé | RO-08, RO-09 | P0 | `1c2bbdf` |
| D-01 statut inconnu dans `MissionCard` (warning + `null`) | RO-09 | P2, **différé** | documenté |

Détail complet (entrées, obtenu S0, attendu, risque, preuve) : `docs/RAPPORT_AUDIT.md`.

## Correctifs (fichier / fonction / comportement)

- `src/energy.js` — `estimateEnergy` : `RangeError` avant calcul si `distanceKm` n'est pas un `number` fini `> 0` ou si `payloadKg` n'est pas un `number` fini dans `[0, 5]`. **Formule RO-01 inchangée.**
- `src/dispatch.js` — `deployDrone` : dans l'ordre, `Error` si drone ≠ `available`, `Error` si mission ≠ `planned`, `RangeError` (via `estimateEnergy`) si données invalides, `RangeError` si `batterie − énergie < 20` (`MIN_RESERVE_POINTS`). Tous les refus ont lieu avant toute construction d'objet. En cas de succès, nouveaux objets (copie de `gps` et `history`).
- `src/mission.js` — `advanceMission` : table `NEXT_STATUS` (`en_route → on_site → returning → closed`) ; toute autre transition lève `Error`, y compris `planned → en_route` (réservée à `deployDrone`). `cancelMission` : uniquement depuis `planned`.
- `src/public.js` — `getPublicStatus` : exactement `id`, `status`, `history` (copie).
- `src/php/MissionCard.php` — `publicCard` : exactement `id`, `statusLabel` ; libellés inchangés.
- Signatures des fonctions exportées inchangées ; `docs/REGLES_METIER.md` non modifié.

## Tests réellement exécutés : commandes et résultats

Node.js v22.23.4, PHP 8.3.6, après le commit `eb1b5f4` :

```
$ npm test
# tests 31
# pass 31
# fail 0
$ php tests/MissionCard.test.php
OK P01 reference publique
OK P02 libelle correct
OK P03 entree interne intacte
OK P04 cles exactement id et statusLabel
OK P05 ni contact ni GPS publies
OK P06 six libelles du contrat conserves
Resultat PHP : 6 verifications conformes
$ php -l src/php/MissionCard.php
No syntax errors detected in src/php/MissionCard.php
$ git diff --check
(aucune sortie)
$ npm run demo
...
Batterie après départ : 39 points
--- Simulation à risque : drone avec 35 points ---
REFUSÉ : Insufficient battery: 35 - 31 = 4 < 20 reserve points
```

Contre-épreuve : les mêmes tests lancés sur les fichiers `src/` de S0 donnent **19 échecs / 30** côté JS et un arrêt sur **P04** côté PHP — les nouveaux tests détectent bien les défauts.

Nouveaux tests : T09–T12 (énergie), T13–T20 + T31 (déploiement), T21–T27 (cycle et annulation), T28–T30 (vue publique JS), P04–P06 (carte PHP).

## Non-régression / objets non mutés

- T01–T08 et P01–P03 d'origine inchangés et verts (31 pts, batterie 39, parcours complet, annulation d'une mission `planned`).
- Chaque refus est testé **sans mutation** des entrées par comparaison `structuredClone` avant/après : T15 (réserve), T18 (statuts), T19 (données invalides), T25 (transition), T27 (annulation), T31 (batterie invalide).
- Succès sans partage de référence : T04 (entrées intactes), T20 (`gps`/`history` copiés), T29 (vue publique).

## Risques résiduels et dette D-01

- **D-01 (P2, différé)** : `MissionCard::publicCard` avec un statut hors contrat émet un `Warning` et renvoie `statusLabel = null`. Le contrat ne définit pas de libellé de repli ; compensé par le fait que seuls les six statuts contrôlés peuvent être produits (P06). À réévaluer à l'ajout d'un statut.
- **Hors contrat** : aucun mécanisme ne remet un drone `available` après clôture de mission (voir REVUE R-02).
- `createMission` / `createDrone` ne valident pas leurs entrées (supposées bien formées par le contrat).

## Points précis à relire

1. `src/dispatch.js` — ordre des contrôles dans `deployDrone` : erreurs de statut (`Error`) avant les erreurs de valeur (`RangeError`). Est-ce le bon choix quand les deux sont fausses à la fois ?
2. `src/dispatch.js` — condition `!(remaining >= MIN_RESERVE_POINTS)` plutôt que `remaining < MIN_RESERVE_POINTS` : volontaire, pour refuser aussi un résultat `NaN`.
3. `src/mission.js` — absence de `planned` dans `NEXT_STATUS` (RO-03).
4. `tests/MissionCard.test.php` — P05 vérifie l'absence des valeurs sensibles dans le JSON, en plus des clés (P04).

## Modifications faites après revue (dans cette même PR)

Auto-revue (aucun pair disponible), détaillée dans `docs/REVUE.md` :

- **R-01** → ajout de **T31** (commit `eb1b5f4`) : drone à batterie `NaN` ou absente refusé par `RangeError` sans mutation.
- **R-02** → non retenu comme correctif (hors contrat) ; documenté comme risque résiduel.

## Preuve de livraison
URL réelle : _à compléter avec l'URL de la PR GitHub après ouverture_
Branche source dans mon fork : `kasaialaprod/RescueOps_B2_TP_FINAL` : `tp_RescueOps_IsraKokesha`
Branche cible dans le dépôt du formateur : `jcrangon/RescueOps_B2_TP_FINAL` : `main`
Statut final de la PR : _à compléter (Draft → Ready for review), non mergée_
