<?php

namespace App\Http\Middleware;

use App\Models\Redirect;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleSiteRedirects
{
    public static function reserved(string $path): bool
    {
        return (bool) preg_match('~^/(admin|account|login|logout|cart|checkout|order|assistant|up|sitemap\.xml|robots\.txt|llms?\.txt|llms-full\.txt)(/|$)~', $path);
    }

    public function handle(Request $request, Closure $next): Response
    {
        $path = '/'.ltrim($request->path(), '/');
        if (in_array($request->method(), ['GET', 'HEAD'], true) && ! static::reserved($path)) {
            $redirect = Redirect::where('from_path', $path)->first();
            if ($redirect) {
                return redirect($redirect->to_path, $redirect->status);
            }
        }

        return $next($request);
    }
}
