<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Glpi\CategoryController;
use App\Http\Controllers\Glpi\EntityController;
use App\Http\Controllers\Glpi\RequesterController;
use App\Http\Controllers\Glpi\TicketController;
use Illuminate\Support\Facades\Route;

// ── Autenticación (pública) ───────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login',  [AuthController::class, 'login']);
    Route::get('me',      [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
});

// ── GLPI (protegidas con token cifrado) ───────────────────────────────────────
Route::prefix('glpi')
    ->middleware('glpi.auth')
    ->group(function () {
        Route::get('entities',           [EntityController::class,    'index']);
        Route::get('categories',         [CategoryController::class,  'index']);
        Route::get('requesters',         [RequesterController::class, 'byEntity']);
        Route::post('tickets',              [TicketController::class,    'store']);
        Route::post('tickets/bulk-reply',  [TicketController::class,    'bulkReply']);
        Route::get('tickets/new',          [TicketController::class,    'newTickets']);
        Route::get('tickets/new/export',   [TicketController::class,    'exportNewTickets']);
    });
