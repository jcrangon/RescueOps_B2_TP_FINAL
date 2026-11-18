<?php
declare(strict_types=1);

final class MissionCard
{
    private const LABELS = [
        'planned' => 'Planifiée',
        'en_route' => 'En route',
        'on_site' => 'Sur place',
        'returning' => 'Retour en cours',
        'closed' => 'Terminée',
        'canceled' => 'Annulée',
    ];

    /**
     * RO-09 : carte publique limitée à id et statusLabel.
     * contactEmail et gps restent internes.
     */
    public static function publicCard(array $mission): array
    {
        return [
            'id' => $mission['id'],
            'statusLabel' => self::LABELS[$mission['status']],
        ];
    }
}
