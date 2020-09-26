<?php
namespace App\Http\Controllers;

use Spatie\Sitemap\SitemapGenerator;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use Illuminate\Support\Str;

class SitemapController extends Controller
{
    public function crawl()
    {
        SitemapGenerator::create('https://kwehbot.xyz')->writeToFile( public_path().'/sitemap.xml' );

        return response()->json(['status' => 1]);
    }

    public function generate()
    {
      $sitemap = Sitemap::create()
                  ->add(Url::create( str_replace('http://', 'https://', route('home')) ))
                  ->add(Url::create( str_replace('http://', 'https://', route('commands')) ))
                  ->add(Url::create( str_replace('http://', 'https://', route('contact')) ));

      $sitemap->writeToFile( public_path().'/sitemap.xml' );

      return response()->json(['status' => 1]);
    }
}