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
            'id'                  => $ticket['1'] ?? $ticket['id'] ?? null,
            'title'               => $ticket['2'] ?? '',
            'entity'              => $ticket['80'] ?? '',
            'status'              => $ticket['12'] ?? '',
            'opening_date'        => $ticket['15'] ?? '',
            'last_update'         => $ticket['19'] ?? '',
            'priority'            => $ticket['3'] ?? '',
            'requester'           => $ticket['4'] ?? '',
            'assigned_technician' => $ticket['5'] ?? '',
            'category'            => $ticket['7'] ?? '',
            'description'         => $ticket['21'] ?? '',
        ];
    }
}
