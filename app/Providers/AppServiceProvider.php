<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\PlaidService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register PlaidService as singleton
        $this->app->singleton(PlaidService::class, function ($app) {
            return new PlaidService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}