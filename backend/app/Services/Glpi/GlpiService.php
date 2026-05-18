<?php

namespace App\Services\Glpi;

use App\Support\Glpi\GlpiMapper;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GlpiService
{
    private string $url;
    private string $appToken;
    private string $userToken;
    private bool   $sslVerify;
    private int    $timeout;

    public function __construct()
    {
        $this->url       = config('glpi.url');
        $this->appToken  = config('glpi.app_token');
        $this->userToken = config('glpi.user_token');
        $this->sslVerify = (bool) config('glpi.ssl_verify', true);
        $this->timeout   = (int) config('glpi.timeout', 30);

        if (empty($this->url) || empty($this->appToken) || empty($this->userToken)) {
            throw new RuntimeException('Faltan variables de configuración GLPI en el archivo .env.');
        }
    }

    // -------------------------------------------------------------------------
    // Sesión
    // -------------------------------------------------------------------------

    public function initSession(): string
    {
        $response = Http::withHeaders($this->headersWithoutSession())
            ->timeout($this->timeout)
            ->withOptions(['verify' => $this->sslVerify])
            ->get("{$this->url}/initSession");

        if ($response->failed()) {
            throw new RuntimeException(
                "Error iniciando sesión en GLPI: {$response->status()} - " .
                $this->sanitizeError($response->body())
            );
        }

        return $response->json('session_token');
    }

    public function killSession(string $sessionToken): void
    {
        try {
            Http::withHeaders($this->headersWithSession($sessionToken))
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->get("{$this->url}/killSession");
        } catch (\Throwable) {
            // Cierre de sesión silencioso
        }
    }

    // -------------------------------------------------------------------------
    // Headers
    // -------------------------------------------------------------------------

    public function headersWithoutSession(): array
    {
        return [
            'App-Token'     => $this->appToken,
            'Authorization' => "user_token {$this->userToken}",
            'Content-Type'  => 'application/json',
        ];
    }

    public function headersWithSession(string $sessionToken): array
    {
        return [
            'App-Token'     => $this->appToken,
            'Session-Token' => $sessionToken,
            'Content-Type'  => 'application/json',
        ];
    }

    // -------------------------------------------------------------------------
    // Entidades
    // -------------------------------------------------------------------------

    public function getEntities(): array
    {
        $sessionToken = $this->initSession();

        try {
            $response = Http::withHeaders($this->headersWithSession($sessionToken))
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->get("{$this->url}/Entity", [
                    'range'            => '0-999',
                    'sort'             => 'completename',
                    'order'            => 'ASC',
                    'expand_dropdowns' => 'true',
                ]);

            if ($response->failed()) {
                throw new RuntimeException(
                    "Error obteniendo entidades: {$response->status()} - " .
                    $this->sanitizeError($response->body())
                );
            }

            $entities = collect($response->json())
                ->map(fn ($e) => GlpiMapper::entity($e))
                ->filter(fn ($e) => $e['id'] && $e['name'])
                ->sortBy(fn ($e) => strtolower($e['name']))
                ->values()
                ->toArray();

            return $entities;

        } finally {
            $this->killSession($sessionToken);
        }
    }

    // -------------------------------------------------------------------------
    // Categorías
    // -------------------------------------------------------------------------

    public function getCategories(): array
    {
        $sessionToken = $this->initSession();

        try {
            $response = Http::withHeaders($this->headersWithSession($sessionToken))
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->get("{$this->url}/ITILCategory", [
                    'range'            => '0-999',
                    'sort'             => 'completename',
                    'order'            => 'ASC',
                    'expand_dropdowns' => 'true',
                ]);

            if ($response->failed()) {
                return [];
            }

            return collect($response->json())
                ->map(fn ($c) => GlpiMapper::category($c))
                ->filter(fn ($c) => $c['id'] && $c['name'])
                ->sortBy(fn ($c) => strtolower($c['name']))
                ->values()
                ->toArray();

        } finally {
            $this->killSession($sessionToken);
        }
    }

    // -------------------------------------------------------------------------
    // Solicitantes por entidad
    // -------------------------------------------------------------------------

    public function getRequestersByEntity(int $entityId): array
    {
        $sessionToken = $this->initSession();

        try {
            $response = Http::withHeaders($this->headersWithSession($sessionToken))
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->get("{$this->url}/search/User", [
                    'criteria[0][field]'       => '80',
                    'criteria[0][searchtype]'  => 'equals',
                    'criteria[0][value]'       => (string) $entityId,
                    'forcedisplay[0]'          => '1',
                    'forcedisplay[1]'          => '2',
                    'forcedisplay[2]'          => '9',
                    'forcedisplay[3]'          => '34',
                    'forcedisplay[4]'          => '5',
                    'forcedisplay[5]'          => '80',
                    'sort'                     => '2',
                    'order'                    => 'ASC',
                    'range'                    => '0-500',
                    'expand_dropdowns'         => 'true',
                ]);

            if ($response->failed()) {
                throw new RuntimeException(
                    "Error obteniendo usuarios de la entidad: {$response->status()} - " .
                    $this->sanitizeError($response->body())
                );
            }

            $data = $response->json('data', []);

            return collect($data)
                ->map(fn ($u) => GlpiMapper::requester($u))
                ->filter(fn ($u) => $u['id'])
                ->sortBy(fn ($u) => strtolower($u['name']))
                ->values()
                ->toArray();

        } finally {
            $this->killSession($sessionToken);
        }
    }

    // -------------------------------------------------------------------------
    // Crear ticket
    // -------------------------------------------------------------------------

    public function createTicket(array $data): array
    {
        $sessionToken = $this->initSession();

        try {
            $payload = [
                'input' => [
                    'name'        => trim($data['title']),
                    'content'     => nl2br(htmlspecialchars(trim($data['description']), ENT_QUOTES, 'UTF-8')),
                    'entities_id' => (int) $data['entity_id'],
                    'type'        => (int) $data['type'],
                    'status'      => 1,
                ],
            ];

            if (!empty($data['category_id'])) {
                $payload['input']['itilcategories_id'] = (int) $data['category_id'];
            }

            $response = Http::withHeaders($this->headersWithSession($sessionToken))
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->post("{$this->url}/Ticket", $payload);

            if ($response->failed()) {
                throw new RuntimeException(
                    "Error creando ticket en GLPI: {$response->status()} - " .
                    $this->sanitizeError($response->body())
                );
            }

            $result   = $response->json();
            $ticketId = $this->getCreatedTicketId($result);

            if (!$ticketId) {
                throw new RuntimeException("No se pudo obtener el ID del ticket creado.");
            }

            $this->addRequesterToTicket($sessionToken, $ticketId, (int) $data['requester_id']);

            return ['id' => $ticketId];

        } finally {
            $this->killSession($sessionToken);
        }
    }

    // -------------------------------------------------------------------------
    // Agregar solicitante al ticket
    // -------------------------------------------------------------------------

    public function addRequesterToTicket(string $sessionToken, int $ticketId, int $requesterId): array
    {
        $response = Http::withHeaders($this->headersWithSession($sessionToken))
            ->timeout($this->timeout)
            ->withOptions(['verify' => $this->sslVerify])
            ->post("{$this->url}/Ticket_User", [
                'input' => [
                    'tickets_id'       => $ticketId,
                    'users_id'         => $requesterId,
                    'type'             => 1,
                    'use_notification' => 1,
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "El ticket fue creado, pero no se pudo agregar el solicitante: " .
                "{$response->status()} - " . $this->sanitizeError($response->body())
            );
        }

        return $response->json();
    }

    // -------------------------------------------------------------------------
    // Tickets nuevos
    // -------------------------------------------------------------------------

    public function getNewTickets(): array
    {
        $sessionToken = $this->initSession();

        try {
            $response = Http::withHeaders($this->headersWithSession($sessionToken))
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->get("{$this->url}/search/Ticket", [
                    'criteria[0][field]'      => '12',
                    'criteria[0][searchtype]' => 'equals',
                    'criteria[0][value]'      => '1',
                    'forcedisplay[0]'         => '1',
                    'forcedisplay[1]'         => '2',
                    'forcedisplay[2]'         => '80',
                    'forcedisplay[3]'         => '12',
                    'forcedisplay[4]'         => '15',
                    'forcedisplay[5]'         => '19',
                    'forcedisplay[6]'         => '3',
                    'forcedisplay[7]'         => '4',
                    'forcedisplay[8]'         => '5',
                    'forcedisplay[9]'         => '7',
                    'forcedisplay[10]'        => '21',
                    'sort'                    => '1',
                    'order'                   => 'DESC',
                    'range'                   => '0-999',
                    'expand_dropdowns'        => 'true',
                ]);

            if ($response->failed()) {
                throw new RuntimeException(
                    "Error obteniendo tickets nuevos: {$response->status()} - " .
                    $this->sanitizeError($response->body())
                );
            }

            $json  = $response->json();
            $data  = $json['data'] ?? [];
            $total = $json['totalcount'] ?? 0;

            $tickets = collect($data)
                ->map(fn ($t) => GlpiMapper::newTicket($t))
                ->values()
                ->toArray();

            return [
                'total'   => $total,
                'tickets' => $tickets,
            ];

        } finally {
            $this->killSession($sessionToken);
        }
    }

    // -------------------------------------------------------------------------
    // Exportar CSV tickets nuevos
    // -------------------------------------------------------------------------

    public function exportNewTicketsCsv(): string
    {
        $result  = $this->getNewTickets();
        $tickets = $result['tickets'];

        $columns = [
            'id', 'title', 'entity', 'status', 'opening_date',
            'last_update', 'priority', 'requester', 'assigned_technician',
            'category', 'description',
        ];

        $filename = 'tickets_nuevos_glpi_' . now()->format('Ymd_His') . '.csv';

        // Construir CSV en memoria
        $handle = fopen('php://temp', 'r+');

        // BOM para Excel
        fwrite($handle, "\xEF\xBB\xBF");

        // Cabecera
        fputcsv($handle, $columns, ';');

        foreach ($tickets as $ticket) {
            $row = array_map(fn ($col) => $ticket[$col] ?? '', $columns);
            fputcsv($handle, $row, ';');
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }

    // -------------------------------------------------------------------------
    // Autenticación con credenciales de usuario
    // -------------------------------------------------------------------------

    /**
     * Valida usuario y contraseña contra GLPI usando Authorization Basic.
     * Devuelve datos del usuario autenticado. Nunca expone el session_token de GLPI.
     */
    public function loginWithCredentials(string $username, string $password): array
    {
        $response = Http::withHeaders([
            'App-Token'    => $this->appToken,
            'Authorization' => 'Basic ' . base64_encode("{$username}:{$password}"),
            'Content-Type' => 'application/json',
        ])
            ->timeout($this->timeout)
            ->withOptions(['verify' => $this->sslVerify])
            ->get("{$this->url}/initSession");

        if ($response->failed()) {
            throw new RuntimeException('Credenciales inválidas.');
        }

        $sessionToken = $response->json('session_token');

        if (empty($sessionToken)) {
            throw new RuntimeException('No se obtuvo session_token de GLPI.');
        }

        $name = $username;

        try {
            $fullSession = Http::withHeaders([
                'App-Token'    => $this->appToken,
                'Session-Token' => $sessionToken,
                'Content-Type' => 'application/json',
            ])
                ->timeout($this->timeout)
                ->withOptions(['verify' => $this->sslVerify])
                ->get("{$this->url}/getFullSession");

            if ($fullSession->successful()) {
                $name = $fullSession->json('session.glpifriendlyname') ?? $username;
            }
        } catch (\Throwable) {
            // Silencioso; se usa el login como nombre
        } finally {
            $this->killSession($sessionToken);
        }

        return [
            'glpi_login' => $username,
            'name'       => $name,
        ];
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    public function getCreatedTicketId(array $response): ?int
    {
        if (!empty($response['id'])) {
            return (int) $response['id'];
        }

        if (!empty($response['ids'])) {
            $ids = $response['ids'];
            if (is_array($ids) && !empty($ids)) {
                return (int) $ids[0];
            }
            if (is_int($ids)) {
                return $ids;
            }
        }

        return null;
    }

    private function sanitizeError(string $body): string
    {
        // Evita exponer tokens en mensajes de error
        return substr(strip_tags($body), 0, 200);
    }
}
