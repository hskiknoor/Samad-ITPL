<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CommerceController extends Controller
{
    public function cart(Request $request): Response
    {
        abort_unless(Setting::enabled('commerce'), 404);
        $cart = $request->session()->get('cart', []);
        $entries = Entry::visible()->where('type', 'product')->whereIn('id', array_keys($cart))->with('media')->get();
        $request->session()->put('cart', array_intersect_key($cart, array_flip($entries->pluck('id')->all())));
        $items = $entries->map(fn ($entry) => ['entry' => $entry, 'quantity' => $cart[$entry->id]]);
        if (! $request->session()->has('checkout_token')) {
            $request->session()->put('checkout_token', (string) Str::uuid());
        }

        return Inertia::render('Public/Cart', ['items' => $items, 'total' => $items->sum(fn ($item) => $item['entry']->price_cents * $item['quantity']), 'checkoutToken' => $request->session()->get('checkout_token')]);
    }

    public function add(Request $request, Entry $entry): RedirectResponse
    {
        abort_unless(Entry::visible()->whereKey($entry->id)->where('type', 'product')->exists(), 404);
        $quantity = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']])['quantity'];
        $cart = $request->session()->get('cart', []);
        $newQuantity = ($cart[$entry->id] ?? 0) + $quantity;
        if ($newQuantity > min(99, $entry->stock)) {
            throw ValidationException::withMessages(['quantity' => 'This quantity is not available.']);
        }
        $cart[$entry->id] = $newQuantity;
        $request->session()->put('cart', $cart);

        return back()->with('success', 'Added to your bag.');
    }

    public function update(Request $request, Entry $entry): RedirectResponse
    {
        abort_unless(Entry::visible()->whereKey($entry->id)->where('type', 'product')->exists(), 404);
        $quantity = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']])['quantity'];
        $cart = $request->session()->get('cart', []);
        abort_unless(isset($cart[$entry->id]), 404);
        if ($quantity > $entry->stock) {
            throw ValidationException::withMessages(['quantity' => 'This quantity is not available.']);
        }
        $cart[$entry->id] = $quantity;
        $request->session()->put('cart', $cart);

        return back();
    }

    public function remove(Request $request, int $id): RedirectResponse
    {
        $cart = $request->session()->get('cart', []);
        unset($cart[$id]);
        $request->session()->put('cart', $cart);

        return back();
    }

    public function checkout(Request $request): RedirectResponse
    {
        abort_unless(Setting::enabled('commerce'), 404);
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email', 'max:180'], 'address' => ['required', 'string', 'min:10', 'max:1000'], 'checkout_token' => ['required', 'uuid']]);
        if ($data['checkout_token'] !== $request->session()->get('checkout_token')) {
            throw ValidationException::withMessages(['checkout' => 'This checkout has expired. Reload your bag and try again.']);
        }
        $cart = $request->session()->get('cart', []);
        if (empty($cart)) {
            throw ValidationException::withMessages(['checkout' => 'Your bag is empty.']);
        }
        $order = DB::transaction(function () use ($cart, $data, $request) {
            $items = [];
            $total = 0;
            foreach ($cart as $id => $quantity) {
                $entry = Entry::visible()->where('type', 'product')->lockForUpdate()->find($id);
                if (! $entry || $quantity > $entry->stock) {
                    throw ValidationException::withMessages(['checkout' => 'An item is no longer available in the requested quantity. Update your bag.']);
                }
                $reserved = Entry::whereKey($id)->where('stock', '>=', $quantity)->decrement('stock', $quantity);
                if (! $reserved) {
                    throw ValidationException::withMessages(['checkout' => 'Stock just changed. Please try again.']);
                }
                $items[] = ['entry_id' => $entry->id, 'title' => $entry->title, 'quantity' => $quantity, 'price_cents' => $entry->price_cents];
                $total += $entry->price_cents * $quantity;
            }

            return Order::create(['user_id' => $request->user()?->role === 'customer' ? $request->user()->id : null, 'reference' => $data['checkout_token'], 'name' => $data['name'], 'email' => $data['email'], 'address' => $data['address'], 'items' => $items, 'total_cents' => $total, 'currency' => Setting::site()['currency']]);
        });
        $references = $request->session()->get('order_references', []);
        $references[] = $order->reference;
        $request->session()->put('order_references', array_slice($references, -20));
        $request->session()->forget(['cart', 'checkout_token']);

        return redirect()->route('site.order', $order->reference);
    }

    public function receipt(Request $request, string $reference): Response
    {
        abort_unless(in_array($reference, $request->session()->get('order_references', []), true), 404);

        return Inertia::render('Public/Receipt', ['order' => Order::where('reference', $reference)->firstOrFail()]);
    }
}
