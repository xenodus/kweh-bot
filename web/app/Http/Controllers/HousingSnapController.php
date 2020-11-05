<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App;
use Goutte;
use Cache;
use Illuminate\Http\Request;

class HousingSnapController extends Controller
{
    const BASE_URL = "https://housingsnap.com";

    public function getSnaps(Request $request, $tag="")
    {
        $cache_time_seconds = 60 * 60 * 6; // 6 Hours
        $title = "Housing Snap";
        $url = self::BASE_URL;

        if( $tag ) {
            $title .= ' - "' . $tag . '"';
            // $url .= "/?tag=" . $tag;
            $url .= "/?keyword=" . $tag;
        }
        else {
            $title .= ' - Latest';
        }

        $results = Cache::remember('kweh_HousingSnap_' . urlencode($url), $cache_time_seconds, function() use($url, $title){

            $results = [];

            $client = new Goutte\Client();
            $crawler = $client->request("GET", $url);

            $crawler->filter('#post-content-list article')->each(function($node) use(&$results){
                $item = [];

                $item['id'] = preg_replace('/\D/', '', $node->filter('figure > a')->attr("href"));
                $item['link'] = self::BASE_URL . $node->filter('figure > a')->attr("href");
                $item['title'] = $node->filter('h2')->text();
                $item['author'] = $node->filter('p.user')->text();
                $item['author_link'] = self::BASE_URL . $node->filter('p.user a')->attr("href");
                $item['img'] = $node->filter('figure img')->attr('data-original');

                $results['results'][] = $item;
            });

            $results['url'] = $url;
            $results['title'] = $title;

            return $results;
        });

        return response()->json($results);
    }
}