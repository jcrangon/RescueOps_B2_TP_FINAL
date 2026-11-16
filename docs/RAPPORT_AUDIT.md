# Rapport d'audit — RescueOps

Auteur : Israel Kokesha
Pseudo GitHub : Kasaialaprod
Date : 09/11/2026 (audit) — mis à jour le 15/11/2026 (preuves après correction)
Commit de base : `5e99359` (`5e99359aa7cb8ad6a79a67a02373300e8b5a6873`, `main` du dépôt formateur, obtenu par `git rev-parse --short main`)
Branche de travail : `tp_RescueOps_IsraKokesha` (fork `kasaialaprod/RescueOps_B2_TP_FINAL`)

## Synthèse par règle

| Règle | État S0 | Constats |
|---|---|---|
| RO-01 | Conforme (31 pts pour 5 km / 2 kg, 9 pts pour 1 km / 0 kg) | — |
| RO-02 | Non conforme | A-02 |
| RO-03 | Non conforme | A-03, A-04 |
| RO-04 | Non conforme | A-01 |
| RO-05 | Conforme sur le cas nominal (nouveaux objets, entrées intactes — T03/T04) | — |
| RO-06 | Non conforme | A-05 |
| RO-07 | Non conforme | A-06 |
| RO-08 | Non conforme | A-07 |
| RO-09 | Non conforme | A-07 |
| RO-10 | Couvert par ce rapport et les tests ajoutés | — |
| RO-11 | Voir `docs/PR_DESCRIPTION.md` et `docs/REVUE.md` | — |

## Constats

Toutes les sorties « obtenu S0 » ont été produites en exécutant les fonctions du commit `5e99359` avec Node.js v22 (script de reproduction ponctuel, hors dépôt) et `php` 8.3 pour la carte PHP. Données fictives du contrat (SOS-204, DR-07).

