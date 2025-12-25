<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaidController;
use App\Http\Controllers\PayFastController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\PaymentController;;



//test
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

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
    
    // User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Recommendations
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    Route::post('/recommendations/generate', [RecommendationController::class, 'generate']);
    Route::post('/recommendations/{recommendation}/dismiss', [RecommendationController::class, 'dismiss']);
    Route::post('/recommendations/{recommendation}/complete', [RecommendationController::class, 'complete']);

    Route::post('/subscribe', [PayFastController::class, 'subscribe']);
    Route::post('/subscription/cancel', [PayFastController::class, 'cancelSubscription']);

    Route::get('/plans', [PaymentController::class, 'plans']);
    Route::post('/subscribe', [PaymentController::class, 'subscribe']);
    Route::post('/subscription/cancel', [PaymentController::class, 'cancelSubscription']);

    // Recommendations - ADD THESE
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    Route::post('/recommendations/generate', [RecommendationController::class, 'generate']);
    Route::post('/recommendations/{recommendation}/dismiss', [RecommendationController::class, 'dismiss']);
    Route::post('/recommendations/{recommendation}/complete', [RecommendationController::class, 'complete']);
});


// Public routes
Route::get('/plans', [PayFastController::class, 'showPlans']);
Route::post('/payment/notify', [PayFastController::class, 'notify']);