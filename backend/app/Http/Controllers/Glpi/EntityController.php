<?php

namespace App\Http\Controllers\Glpi;

use App\Http\Controllers\Controller;
use App\Services\Glpi\GlpiService;
use Illuminate\Http\JsonResponse;

class EntityController extends Controller
{
    public function index(GlpiService $glpi): JsonResponse
    {
        try {
            $entities = $glpi->getEntities();
            return response()->json(['ok' => true, 'data' => $entities]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
