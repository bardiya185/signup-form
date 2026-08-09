<?php

use App\Support\ApiException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.token' => \App\Http\Middleware\AuthToken::class,
            'auth.optional' => \App\Http\Middleware\OptionalToken::class,
            'role' => \App\Http\Middleware\RequireRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // خطاهای کنترل‌شده API با قرارداد فارسی { message, errors }
        $exceptions->render(function (ApiException $e) {
            return response()->json(
                array_filter(['message' => $e->getMessage(), 'errors' => $e->errors]),
                $e->status,
            );
        });
    })->create();
