<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App;
use Goutte;
use Illuminate\Http\Request;

class LodestoneController extends Controller
{
    public function profile(Request $request, $lodestone_id, $locale="en")
    {
        switch( $locale ) {
            case "de":
                $base_url = "https://de.finalfantasyxiv.com";
                break;
            case "fr":
                $base_url = "https://fr.finalfantasyxiv.com";
                break;
            case "jp":
                $base_url = "https://jp.finalfantasyxiv.com";
                break;
            case "en":
            case "na":
            default:
                $locale = "en";
                $base_url = "https://na.finalfantasyxiv.com";
        }

        $client = new Goutte\Client();
        $crawler = $client->request("GET", $base_url . "/lodestone/character/" . $lodestone_id);

        $character = new App\Models\Character();

        $character->name = $crawler->filter('p.frame__chara__name')->count() ? $crawler->filter('p.frame__chara__name')->text() : "";
        $character->title = $crawler->filter('p.frame__chara__title')->count() ? $crawler->filter('p.frame__chara__title')->text() : "";

        $character->race = $crawler->filter('p.character-block__name')->count() ?
            explode("<br>", $crawler->filter('p.character-block__name')->html())[0] : "";

        $character->race_type = $crawler->filter('p.character-block__name')->count() ?
            explode(" / ", explode("<br>", $crawler->filter('p.character-block__name')->html())[1])[0] : "";

        $character->gender = $crawler->filter('p.character-block__name')->count() ?
            explode(" / ", explode("<br>", $crawler->filter('p.character-block__name')->html())[1])[1] : "";

        $character->gender = $character->gender == "♀" ? 2 : 1;

        $character->level = $crawler->filter('div.character__class__data')->count() ?
            intval(explode(" ", $crawler->filter('div.character__class__data')->text())[1]) : "";

        $character->server = $crawler->filter('p.frame__chara__world')->count() ?
            explode(" ", str_replace("\xc2\xa0", ' ', $crawler->filter('p.frame__chara__world')->text()))[0] : "";

        $character->datacenter = $crawler->filter('p.frame__chara__world')->count() ?
            substr(explode("(", $crawler->filter('p.frame__chara__world')->text())[1], 0, -1) : "";

        // FC
        $character->fc = $crawler->filter('div.character__freecompany__name h4')->count() ? $crawler->filter('div.character__freecompany__name h4')->text() : "";

        if( $character->fc ) {
            $fc_url = $crawler->filter('div.character__freecompany__name a')->count() ? $crawler->filter('div.character__freecompany__name a')->attr("href") : "";
            if( $fc_url ) {
                $fc_crawler = $client->request("GET", $base_url . $fc_url);
                $character->fc_tag = $fc_crawler->filter('p.freecompany__text__tag')->count() ?
                    str_replace(["«", "»"], "", $fc_crawler->filter('p.freecompany__text__tag')->text()) : "";
            }
        }

        // Job - Can get active Job via JP site as it's ONLY listed together with the level over there
        if( $locale != "jp" ) {
            $jp_crawler = $client->request("GET", "https://jp.finalfantasyxiv.com/lodestone/character/" . $lodestone_id);
            $character->job = $jp_crawler->filter('div.character__class__data')->count() ?
            explode(" ", $jp_crawler->filter('div.character__class__data')->text())[2] : "";
        }
        else {
            $character->job = $crawler->filter('div.character__class__data')->count() ?
            explode(" ", $crawler->filter('div.character__class__data')->text())[2] : "";
        }

        $job_mappings = collect(App\Models\Character::get_job_mappings());

        if( $job_mappings->where("jp", $character->job)->first() ) {
            $character->job = $job_mappings->where("jp", $character->job)->first()['en'];
        }

        // Minions
        $minion_crawler = $client->request("GET", $base_url . "/lodestone/character/" . $lodestone_id . "/minion");
        $character->minions = $minion_crawler->filter("p.minion__sort__total span")->count() ? intval($minion_crawler->filter("p.minion__sort__total span")->text()) : 0;

        // Mounts
        $mount_crawler = $client->request("GET", $base_url . "/lodestone/character/" . $lodestone_id . "/mount");
        $character->mounts = $mount_crawler->filter("p.minion__sort__total span")->count() ? intval($mount_crawler->filter("p.minion__sort__total span")->text()) : 0;

        // Portrait
        $character->portrait = $crawler->filter('div.character__detail__image a')->count() ? $crawler->filter('div.character__detail__image a')->attr("href") : "";

        // Avatar - Char Face
        $character->avatar = $crawler->filter('div.frame__chara__face img')->count() ? $crawler->filter('div.frame__chara__face img')->attr("src") : "";

        // Job Levels
        $job_crawler = $client->request("GET", $base_url . "/lodestone/character/" . $lodestone_id . "/class_job");
        $jobs = [];

        foreach($job_mappings as $job) {

            $job['level'] = 0;
            $interested_job = $job[$locale];

            $interested_job_crawler = $job_crawler->filter("div.character__job__name")->reduce(function($node, $i) use ($interested_job) {
                return $node->text() == $interested_job;
            });

            if( $interested_job_crawler->count() ) {
                $lvl_val = $interested_job_crawler->siblings()->filter("div.character__job__level")->text();
                $job['level'] = $lvl_val > 0 ? intval($lvl_val) : 0;
            }

            $jobs[] = $job;
        }

        $character->jobs = $jobs;

        return response()->json($character);
    }
}