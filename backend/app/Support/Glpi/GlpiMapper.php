<?php

namespace App\Support\Glpi;

class GlpiMapper
{
    public static function entity(array $entity): array
    {
        return [
            'id'   => $entity['id'] ?? null,
            'name' => $entity['completename'] ?? $entity['name'] ?? null,
        ];
    }

    public static function category(array $category): array
    {
        return [
            'id'   => $category['id'] ?? null,
            'name' => $category['completename'] ?? $category['name'] ?? null,
        ];
    }

    public static function requester(array $user): array
    {
        $id    = $user['1'] ?? $user['id'] ?? null;
        $login = $user['2'] ?? '';
        $name  = $user['34'] ?? $user['9'] ?? $login ?? "Usuario {$id}";
        $email = $user['5'] ?? '';

        return [
            'id'    => $id,
            'name'  => $name,
            'login' => $login,
            'email' => $email,
        ];
    }

    public static function newTicket(array $ticket): array
    {
        return [
            'id'                  => $ticket['2'] ?? $ticket['id'] ?? null,
            'title'               => $ticket['1'] ?? '',
            'entity'              => $ticket['80'] ?? '',
            'status'              => $ticket['12'] ?? '',
            'opening_date'        => $ticket['15'] ?? '',
            'last_update'         => $ticket['19'] ?? '',
            'priority'            => $ticket['3'] ?? '',
            'requester'           => self::resolveUserField($ticket['4'] ?? ''),
            'assigned_technician' => self::resolveUserField($ticket['5'] ?? ''),
            'category'            => $ticket['7'] ?? '',
            'description'         => $ticket['21'] ?? '',
        ];
    }

    /**
     * GLPI puede devolver el campo usuario como:
     *   - string  (nombre expandido)
     *   - integer (ID cuando expand_dropdowns no expande el campo)
     *   - array   (múltiples usuarios)
     */
    private static function resolveUserField(mixed $value): string
    {
        if (is_array($value)) {
            return implode(', ', array_filter(array_map('strval', $value)));
        }

        return (string) ($value ?? '');
    }
}
