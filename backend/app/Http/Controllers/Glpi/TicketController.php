<?php

namespace App\Http\Controllers\Glpi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Glpi\StoreTicketRequest;
use App\Services\Glpi\GlpiService;
use Illuminate\Http\JsonResponse;
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
