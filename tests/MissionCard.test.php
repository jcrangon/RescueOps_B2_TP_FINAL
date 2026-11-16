<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/php/MissionCard.php';

function checkSame(mixed $expected, mixed $actual, string $label): void
{
    if ($expected !== $actual) {
        throw new RuntimeException($label . ': attendu ' . var_export($expected, true) . ', obtenu ' . var_export($actual, true));
    }
    echo 'OK ' . $label . PHP_EOL;
}

$mission = [
    'id' => 'SOS-204',
    'status' => 'on_site',
    'contactEmail' => 'famille@example.test',
    'gps' => ['lat' => 45.1201, 'lon' => 5.7123],
];
$card = MissionCard::publicCard($mission);
checkSame('SOS-204', $card['id'], 'P01 reference publique');
checkSame('Sur place', $card['statusLabel'], 'P02 libelle correct');
checkSame('famille@example.test', $mission['contactEmail'], 'P03 entree interne intacte');

// A-07 (RO-09) : carte limitee a id et statusLabel.
checkSame(['id', 'statusLabel'], array_keys($card), 'P04 A-07 cles exactes id et statusLabel');
checkSame(false, array_key_exists('contactEmail', $card) || array_key_exists('gps', $card), 'P05 A-07 ni contact ni GPS');

// Les libelles fournis sont conserves.
$labels = [
    'planned' => 'Planifiée', 'en_route' => 'En route', 'on_site' => 'Sur place',
    'returning' => 'Retour en cours', 'closed' => 'Terminée', 'canceled' => 'Annulée',
];
foreach ($labels as $status => $label) {
    checkSame($label, MissionCard::publicCard(['status' => $status] + $mission)['statusLabel'], 'P06 libelle ' . $status);
}
echo 'Resultat PHP : toutes les verifications conformes' . PHP_EOL;
