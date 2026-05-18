<?php

namespace App\Http\Controllers\Glpi;

use App\Http\Controllers\Controller;
use App\Services\Glpi\GlpiService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(GlpiService $glpi): JsonResponse
    {
        try {
            $categories = $glpi->getCategories();
            return response()->json(['ok' => true, 'data' => $categories]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
