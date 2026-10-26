<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\WebsiteAssistant;
use App\Services\WebsiteKnowledge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssistantController extends Controller
{
    public function ask(Request $request, WebsiteKnowledge $knowledge, WebsiteAssistant $assistant): JsonResponse
    {
        abort_unless(Setting::enabled('assistant'), 404);
        $question = $request->validate(['question' => ['required', 'string', 'min:2', 'max:1500']])['question'];

        return response()->json($assistant->answer($question, $knowledge->search($question, $request->user())))->header('Cache-Control', 'private, no-store')->header('X-Robots-Tag', 'noindex, nofollow');
    }

    public function search(Request $request, WebsiteKnowledge $knowledge): Response
    {
        $query = $request->validate(['q' => ['nullable', 'string', 'max:200']])['q'] ?? '';

        return Inertia::render('Public/Search', ['query' => $query, 'results' => filled($query) ? $knowledge->search($query, $request->user()) : ['sources' => [], 'actions' => []]]);
    }
}
