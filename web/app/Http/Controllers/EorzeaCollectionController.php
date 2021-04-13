<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App;
use Goutte;
use Cache;
use Illuminate\Http\Request;

class EorzeaCollectionController extends Controller
{
    const BASE_URL = "https://ffxiv.eorzeacollection.com";

    public function getGlamData($crawler, &$item, $category) {
        $slots = ['head', 'body', 'hands', 'legs', 'feet', 'weapon', 'offhand', 'earrings', 'necklace', 'bracelets'];

        foreach($slots as $slot) {
            if ($category == "equipment") {
                $item[$category][$slot] = self::getGlamName($crawler, $slot);

                $item[$category]['rings'] = [];

                if( $crawler->filter('a.c-gear-slot-ring')->count() == 2 ) {

                    $crawler->filter('a.c-gear-slot-ring')->each(function($node, $i) use (&$item, $category){
                        $item[$category]['rings'][$i] = $node->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-name')->count() ? $node->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-name')->text() : '';
                    });
                }
            }
            else if ($category == "dye") {
                $item[$category][$slot] = self::getGlamDye($crawler, $slot);

                $item[$category]['rings'] = [];

                if( $crawler->filter('a.c-gear-slot-ring')->count() == 2 ) {

                    $crawler->filter('a.c-gear-slot-ring')->each(function($node, $i) use (&$item, $category){
                        $item[$category]['rings'][$i] = $node->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-info-color')->count() ? $node->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-info-color')->text() : '';
                    });
                }
            }
            else {
                $item[$category][$slot] = self::getGlamLink($crawler, $slot);

                $item[$category]['rings'] = [];

                if( $crawler->filter('a.c-gear-slot-ring')->count() == 2 ) {

                    $crawler->filter('a.c-gear-slot-ring')->each(function($node, $i) use (&$item, $category){
                        $item[$category]['rings'][$i] = $node->count() ? $node->attr("href") : '';
                    });
                }
            }
        }

        return $item;
    }

    public function getGlamName($crawler, $slot) {
        try {
            return $crawler->filter('a.c-gear-slot-' . $slot)->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-name')->count() ? $crawler->filter('a.c-gear-slot-' . $slot)->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-name')->text() : '';
        }
        catch(\Exception $e) {
            return '';
        }
    }

    public function getGlamDye($crawler, $slot) {
        try {
            return $crawler->filter('a.c-gear-slot-' . $slot)->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-info-color')->count() ? $crawler->filter('a.c-gear-slot-' . $slot)->siblings()->filter('div.c-gear-slot-item .c-gear-slot-item-info-color')->text() : '';
        }
        catch(\Exception $e) {
            return '';
        }
    }

    public function getGlamLink($crawler, $slot) {
        try {
            return $crawler->filter('a.c-gear-slot-' . $slot)->count() ? $crawler->filter('a.c-gear-slot-' . $slot)->attr("href") : '';
        }
        catch(\Exception $e) {
            return '';
        }
    }

    public function getByURL(Request $request)
    {
        $item = [];

        if ($request->has('url')) {

            $url = $request->input('url');

            $cache_time_seconds = 60 * 60 * 24;

            $client = new Goutte\Client();
            $crawler = $client->request("GET", $url);

            $item['url'] = $url;
            $item['img'] = $crawler->filter('glamour-display')->count() > 0 ? $crawler->filter('glamour-display')->attr('cover') : "";

            $item = Cache::remember('kweh_EorzeaCollection_' . urlencode($url), $cache_time_seconds, function() use($url){

                $client = new Goutte\Client();
                $crawler = $client->request("GET", $url);

                $item['url'] = $url;
                $item['img'] = $crawler->filter('glamour-display')->count() > 0 ? $crawler->filter('glamour-display')->attr('cover') : "";

                // Items
                self::getGlamData($crawler, $item, 'equipment');

                // Dyes
                self::getGlamData($crawler, $item, 'dye');

                // Links
                self::getGlamData($crawler, $item, 'link');

                // Post Process
                foreach( $item['dye'] as $k => $v ) {

                    if( $k == "rings" ) {
                        foreach($item['dye'][$k] as $rk => $rv) {
                            if( $rv ) {
                                $item['dye'][$k][$rk] = substr($rv, 4);
                            }
                        }
                    }
                    else {
                        if( $v ) {
                            $item['dye'][$k] = substr($v, 4);
                        }
                    }
                }

                return $item;
            });
        }

        return response()->json($item);
    }

    public function getGlamours(Request $request, $type="")
    {
        $cache_time_seconds = 60 * 60 * 12; // 12 Hours
        $title = "Eorzea Collection";

        switch( $type ) {
            case "loved":
                $title .= " - Most Loved";
                $url = "/glamours/loved";
                break;
            case "male":
                $title .= " - Male";
                $url = "/glamours/men";
                break;
            case "female":
                $title .= " - Female";
                $url = "/glamours/women";
                break;
            case "latest":
            default:
                $title .= " - Latest";
                $url = "/glamours";
                $cache_time_seconds = 60 * 30; // 30 Mins
        }

        if ($request->has('search')) {
            $url = "/glamours?filter[orderBy]=date&filter[race]=any&filter[gender]=any&author=&filter[minimumLvl]=1&filter[maximumLvl]=80&search=" . $request->input('search');
            $title = "Eorzea Collection - Search by Keywords";
            $cache_time_seconds = 60 * 30; // 30 Mins
        }

        if ($request->has('author')) {
            $url = "/glamours?filter[orderBy]=date&filter[race]=any&filter[gender]=any&search=&filter[minimumLvl]=1&filter[maximumLvl]=80&author=" . $request->input('author');
            $title = "Eorzea Collection - Search by Author";
            $cache_time_seconds = 60 * 30; // 30 Mins
        }

        $results = Cache::remember('kweh_EorzeaCollection_' . urlencode($url), $cache_time_seconds, function() use($url, $title){

            $url = self::BASE_URL . $url;

            $results = [];

            $client = new Goutte\Client();
            $crawler = $client->request("GET", $url);

            $crawler->filter('.c-glamour-grid-item')->each(function($node) use(&$results){
                $item = [];

                $item['id'] = count(explode('/', $node->filter('a.c-glamour-grid-item-link')->attr("href"))) > 2 ? explode('/', $node->filter('a.c-glamour-grid-item-link')->attr("href"))[2] : "";
                $item['link'] = self::BASE_URL . $node->filter('a.c-glamour-grid-item-link')->attr("href");
                $item['title'] = $node->filter('.c-glamour-grid-item-content-title')->text();
                $item['author'] = $node->filter('.c-glamour-grid-item-content-author > b')->text();
                $item['likes'] = $node->filter('.c-glamour-grid-item-icons > .c-glamour-grid-item-icons-counter')->text();
                $item['img'] = $node->filter('img.c-glamour-grid-item-image')->attr('src');
                // Author Server
                preg_match('/«(.*?)»/i', $node->filter('.c-glamour-grid-item-content-author')->text(), $author_server_results);
                $item['server'] = count($author_server_results) > 1 ? $author_server_results[1] : "";

                $results['results'][] = $item;
            });

            $results['url'] = $url;
            $results['title'] = $title;

            return $results;
        });

        return response()->json($results);
    }
}