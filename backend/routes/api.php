<?php

use App\Http\Controllers\Glpi\CategoryController;
use App\Http\Controllers\Glpi\EntityController;
use App\Http\Controllers\Glpi\RequesterController;
use App\Http\Controllers\Glpi\TicketController;
use Illuminate\Support\Facades\Route;

Route::prefix('glpi')->group(function () {
    Route::get('entities',           [EntityController::class,    'index']);
    Route::get('categories',         [CategoryController::class,  'index']);
    Route::get('requesters',         [RequesterController::class, 'byEntity']);
    Route::post('tickets',           [TicketController::class,    'store']);
    Route::get('tickets/new',        [TicketController::class,    'newTickets']);
    Route::get('tickets/new/export', [TicketController::class,    'exportNewTickets']);
});
