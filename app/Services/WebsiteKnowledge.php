<?php

namespace App\Services;

use App\Models\Entry;
use App\Models\Order;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Str;

class WebsiteKnowledge
{
    public function search(string $question, ?User $user): array
    {
        $words = collect(preg_split('/[^\pL\pN]+/u', Str::lower($question)))->filter(fn ($word) => mb_strlen($word) > 2 && ! in_array($word, ['the', 'and', 'what', 'about', 'this', 'website', 'please', 'show', 'find', 'download', 'want', 'your', 'have', 'can', 'for', 'any', 'are', 'how', 'you', 'tell', 'more', 'which', 'where', 'does', 'some', 'available', 'could', 'would', 'need', 'from', 'with', 'our', 'these', 'sell']))->unique()->take(6)->values();
        $productIntent = preg_match('/\b(products?|shop|store|catalog)\b/i', $question) && $words->diff(['product', 'products', 'shop', 'store', 'catalog'])->isEmpty();
        $reportIntent = preg_match('/\b(reports?|resources?|documents?|files?)\b/i', $question) && $words->diff(['report', 'reports', 'resource', 'resources', 'document', 'documents', 'file', 'files', 'account'])->isEmpty();
        $entries = Entry::visible()->where(function ($query) use ($words, $productIntent) {
            if ($words->isEmpty()) {
                $query->whereRaw('1 = 0');
            }
            if ($productIntent) {
                $query->orWhere('type', 'product');
            }
            foreach ($words as $word) {
                $query->orWhere(fn ($q) => $q->where('title', 'like', '%'.$word.'%')->orWhere('excerpt', 'like', '%'.$word.'%')->orWhere('body', 'like', '%'.$word.'%')->orWhere('blocks', 'like', '%'.$word.'%'));
            }
        })->latest('published_at')->limit(6)->get();
        $sources = $entries->map(function ($entry) use ($words) {
            $blocks = collect($entry->blocks ?? [])->map(fn ($block) => ($block['heading'] ?? '').' '.($block['body'] ?? '').' '.collect($block['items'] ?? [])->map(fn ($item) => $item['title'].' '.$item['text'])->implode(' '))->implode(' ');

            return ['title' => $entry->title, 'url' => $entry->public_path, 'excerpt' => $this->excerpt(($entry->excerpt ?? '').' '.$blocks.' '.strip_tags($entry->html), $words->all()), 'kind' => $entry->type];
        })->all();
        if (Setting::enabled('reports')) {
            $reports = Report::published()->accessible($user)->where(function ($query) use ($words, $reportIntent) {
                if ($reportIntent) {
                    $query->whereRaw('1 = 1');

                    return;
                }
                if ($words->isEmpty()) {
                    $query->whereRaw('1 = 0');
                }
                foreach ($words as $word) {
                    $query->orWhere(fn ($q) => $q->where('title', 'like', '%'.$word.'%')->orWhere('summary', 'like', '%'.$word.'%')->orWhere('content', 'like', '%'.$word.'%'));
                }
            })->limit(5)->get();
            foreach ($reports as $report) {
                $sources[] = ['title' => $report->title, 'url' => '/reports/'.$report->slug.'/download', 'excerpt' => $this->excerpt($report->summary.' '.$report->content, $words->all()), 'kind' => $report->audience === 'customer' ? 'your report' : 'report'];
            }
        }
        $actions = [];
        if (preg_match('/\b(order|orders|purchases|account|invoice|my data)\b/i', $question)) {
            if ($user?->role === 'customer') {
                foreach (Order::where('user_id', $user->id)->latest()->limit(5)->get() as $order) {
                    $sources[] = ['title' => 'Your order #'.$order->id, 'url' => '/account/orders/'.$order->id, 'excerpt' => 'Status: '.$order->status.'. Subtotal: '.number_format($order->total_cents / 100, 2, '.', '').' '.$order->currency.'. Items: '.collect($order->items)->pluck('title')->implode(', '), 'kind' => 'your order'];
                }
                $actions = [['label' => 'Download my orders (CSV)', 'url' => '/account/export?format=csv'], ['label' => 'Download my data (JSON)', 'url' => '/account/export?format=json']];
            } else {
                $actions[] = ['label' => 'Sign in to your customer account', 'url' => '/account/login'];
            }
        }

        return ['sources' => $sources, 'actions' => $actions];
    }

    private function excerpt(string $text, array $words): string
    {
        $position = 0;
        foreach ($words as $word) {
            $match = mb_stripos($text, $word);
            if ($match !== false) {
                $position = max(0, $match - 150);
                break;
            }
        }

        return ($position > 0 ? '…' : '').mb_substr($text, $position, 1100);
    }
}
