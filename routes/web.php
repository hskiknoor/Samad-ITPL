<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommerceController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1');
});
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');
Route::prefix('admin')->name('admin.')->middleware(['auth', 'staff'])->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::resource('content', ContentController::class)->parameters(['content' => 'entry'])->except('show');
    Route::post('/content/{entry}/restore/{revision}', [ContentController::class, 'restore'])->name('content.restore');
    Route::get('/media', [AdminController::class, 'media'])->name('media');
    Route::post('/media', [AdminController::class, 'upload']);
    Route::patch('/media/{media}', [AdminController::class, 'updateMedia']);
    Route::delete('/media/{media}', [AdminController::class, 'deleteMedia']);
    Route::get('/categories', [AdminController::class, 'categories'])->name('categories');
    Route::post('/categories', [AdminController::class, 'saveCategory']);
    Route::delete('/categories/{category}', [AdminController::class, 'deleteCategory']);
    Route::get('/seo', [AdminController::class, 'seo'])->name('seo');
    Route::middleware('staff:admin')->group(function () {
        Route::get('/customers', [PlatformController::class, 'customers']);
        Route::patch('/customers/{user}/password', [PlatformController::class, 'resetCustomer']);
        Route::get('/reports/{report}/download', [ReportController::class, 'adminDownload']);
        Route::get('/platform', [PlatformController::class, 'index'])->name('platform');
        Route::put('/platform/modules', [PlatformController::class, 'modules']);
        Route::put('/platform/discovery', [PlatformController::class, 'discovery']);
        Route::put('/platform/assistant', [PlatformController::class, 'assistant']);
        Route::post('/redirects', [PlatformController::class, 'redirect']);
        Route::delete('/redirects/{redirect}', [PlatformController::class, 'deleteRedirect']);
        Route::get('/reports', [ReportController::class, 'admin']);
        Route::post('/reports', [ReportController::class, 'store']);
        Route::patch('/reports/{report}', [ReportController::class, 'update']);
        Route::delete('/reports/{report}', [ReportController::class, 'destroy']);
        Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
        Route::put('/settings', [AdminController::class, 'saveSettings']);
        Route::get('/team', [AdminController::class, 'users'])->name('team');
        Route::post('/team', [AdminController::class, 'addUser']);
        Route::patch('/team/{user}', [AdminController::class, 'updateUser']);
        Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
        Route::patch('/orders/{order}', [AdminController::class, 'updateOrder']);
        Route::get('/inbox', [AdminController::class, 'inbox'])->name('inbox');
        Route::patch('/inbox/{submission}', [AdminController::class, 'updateSubmission']);
    });
});
Route::get('/', [SiteController::class, 'home'])->name('site.home');
Route::get('/journal', [SiteController::class, 'listing'])->name('site.journal');
Route::get('/journal/{slug}', [SiteController::class, 'show'])->defaults('type', 'post')->name('site.post');
Route::get('/shop', [SiteController::class, 'listing'])->defaults('type', 'product')->name('site.shop');
Route::get('/shop/{slug}', [SiteController::class, 'show'])->defaults('type', 'product')->name('site.product');
Route::get('/pages/{slug}', [SiteController::class, 'show'])->name('site.page');
Route::get('/contact', [SiteController::class, 'contact'])->name('site.contact');
Route::post('/contact', [SiteController::class, 'submit'])->middleware('throttle:5,1');
Route::get('/cart', [CommerceController::class, 'cart'])->name('site.cart');
Route::post('/cart/{entry}', [CommerceController::class, 'add'])->whereNumber('entry');
Route::patch('/cart/{entry}', [CommerceController::class, 'update'])->whereNumber('entry');
Route::delete('/cart/{id}', [CommerceController::class, 'remove'])->whereNumber('id');
Route::post('/checkout', [CommerceController::class, 'checkout'])->middleware('throttle:10,1')->block(10, 10);
Route::get('/order/{reference}', [CommerceController::class, 'receipt'])->name('site.order');
Route::get('/sitemap.xml', [SiteController::class, 'sitemap'])->name('site.sitemap');
Route::get('/robots.txt', [SiteController::class, 'robots'])->name('site.robots');

Route::get('/search', [AssistantController::class, 'search'])->name('site.search');
Route::post('/assistant', [AssistantController::class, 'ask'])->middleware('throttle:20,1');
Route::get('/reports', [ReportController::class, 'index'])->name('site.reports');
Route::get('/reports/{slug}/download', [ReportController::class, 'download'])->middleware('throttle:30,1');
Route::middleware('guest')->group(function () {
    Route::get('/account/login', [CustomerController::class, 'login'])->name('account.login');
    Route::post('/account/login', [CustomerController::class, 'authenticate'])->middleware('throttle:5,1');
    Route::get('/account/register', [CustomerController::class, 'register']);
    Route::post('/account/register', [CustomerController::class, 'store'])->middleware('throttle:5,1');
});
Route::middleware('customer')->group(function () {
    Route::get('/account', [CustomerController::class, 'index'])->name('account.home');
    Route::get('/account/export', [CustomerController::class, 'export'])->middleware('throttle:10,1');
    Route::get('/account/orders/{order}', [CustomerController::class, 'order'])->whereNumber('order');
});
Route::get('/llms.txt', [SiteController::class, 'llms']);
Route::get('/llms-full.txt', [SiteController::class, 'llms']);
Route::redirect('/llm.txt', '/llms.txt', 301);
Route::get('/feed.xml', [SiteController::class, 'feed']);
Route::get('/{fallback}', fn () => abort(404))->where('fallback', '.*');