| ID | Règle RO | Fichier / fonction | Entrée, obtenu S0, attendu | Risque concret | Priorité P0/P1/P2 | Preuve du correctif (test / commit) |
|---|---|---|---|---|---|---|
| A-01 | RO-04 | `src/dispatch.js` — `deployDrone` | Mission 5 km / 2 kg (31 pts). Drone **35 pts** → obtenu : accepté, batterie **4**, `busy`. Drone **50 pts** → accepté, batterie **19**. Attendu : `RangeError` pour 35 et 50 (réserve < 20), sans mutation ; 51 pts accepté → **20**. Le script `npm run demo` affiche lui-même « ACCEPTÉ : réserve après départ = 4 (risque métier) ». | Drone envoyé sans la réserve contractuelle : dans la simulation, il ne peut pas garantir son retour. Défaut au cœur de « l'exécution sûre ». | **P0** — c'est la règle de sûreté principale du scénario ; aucun contrôle n'existe. | T13, T14, T15 (+ T31 après revue) — `tests/dispatch.test.js` — commits `7afbd3c`, `eb1b5f4`. Démo : « REFUSÉ : Insufficient battery: 35 - 31 = 4 < 20 ». |
| A-02 | RO-02 | `src/energy.js` — `estimateEnergy` | Aucune validation. Obtenu : `(0,2)` → 11 ; `(-1,2)` → 7 ; `(Infinity,2)` → `Infinity` ; `(NaN,2)` → `NaN` ; `("5",2)` → 31 (conversion implicite) ; `(null,2)` → 11 ; `(5,-1)` → 22 ; `(5,6)` → 43 ; `(5,5.01)` → 41 ; `(5,"2")` → 31. Attendu : `RangeError` avant calcul pour toutes ces entrées ; `(5,0)` → 25 et `(5,5)` → 40 restent acceptés. | Une distance négative donne une énergie faible ou **négative** (`-2 km, 0 kg` → `-3`) : la batterie **augmente** au déploiement. `NaN`/`Infinity` se propagent dans `batteryPoints`. Une charge hors limite est acceptée. | **P0** — l'énergie alimente directement la décision de déploiement (A-01) ; une valeur fausse contourne la réserve. | T09, T10, T11, T12 (`tests/energy.test.js`), T19 (`dispatch`) — commit `78d023e` |
| A-03 | RO-03 | `src/dispatch.js` — `deployDrone` | Statut du drone non vérifié. `createDrone('DR',70,'busy')` → obtenu : déployé, mission `en_route`. Idem `'maintenance'`. Attendu : `Error` sans mutation ; seul `available` est affectable. | Un même drone affecté à deux missions simultanées ; drone en maintenance envoyé en intervention. | **P0** — double affectation : une des deux missions n'est en réalité pas servie. | T16, T18 (`tests/dispatch.test.js`) — commit `7afbd3c` |
| A-04 | RO-03 | `src/dispatch.js` — `deployDrone` et `src/mission.js` — `advanceMission` | (a) Statut de mission non vérifié : redéploiement d'une mission `en_route` → historique `["planned","en_route","en_route"]` ; mission `canceled` → `["planned","canceled","en_route"]`. (b) `advanceMission(planned, "en_route")` → accepté, `["planned","en_route"]` **sans `droneId`**. Attendu : `Error` sans mutation dans les deux cas ; seul `deployDrone` fait passer `planned → en_route`. | Mission annulée relancée ; mission marquée en route sans drone ni débit de batterie ; second drone mobilisé pour une mission déjà servie. | **P0** — l'état de la mission ne reflète plus aucun drone réel ; contournement complet des contrôles A-01/A-03. | T17, T18, T20 (`dispatch`), T21 (`mission`) — commits `7afbd3c` et `bda4e37` |
| A-05 | RO-06 | `src/mission.js` — `advanceMission` | Seule l'appartenance à `KNOWN_STATUSES` est vérifiée. Obtenu : saut `planned → closed` et `en_route → closed` acceptés ; retour `on_site → en_route` → `[..., "on_site","en_route"]` ; répétition `on_site → on_site` acceptée ; `closed → en_route` et `canceled → en_route` acceptés. (Conforme : statut inconnu `"lost"` → `Error`.) Attendu : uniquement `en_route → on_site → returning → closed`, une étape à la fois ; sinon `Error` sans mutation. | Historique faux ou régressif ; mission clôturée ou annulée « ressuscitée » ; impossibilité de savoir où est le drone. | **P1** — contrat fonctionnel important ; pas de fuite ni de dépassement de réserve direct. | T22, T23, T24, T25 (`tests/mission.test.js`) — commit `bda4e37` |
| A-06 | RO-07 | `src/mission.js` — `cancelMission` | Seuls `closed`/`canceled` sont refusés. Obtenu : annulation de `en_route` → `["planned","en_route","canceled"]` ; de `on_site` → `[..., "on_site","canceled"]`. Attendu : annulation seulement depuis `planned` ; `Error` sans mutation sinon. | Mission déclarée annulée alors que le drone est en vol / sur place : le drone resterait `busy` sans mission suivie, et le retour n'est plus tracé. | **P1** — incohérence d'état importante ; la règle d'annulation est explicite au contrat. | T26, T27 (`tests/mission.test.js`) — commit `bda4e37` |
| A-07 | RO-08 / RO-09 | `src/public.js` — `getPublicStatus` ; `src/php/MissionCard.php` — `publicCard` | JS — clés obtenues : `id, status, history, contactEmail, gps, priority` ; `history` renvoyé **par référence** (un `push` sur la vue modifie l'historique interne). PHP — clés obtenues : `id, statusLabel, contactEmail, gps`. Attendu : JS exactement `id, status, history` (copie) ; PHP exactement `id, statusLabel`, libellés inchangés. | Fuite d'une donnée personnelle (courriel) et de la position GPS d'une intervention à toute personne consultant le suivi public ; altération de l'historique interne depuis la vue. | **P0** — donnée personnelle publique (critère P0 explicite de l'échelle). | T28, T29, T30 (`tests/public.test.js`), P04, P05, P06 (`tests/MissionCard.test.php`) — commit `1c2bbdf` |

## D-01 — Dette technique reportable

**Constat** : `MissionCard::publicCard` avec un statut absent de `LABELS` (ex. `"lost"`) émet `PHP Warning: Undefined array key "lost"` et renvoie `statusLabel => NULL`.

- **Risque** : un statut inattendu produirait une carte publique sans libellé et un avertissement dans les logs. Aucune donnée personnelle n'est exposée.
- **Raison du report** : RO-09 impose de « garder les libellés fournis » mais ne définit aucun libellé de repli ; en inventer un (« Inconnu ») ou lever une exception serait une décision de contrat, hors du périmètre de cette PR. Ce n'est pas un défaut bloquant pour la simulation.
- **Mesure compensatoire** : les seuls statuts produits par le code JS sont désormais ceux du cycle contrôlé (`planned`, `en_route`, `on_site`, `returning`, `closed`, `canceled`), qui ont tous un libellé ; le test P06 vérifie que ces six libellés existent et sont inchangés.
- **Priorité** : **P2** (différable, documentée).
- **Responsable / déclencheur de réévaluation** : formateur (propriétaire du contrat) ; à réévaluer dès qu'un nouveau statut est ajouté au cycle de mission ou qu'une source de données externe alimente la carte PHP.

Autre point noté, non retenu comme constat : `createMission` et `createDrone` ne valident pas leurs entrées. Le contrat indique explicitement qu'elles sont « supposées bien formées dans ce TP » ; la validation métier est faite dans `estimateEnergy` (appelée par `deployDrone`).

## Contrôles AVANT correction

Sur le commit `5e99359` (identique au contenu de `b02a56a` pour `src/` et `tests/`) :

```
$ npm test
# tests 8
# pass 8
# fail 0
$ php tests/MissionCard.test.php
OK P01 reference publique
OK P02 libelle correct
OK P03 entree interne intacte
Resultat PHP : 3 verifications conformes
$ php -l src/php/MissionCard.php
No syntax errors detected in src/php/MissionCard.php
$ npm run demo
...
--- Simulation à risque : drone avec 35 points ---
ACCEPTÉ : réserve après départ = 4 (risque métier)
```

Limites : les tests S0 ne couvrent que les cas positifs ; ils sont verts alors que A-01 à A-07 sont présents. Les sorties « obtenu S0 » du tableau proviennent d'un script de reproduction exécuté localement, non versionné ; les nouveaux tests T09–T31 et P04–P06 en sont la version permanente.

## Contrôles APRÈS correction

Sur la branche `tp_RescueOps_IsraKokesha` après le commit `eb1b5f4` (Node.js v22.23.4, PHP 8.3.6) :

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
Batterie au départ : 70 points
Énergie consommée : 31 points
Batterie après départ : 39 points
Mission : en_route
Vue publique : { "id": "SOS-204", "status": "en_route", "history": ["planned", "en_route"] }
Étape suivante : on_site
--- Simulation à risque : drone avec 35 points ---
REFUSÉ : Insufficient battery: 35 - 31 = 4 < 20 reserve points
```

**Preuve que les nouveaux tests sont révélateurs** : les tests actuels ont été exécutés contre les fichiers `src/` du commit S0 `5e99359` (copie de travail temporaire, `git checkout 5e99359 -- src`) : **19 échecs sur 30** JS (T09, T10, T13, T15–T30 ; T11, T12 et T14 sont des cas positifs et passent déjà) et le test PHP s'arrête sur **P04** (clés `contactEmail`, `gps` présentes). Après correction : 31/31 et 6/6.

**Non-régression** : T01–T08 et P01–P03 (tests S0) sont inchangés et verts ; le scénario nominal (31 pts, batterie 39, parcours complet jusqu'à `closed`, annulation d'une mission `planned`) est conservé. Signatures de fonctions inchangées.

Limites : tests unitaires uniquement (pas de test d'intégration bout en bout autre que `npm run demo`) ; versions de Node/PHP de mon poste ; la carte PHP n'est testée qu'avec des tableaux bien formés (voir D-01).

## Conclusion d'audit

Sept écarts au contrat ont été identifiés sur le code S0, dont cinq P0 (réserve de batterie, validation de l'énergie, statut du drone, statut de la mission, fuite de données personnelles) et deux P1 (transitions, annulation). Les sept sont corrigés dans des commits séparés, chacun accompagné de tests qui échouaient sur S0 et passent désormais ; les tests d'origine restent verts. RO-01 (formule) et `docs/REGLES_METIER.md` n'ont pas été modifiés. Une dette P2 (D-01 : statut inconnu dans la carte PHP) est différée et documentée avec une mesure compensatoire. Limite résiduelle hors contrat : aucun mécanisme ne libère un drone `busy` après clôture de mission (voir `docs/REVUE.md`, R-02).
