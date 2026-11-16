<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/php/MissionCard.php';

$checked = 0;

function checkSame(mixed $expected, mixed $actual, string $label): void
{
    global $checked;
    if ($expected !== $actual) {
        throw new RuntimeException($label . ': attendu ' . var_export($expected, true) . ', obtenu ' . var_export($actual, true));
    }
    $checked++;
    echo 'OK ' . $label . PHP_EOL;
}

$mission = [
    'id' => 'SOS-204',
    'status' => 'on_site',
    'contactEmail' => 'famille@example.test',
    'gps' => ['lat' => 45.1201, 'lon' => 5.7123],
];
$before = $mission;
$card = MissionCard::publicCard($mission);
checkSame('SOS-204', $card['id'], 'P01 reference publique');
checkSame('Sur place', $card['statusLabel'], 'P02 libelle correct');
checkSame('famille@example.test', $mission['contactEmail'], 'P03 entree interne intacte');
checkSame(['id' => 'SOS-204', 'statusLabel' => 'Sur place'], $card, 'P04 RO-09 champs publics exacts');

foreach ([
    'planned' => 'Planifiée',
    'en_route' => 'En route',
    'on_site' => 'Sur place',
    'returning' => 'Retour en cours',
    'closed' => 'Terminée',
    'canceled' => 'Annulée',
] as $status => $label) {
    $result = MissionCard::publicCard([...$mission, 'status' => $status]);
    checkSame($label, $result['statusLabel'], "P05 RO-09 libelle $status");
}
checkSame($before, $mission, 'P06 RO-09 mission interne intacte');

echo "Resultat PHP : $checked verifications conformes" . PHP_EOL;
