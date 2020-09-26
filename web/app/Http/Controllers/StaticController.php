<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StaticController extends Controller
{
    public function home()
    {
        $data['site_title'] = env('SITE_NAME');
        $data['active_page'] = 'home';

        return view('home', $data);
    }

    public function support()
    {
        $data['site_title'] = env('SITE_NAME');
        $data['active_page'] = 'support';

        $data['site_description'] = 'Support Kweh! by being a Patron.';
        $data['og_description'] = $data['site_description'];

        return view('support', $data);
    }

    public function commands()
    {
        $data['site_title'] = 'Commands | '.env('SITE_NAME');
        $data['active_page'] = 'commands';

        $data['site_description'] = 'View all the commands available for Kweh! Kweh! is a Final Fantasy 14 (FFXIV) Discord Bot that allows you to view character profiles, list character glamours, look up ingame items, recipes, marketboard prices, receive lodestone news and fashion report results.';
        $data['og_description'] = $data['site_description'];

        return view('commands', $data);
    }

    public function screenshots()
    {
        $data['site_title'] = 'Screenshots | '.env('SITE_NAME');
        $data['active_page'] = 'screenshots';

        $data['site_description'] = 'View screenshots of Kweh! in action. Kweh! is a Final Fantasy 14 (FFXIV) Discord Bot that allows you to view character profiles, list character glamours, look up ingame items, recipes, marketboard prices, receive lodestone news and fashion report results.';
        $data['og_description'] = $data['site_description'];

        return view('screenshots', $data);
    }

    public function contact()
    {
        $data['site_title'] = 'Contact | '.env('SITE_NAME');
        $data['active_page'] = 'contact';

        $data['site_description'] = 'How to get in touch (contact) with Boki Toki, the creator of Kweh! Discord Bot. Kweh! is a Final Fantasy 14 (FFXIV) Discord Bot that allows you to view character profiles, list character glamours, look up ingame items, recipes, marketboard prices, receive lodestone news and fashion report results.';
        $data['og_description'] = $data['site_description'];

        return view('contact', $data);
    }

    public function credits()
    {
        $data['site_title'] = 'Credits | '.env('SITE_NAME');
        $data['active_page'] = 'credits';

        $data['site_description'] = 'Community APIs and other contributions that powers Kweh! Discord Bot. Kweh! is a Final Fantasy 14 (FFXIV) Discord Bot that allows you to view character profiles, list character glamours, look up ingame items, recipes, marketboard prices, receive lodestone news and fashion report results.';
        $data['og_description'] = $data['site_description'];

        return view('credits', $data);
    }

    public function privacy()
    {
        $data['site_title'] = 'Privacy Policy | '.env('SITE_NAME');
        $data['active_page'] = 'privacy';

        return view('privacy', $data);
    }

    public function faqs()
    {
        $data['site_title'] = 'Frequently Asked Questions (FAQs) | '.env('SITE_NAME');
        $data['active_page'] = 'faqs';

        $data['site_description'] = 'Having a problem? It might be covered under these frequently asked questions. Kweh! is a Final Fantasy 14 (FFXIV) Discord Bot that allows you to view character profiles, list character glamours, look up ingame items, recipes, marketboard prices, receive lodestone news and fashion report results.';
        $data['og_description'] = $data['site_description'];

        return view('faqs', $data);
    }
}