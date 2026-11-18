# Trace de revue — RescueOps

**Auteur :** Rayane Badi
**Pseudo GitHub :** Badi763
**Date :** 18/11/2026
**Branche :** `audit/rescueops`
**Type de revue :** Auto-revue
**URL de la PR :** (https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/6)

## R-01 — Vérification de la réserve de batterie

**Fichier :** `src/dispatch.js`
**Fonction :** `deployDrone`
**Règle concernée :** RO-04

### Remarque

Le contrôle de la batterie doit respecter exactement la limite de 20 points de réserve.

Pour une mission qui consomme 31 points :

- Un drone avec 50 points doit être refusé.
- Un drone avec 51 points doit être accepté.

Une erreur dans la comparaison pourrait autoriser un départ avec une batterie insuffisante.

### Demande proposée

Vérifier les deux valeurs limites et s'assurer qu'un départ refusé ne modifie pas les objets d'origine.

### Réponse de l'auteur

La condition utilisée est :

`drone.batteryPoints - energyUsed < 20`

Cette condition refuse le départ lorsque la batterie restante serait inférieure à 20 points.

Les tests T12 et T13 vérifient les valeurs 35, 50 et 51 points.

### Vérification et verdict

Les tests T12 et T13 réussissent.

Les objets d'origine ne sont pas modifiés lors d'un refus.

**Verdict :** Conforme aux exigences RO-04 et RO-05 pour les scénarios testés.

Aucune correction supplémentaire nécessaire.

---

## R-02 — Confidentialité des données publiques

**Fichiers :**

- `src/public.js`
- `src/php/MissionCard.php`

**Fonctions :**

- `getPublicStatus`
- `MissionCard::publicCard`

**Règles concernées :** RO-08 et RO-09

### Remarque

Les sorties publiques ne doivent pas afficher les informations internes d'une mission.

En JavaScript, seuls les champs suivants sont autorisés :

- `id`
- `status`
- `history`

En PHP, seuls les champs suivants sont autorisés :

- `id`
- `statusLabel`

Le tableau `history` JavaScript doit également être indépendant de celui de la mission d'origine.

### Risque

Une sortie publique mal contrôlée pourrait révéler l'adresse email du contact ou les coordonnées GPS.

Un tableau d'historique partagé pourrait également permettre une modification involontaire des données internes.

### Demande proposée

Vérifier la liste exacte des clés renvoyées en JavaScript et PHP.

Vérifier également que la modification de l'historique public ne change pas celui de la mission d'origine.

### Réponse de l'auteur

La fonction JavaScript renvoie uniquement les trois champs autorisés et crée une copie de l'historique.

La fonction PHP renvoie uniquement `id` et `statusLabel`.

Les tests T19, P04 et P05 couvrent ces comportements.

### Vérification et verdict

Le test JavaScript T19 réussit.

Les 10 vérifications PHP sont conformes.

La syntaxe du fichier PHP a également été vérifiée.

**Verdict :** Conforme aux règles RO-08 et RO-09 pour les scénarios testés.

Aucune correction supplémentaire nécessaire.

---

## Vérifications après auto-revue

Les commandes suivantes ont été exécutées :

| Commande | Résultat |
|---|---|
| `npm test` | 19 tests réussis, 0 échec |
| `php tests/MissionCard.test.php` | 10 vérifications conformes |
| `php -l src/php/MissionCard.php` | Aucune erreur de syntaxe |
| `npm run demo` | Départ à 70 points accepté, départ à 35 points refusé |
| `git diff --check` | Aucune erreur signalée |

## Modifications après revue

Les deux remarques ont été vérifiées grâce aux tests déjà ajoutés.

Aucune modification supplémentaire du code n'a été nécessaire après cette auto-revue.

## Verdict final

L'auto-revue est favorable pour les scénarios vérifiés.

Les corrections apportées répondent aux anomalies identifiées dans le rapport d'audit.

Les tests JavaScript et les vérifications PHP réussissent.

Cette auto-revue ne constitue pas une approbation GitHub par un pair extérieur.

Une revue externe pourra être demandée si le formateur le souhaite.

La Pull Request doit rester ouverte et ne pas être fusionnée sans accord du formateur.