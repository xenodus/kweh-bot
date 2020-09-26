<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Auth
Route::get('/login', 'ServerSettingsController@login')->name('login');
Route::get('/logout', 'ServerSettingsController@logout')->name('logout');
Route::get('/login/discord', 'ServerSettingsController@process_login_discord')->name('process_login_discord');

// Dashboard
Route::get('/me/profile', 'ServerSettingsController@profile')->name('user_profile')->middleware('checkAuth');
Route::get('/me/servers', 'ServerSettingsController@servers')->name('user_server_listings')->middleware('checkAuth');
Route::get('/me/servers/{server_id}', 'ServerSettingsController@server_settings')->name('user_server_settings')->middleware('checkAuth');
Route::post('/me/servers/{server_id}', 'ServerSettingsController@set_server_settings')->name('set_user_server_settings')->middleware('checkAuth');

Route::get('/', 'StaticController@home')->name('home');
Route::get('/screenshots', 'StaticController@screenshots')->name('screenshots');
Route::get('/commands', 'StaticController@commands')->name('commands');
Route::get('/contact', 'StaticController@contact')->name('contact');
Route::get('/credits', 'StaticController@credits')->name('credits');
Route::get('/privacy', 'StaticController@privacy')->name('privacy');
Route::get('/faqs', 'StaticController@faqs')->name('faqs');
Route::get('/support', 'StaticController@support')->name('support');
Route::get('/stats', 'StatsController@printStats')->name('print_stats');

Route::get('/ls/{id}', function($id){
    return redirect('https://na.finalfantasyxiv.com/lodestone/playguide/db/item/'.$id);
});

// Sitemap
Route::get('/sitemap/crawl', 'SitemapController@crawl')->name('sitemap_crawl');
Route::get('/sitemap/generate', 'SitemapController@generate')->name('sitemap_generate');