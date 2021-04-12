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

    public function getByURL(Request $request)
    {
        $item = [];

        if ($request->has('url')) {

            $url = $request->input('url');

            $cache_time_seconds = 60 * 60 * 24;

            $item = Cache::remember('kweh_EorzeaCollection_' . urlencode($url), $cache_time_seconds, function() use($url){

                $client = new Goutte\Client();
                $crawler = $client->request("GET", $url);

                $item['url'] = $url;
                $item['img'] = $crawler->filter('glamour-display')->count() > 0 ? $crawler->filter('glamour-display')->attr('cover') : "";

                // Items
                $item['equipment']['head'] = $crawler->filter('div.c-gear-slot-head .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-head .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['body'] = $crawler->filter('div.c-gear-slot-body .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-body .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['hands'] = $crawler->filter('div.c-gear-slot-hands .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-hands .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['legs'] = $crawler->filter('div.c-gear-slot-legs .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-legs .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['feet'] = $crawler->filter('div.c-gear-slot-feet .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-feet .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['weapon'] = $crawler->filter('div.c-gear-slot-weapon .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-weapon .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['offhand'] = $crawler->filter('div.c-gear-slot-offhand .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-offhand .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['earrings'] = $crawler->filter('div.c-gear-slot-earrings .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-earrings .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['necklace'] = $crawler->filter('div.c-gear-slot-necklace .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-necklace .c-gear-slot-item-info-name')->text() : "";
                $item['equipment']['bracelets'] = $crawler->filter('div.c-gear-slot-bracelets .c-gear-slot-item-info-name')->count() > 0 ? $crawler->filter('div.c-gear-slot-bracelets .c-gear-slot-item-info-name')->text() : "";

                $item['equipment']['rings'] = [];

                if( $crawler->filter('div.c-gear-slot-ring')->count() == 2 ) {

                    $crawler->filter('div.c-gear-slot-ring')->each(function($node, $i) use (&$item){
                        $item['equipment']['rings'][$i] = $node->filter('.c-gear-slot-item-info-name')->count() > 0 ? $node->filter('.c-gear-slot-item-info-name')->text() : "";
                    });
                }

                // Dyes
                $item['dye']['head'] = $crawler->filter('div.c-gear-slot-head .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-head .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['body'] = $crawler->filter('div.c-gear-slot-body .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-body .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['hands'] = $crawler->filter('div.c-gear-slot-hands .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-hands .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['legs'] = $crawler->filter('div.c-gear-slot-legs .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-legs .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['feet'] = $crawler->filter('div.c-gear-slot-feet .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-feet .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['weapon'] = $crawler->filter('div.c-gear-slot-weapon .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-weapon .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['offhand'] = $crawler->filter('div.c-gear-slot-offhand .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-offhand .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['earrings'] = $crawler->filter('div.c-gear-slot-earrings .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-earrings .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['necklace'] = $crawler->filter('div.c-gear-slot-necklace .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-necklace .c-gear-slot-item-info-color')->text() : "";
                $item['dye']['bracelets'] = $crawler->filter('div.c-gear-slot-bracelets .c-gear-slot-item-info-color')->count() > 0 ? $crawler->filter('div.c-gear-slot-bracelets .c-gear-slot-item-info-color')->text() : "";

                $item['dye']['rings'] = [];

                if( $crawler->filter('div.c-gear-slot-ring')->count() == 2 ) {

                    $crawler->filter('div.c-gear-slot-ring')->each(function($node, $i) use (&$item){
                        $item['dye']['rings'][$i] = $node->filter('.c-gear-slot-item-info-color')->count() > 0 ? $node->filter('.c-gear-slot-item-info-color')->text() : "";
                    });
                }

                // Links
                $item['link']['head'] = $crawler->filter('div.c-gear-slot-head a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-head a.eorzeadb_link')->attr("href") : "";
                $item['link']['body'] = $crawler->filter('div.c-gear-slot-body a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-body a.eorzeadb_link')->attr("href") : "";
                $item['link']['hands'] = $crawler->filter('div.c-gear-slot-hands a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-hands a.eorzeadb_link')->attr("href") : "";
                $item['link']['legs'] = $crawler->filter('div.c-gear-slot-legs a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-legs a.eorzeadb_link')->attr("href") : "";
                $item['link']['feet'] = $crawler->filter('div.c-gear-slot-feet a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-feet a.eorzeadb_link')->attr("href") : "";
                $item['link']['weapon'] = $crawler->filter('div.c-gear-slot-weapon a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-weapon a.eorzeadb_link')->attr("href") : "";
                $item['link']['offhand'] = $crawler->filter('div.c-gear-slot-offhand a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-offhand a.eorzeadb_link')->attr("href") : "";
                $item['link']['earrings'] = $crawler->filter('div.c-gear-slot-earrings a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-earrings a.eorzeadb_link')->attr("href") : "";
                $item['link']['necklace'] = $crawler->filter('div.c-gear-slot-necklace a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-necklace a.eorzeadb_link')->attr("href") : "";
                $item['link']['bracelets'] = $crawler->filter('div.c-gear-slot-bracelets a.eorzeadb_link')->count() > 0 ? $crawler->filter('div.c-gear-slot-bracelets a.eorzeadb_link')->attr("href") : "";

                $item['link']['rings'] = [];

                if( $crawler->filter('div.c-gear-slot-ring')->count() == 2 ) {

                    $crawler->filter('div.c-gear-slot-ring')->each(function($node, $i) use (&$item){
                        $item['link']['rings'][$i] = $node->filter('a.eorzeadb_link')->count() > 0 ? $node->filter('a.eorzeadb_link')->attr("href") : "";
                    });
                }

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