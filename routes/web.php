<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PayFastController;
use App\Http\Controllers\PlaidController;


// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });


Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/bank-accounts', function () {
        return Inertia::render('BankAccounts');
    })->name('bank-accounts');

    // Plaid (we'll implement this next)
    Route::post('/plaid/link-token', [PlaidController::class, 'createLinkToken']);
    Route::post('/plaid/exchange-token', [PlaidController::class, 'exchangePublicToken']);
    Route::post('/plaid/sync', [PlaidController::class, 'syncTransactions']);
    Route::get('/plaid/accounts', [PlaidController::class, 'getAccounts']);
    

    // Stitch routes
    Route::get('/stitch/authorize', [StitchController::class, 'createAuthorizationUrl'])->name('stitch.authorize');
    Route::get('/stitch/callback', [StitchController::class, 'handleCallback'])->name('stitch.callback');
    Route::post('/stitch/sync', [StitchController::class, 'syncTransactions'])->name('stitch.sync');
    Route::get('/stitch/accounts', [StitchController::class, 'getAccounts'])->name('stitch.accounts');
    Route::delete('/stitch/accounts/{account}', [StitchController::class, 'deleteAccount'])->name('stitch.delete');


});

require __DIR__.'/auth.php';


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/payment/success', [PayFastController::class, 'success'])->name('payment.success');
Route::get('/payment/cancel', [PayFastController::class, 'cancel'])->name('payment.cancel');
