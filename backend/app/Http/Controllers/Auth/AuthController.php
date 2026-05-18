<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Glpi\GlpiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class AuthController extends Controller
{
    public function __construct(private GlpiService $glpi) {}

    // -------------------------------------------------------------------------
    // POST /api/auth/login
    // -------------------------------------------------------------------------

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ], [
            'username.required' => 'El usuario es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        try {
            $glpiUser = $this->glpi->loginWithCredentials(
                $request->username,
                $request->password
            );
        } catch (\Throwable) {
            return response()->json(['message' => 'Usuario o contraseña inválidos.'], 401);
        }

        // Token cifrado con APP_KEY, sin base de datos
        $payload = json_encode([
            'username'   => $glpiUser['glpi_login'],
            'name'       => $glpiUser['name'],
            'expires_at' => now()->addHours(8)->timestamp,
        ]);

        $token = Crypt::encryptString($payload);

        return response()->json([
            'message' => 'Inicio de sesión correcto.',
            'token'   => $token,
            'user'    => [
                'username' => $glpiUser['glpi_login'],
                'name'     => $glpiUser['name'],
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /api/auth/me
    // -------------------------------------------------------------------------

    public function me(Request $request): JsonResponse
    {
        $user = $this->decodeToken($request);

        if (! $user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        return response()->json(['user' => $user]);
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/logout
    // -------------------------------------------------------------------------

    public function logout(): JsonResponse
    {
        // Stateless: el frontend descarta el token
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private function decodeToken(Request $request): ?array
    {
        $bearer = $request->bearerToken();

        if (! $bearer) {
            return null;
        }

        try {
            $data = json_decode(Crypt::decryptString($bearer), true);

            if (! $data || ($data['expires_at'] ?? 0) < now()->timestamp) {
                return null;
            }

            return [
                'username' => $data['username'],
                'name'     => $data['name'] ?? $data['username'],
            ];
        } catch (\Throwable) {
            return null;
        }
    }
}
