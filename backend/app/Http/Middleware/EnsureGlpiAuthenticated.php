<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Symfony\Component\HttpFoundation\Response;

class EnsureGlpiAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();

        if (! $bearer) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        try {
            $data = json_decode(Crypt::decryptString($bearer), true);

            if (! $data || ($data['expires_at'] ?? 0) < now()->timestamp) {
                return response()->json(['message' => 'Sesión expirada. Por favor inicia sesión nuevamente.'], 401);
            }
        } catch (\Throwable) {
            return response()->json(['message' => 'Token inválido.'], 401);
        }

        return $next($request);
    }
}
