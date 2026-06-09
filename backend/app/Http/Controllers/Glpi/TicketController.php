<?php

namespace App\Http\Controllers\Glpi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Glpi\StoreTicketRequest;
use App\Services\Glpi\GlpiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TicketController extends Controller
{
    // POST /api/glpi/tickets
    public function store(StoreTicketRequest $request, GlpiService $glpi): JsonResponse
    {
        try {
            $result = $glpi->createTicket($request->validated());

            return response()->json([
                'ok'      => true,
                'message' => "Caso creado correctamente en GLPI. ID: {$result['id']}.",
                'data'    => $result,
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/glpi/tickets/new
    public function newTickets(GlpiService $glpi): JsonResponse
    {
        try {
            $result = $glpi->getNewTickets();

            return response()->json([
                'ok'   => true,
                'data' => $result,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // POST /api/glpi/tickets/bulk-reply
    public function bulkReply(Request $request, GlpiService $glpi): JsonResponse
    {
        $data = $request->validate([
            'ticket_ids'   => ['required', 'array', 'min:1'],
            'ticket_ids.*' => ['required', 'integer', 'min:1'],
            'content'      => ['required', 'string', 'max:10000'],
        ]);

        try {
            $results = $glpi->bulkAddFollowup($data['ticket_ids'], $data['content']);
            $success = collect($results)->where('ok', true)->count();
            $total   = count($results);
            $failed  = $total - $success;

            return response()->json([
                'ok'      => $failed === 0,
                'message' => "Se procesaron {$success} de {$total} caso" . ($total !== 1 ? 's' : '') . ' correctamente.',
                'results' => $results,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/glpi/tickets/new/export
    public function exportNewTickets(GlpiService $glpi): Response
    {
        try {
            $csv      = $glpi->exportNewTicketsCsv();
            $filename = 'tickets_nuevos_glpi_' . now()->format('Ymd_His') . '.csv';

            return response($csv, 200, [
                'Content-Type'        => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);

        } catch (\Throwable $e) {
            return response("Error exportando tickets: " . $e->getMessage(), 500, [
                'Content-Type' => 'text/plain',
            ]);
        }
    }
}
