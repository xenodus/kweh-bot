<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/profile/{lodestone_id}/{locale?}', 'LodestoneController@profile')->name('get_lodestone_profile');
Route::get('/stats', 'StatsController@getStats')->name('get_stats');

Route::post('/serverSettings', 'ServerSettingsController@get_server_settings')->name('get_server_settings');

Route::get('/eorzeacollection/getByURL', 'EorzeaCollectionController@getByURL')->name('get_glamour_by_url');
Route::get('/eorzeacollection/{type?}', 'EorzeaCollectionController@getGlamours')->name('get_glamours');