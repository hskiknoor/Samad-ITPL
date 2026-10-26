<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    public function login(): Response
    {
        return Inertia::render('Public/AccountLogin', ['register' => false]);
    }

    public function register(): Response
    {
        return Inertia::render('Public/AccountLogin', ['register' => true]);
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        if (! Auth::attempt([...$data, 'role' => 'customer'])) {
            throw ValidationException::withMessages(['email' => 'The email or password is incorrect.']);
        }
        $request->session()->regenerate();
        Inertia::clearHistory();

        return redirect()->intended(route('account.home'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email', 'max:180', 'unique:users,email'], 'password' => ['required', 'confirmed', Password::min(12)->letters()->numbers()]]);
        $user = User::create([...$data, 'role' => 'customer']);
        Auth::login($user);
        $request->session()->regenerate();
        Inertia::clearHistory();

        return redirect()->route('account.home');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Public/Account', ['orders' => Order::where('user_id', $request->user()->id)->latest()->paginate(10)]);
    }

    public function order(Request $request, int $order): Response
    {
        return Inertia::render('Public/Receipt', ['order' => Order::where('user_id', $request->user()->id)->findOrFail($order)]);
    }

    public function export(Request $request): JsonResponse|StreamedResponse
    {
        $format = $request->validate(['format' => ['nullable', 'in:csv,json']])['format'] ?? 'csv';
        $orders = Order::where('user_id', $request->user()->id)->latest()->get();
        if ($format === 'json') {
            return response()->json(['profile' => $request->user()->only('name', 'email'), 'orders' => $orders])->header('Content-Disposition', 'attachment; filename="my-website-data.json"')->header('Cache-Control', 'private, no-store');
        }

        return response()->streamDownload(function () use ($orders) {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['Order', 'Created UTC', 'Status', 'Currency', 'Subtotal', 'Items'], ',', '"', '');
            foreach ($orders as $order) {
                $items = collect($order->items)->map(fn ($item) => $item['title'].' x '.$item['quantity'])->implode('; ');
                $row = [$order->reference, $order->created_at->toIso8601String(), $order->status, $order->currency, number_format($order->total_cents / 100, 2, '.', ''), $items];
                $row = array_map(fn ($value) => preg_match('/^[\s]*[=+@\-\t\r]/u', (string) $value) ? "'".$value : $value, $row);
                fputcsv($stream, $row, ',', '"', '');
            }
            fclose($stream);
        }, 'my-orders.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store']);
    }
}
