<?php
namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App;
use DB;
use Cache;

class StatsController extends Controller
{
    public function test() {
        dd("hello");
    }

    public function printStats() {

        $data['site_title'] = 'Stats | '.env('SITE_NAME');
        $data['active_page'] = 'stats';

        $data['site_description'] = 'Bot statistics on registered Discord servers, users, settings and commands issued.';
        $data['og_description'] = $data['site_description'];

        return view('stats', $data);
    }

    public function getStats() {

        $cache_time_seconds = 60*15;
        $data = [];

        $data = Cache::remember('kweh_stats', $cache_time_seconds, function() use(&$data){
            // Servers
            $data['server_count'] = App\Models\Server::count();

            // Users
            $data['user_count'] = App\Models\User::count();

            // Prefix
            $data['prefix_breakdown'] = DB::table('servers')
                ->select('prefix', DB::raw('count(*) as no'))
                ->where('prefix', '!=', '')
                ->groupBy('prefix')
                ->orderBy('no', 'desc')
                ->get();

            // Servers By Date
            $data['servers_by_date'] = DB::table('servers')
                     ->select(DB::raw('DATE_FORMAT(date_added,"%m-%Y") as month_year, count(*) as no'))
                     ->groupBy('month_year')
                     ->orderBy('month_year', 'ASC')
                     ->get();

            // Commands
            $data['register_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 8) LIKE 'register' OR SUBSTRING(command, 2, 3) LIKE 'iam'" )->count();

            $data['me_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 2) LIKE 'me' OR SUBSTRING(command, 2, 6) LIKE 'whoami'" )->count();

            $data['profile_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 7) LIKE 'profile' OR SUBSTRING(command, 2, 5) LIKE 'whois'" )->count();

            $data['glam_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 4) LIKE 'glam' OR SUBSTRING(command, 2, 7) LIKE 'glamour'" )->count();

            $data['ec_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 2) LIKE 'ec' OR SUBSTRING(command, 2, 16) LIKE 'eorzeacollection'" )->count();

            $data['fflogs_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 6) LIKE 'fflogs' OR SUBSTRING(command, 2, 4) LIKE 'logs' OR SUBSTRING(command, 2, 6) LIKE 'parses'" )->count();

            $data['mb_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 2) LIKE 'mb' OR SUBSTRING(command, 2, 6) LIKE 'market' OR SUBSTRING(command, 2, 11) LIKE 'marketboard'" )->count();

            $data['item_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 4) LIKE 'item'" )->count();

            $data['tt_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 2) LIKE 'tt' OR SUBSTRING(command, 2, 5) LIKE 'cards' OR SUBSTRING(command, 2, 12) LIKE 'ttcollection'" )->count();

            $data['news_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 4) LIKE 'news' OR SUBSTRING(command, 2, 9) LIKE 'lodestone'" )->count();

            $data['fr_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 2) LIKE 'fr' OR SUBSTRING(command, 2, 7) LIKE 'fashion'" )->count();

            $data['timers_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 6) LIKE 'timers' OR SUBSTRING(command, 2, 5) LIKE 'timer' OR SUBSTRING(command, 2, 5) LIKE 'reset'" )->count();

            $data['maint_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 5) LIKE 'maint'" )->count();

            $data['donate_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 6) LIKE 'donate'" )->count();

            $data['language_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 13) LIKE 'kweh language'" )->count();

            $data['channel_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 12) LIKE 'kweh channel'" )->count();

            $data['autodelete_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 15) LIKE 'kweh autodelete'" )->count();

            $data['prefix_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 11) LIKE 'kweh prefix'" )->count();

            $data['help_command_count'] = App\Models\CommandLog::whereRaw( "SUBSTRING(command, 2, 4) LIKE 'help'" )->count();

            $data['commands_sum'] =
                $data['register_command_count'] +
                $data['me_command_count'] +
                $data['profile_command_count'] +
                $data['glam_command_count'] +
                $data['ec_command_count'] +
                $data['fflogs_command_count'] +
                $data['mb_command_count'] +
                $data['item_command_count'] +
                $data['tt_command_count'] +
                $data['news_command_count'] +
                $data['fr_command_count'] +
                $data['timers_command_count'] +
                $data['maint_command_count'] +
                $data['donate_command_count'] +
                $data['language_command_count'] +
                $data['channel_command_count'] +
                $data['autodelete_command_count'] +
                $data['prefix_command_count'] +
                $data['help_command_count'];

            return $data;
        });

        return response()->json($data);
    }
}