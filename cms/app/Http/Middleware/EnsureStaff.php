<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaff
{
    public function handle(Request $request, Closure $next, string $role = 'editor'): Response
    {
        abort_unless(in_array($request->user()?->role, $role === 'admin' ? ['admin'] : ['admin', 'editor'], true), 403);

        return $next($request);
    }
}
