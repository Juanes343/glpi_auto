<?php

namespace App\Http\Controllers\Glpi;

use App\Http\Controllers\Controller;
use App\Services\Glpi\GlpiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequesterController extends Controller
{
    public function byEntity(Request $request, GlpiService $glpi): JsonResponse
    {
        $entityId = (int) $request->query('entity_id');

        if (!$entityId) {
            return response()->json([
                'ok'    => false,
                'error' => 'El parámetro entity_id es obligatorio.',
            ], 422);
        }

        try {
            $requesters = $glpi->getRequestersByEntity($entityId);
            return response()->json(['ok' => true, 'data' => $requesters]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
