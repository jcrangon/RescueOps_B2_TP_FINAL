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

// --- RO-09 / A-07 : carte publique sans donnée interne ---
$keys = array_keys($card);
sort($keys);
checkSame(['id', 'statusLabel'], $keys, 'P04 cles exactement id et statusLabel');

$json = json_encode($card, JSON_THROW_ON_ERROR);
checkSame(false, str_contains($json, 'famille@example.test') || str_contains($json, '45.1201') || str_contains($json, '5.7123'), 'P05 ni contact ni GPS publies');

$labels = [
    'planned' => 'Planifiée',
    'en_route' => 'En route',
    'on_site' => 'Sur place',
    'returning' => 'Retour en cours',
    'closed' => 'Terminée',
    'canceled' => 'Annulée',
];
foreach ($labels as $status => $label) {
    $c = MissionCard::publicCard(['id' => 'SOS-204', 'status' => $status] + $mission);
    if ($c['statusLabel'] !== $label) {
        throw new RuntimeException("P06 libelle $status : attendu $label, obtenu " . var_export($c['statusLabel'], true));
    }
}
echo 'OK P06 six libelles du contrat conserves' . PHP_EOL;
echo 'Resultat PHP : 6 verifications conformes' . PHP_EOL;
