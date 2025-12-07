<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaidController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Subscriptions
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::put('/subscriptions/{subscription}', [SubscriptionController::class, 'update']);
    Route::delete('/subscriptions/{subscription}', [SubscriptionController::class, 'destroy']);
    Route::get('/subscriptions/statistics', [SubscriptionController::class, 'statistics']);
    
    // Sharing Groups
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('/groups/join', [GroupController::class, 'join']);
    Route::delete('/groups/{group}/leave', [GroupController::class, 'leave']);
    Route::delete('/groups/{group}', [GroupController::class, 'destroy']);
    
    // Plaid (we'll implement this next)
    Route::post('/plaid/link-token', [PlaidController::class, 'createLinkToken']);
    Route::post('/plaid/exchange-token', [PlaidController::class, 'exchangePublicToken']);
    Route::post('/plaid/sync', [PlaidController::class, 'syncTransactions']);
    Route::get('/plaid/accounts', [PlaidController::class, 'getAccounts']);
    
    // User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
});