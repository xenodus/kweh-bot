<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App;
use Goutte;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ServerSettingsController extends Controller
{
    public function profile(Request $request)
    {
        $data['site_title'] = 'Profile | '.env('SITE_NAME');
        $data['active_page'] = 'profile';
        $data['character'] = App\Models\User::where('user_id', $request->authUser->discord_id)->first();

        return view('server_settings.profile', $data);
    }

    public function set_server_settings(Request $request, $server_id)
    {
        $validatedData = $request->validate([
            'server_prefix' => 'required|max:1',
            'server_language' => 'required',
            'server_news_channel' => 'nullable',
            'server_news_locale' => 'required',
            'server_fr_channel' => 'nullable',
            'server_auto_delete' => 'required|max:1',
            'server_default_channel' => 'nullable',
        ]);

        if( $request->authUser && $request->authUser->ownsServer($server_id) ) {

            $server = App\Models\Server::where('server_id', $server_id)->first();
            $server->prefix = $validatedData['server_prefix'];
            $server->language = $validatedData['server_language'];
            $server->auto_delete = $validatedData['server_auto_delete'];
            $server->save();

            $news_subscription = $server->news_subscription;
            $fr_subscription = $server->fr_subscription;
            $default_channel = $server->default_channel;

            // News Subscription
            if( $news_subscription ) {
                if( $validatedData['server_news_channel'] == null ) {
                    $news_subscription->delete();
                }
                else {
                    $news_subscription->locale = $validatedData['server_news_locale'];
                    $news_subscription->channel_id = $validatedData['server_news_channel'];
                    $news_subscription->updated_by_user_id = $request->authUser->discord_id;
                    $news_subscription->last_updated = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $news_subscription->save();
                }
            }
            else {
                // New Record
                if( isset($validatedData['server_news_channel']) ) {
                    $news_subscription = new App\Models\NewsSubscription();
                    $news_subscription->server_id = $server_id;
                    $news_subscription->channel_id = $validatedData['server_news_channel'];
                    $news_subscription->channel_name = '';
                    $news_subscription->locale = $validatedData['server_news_locale'];
                    $news_subscription->updated_by_user_id = $request->authUser->discord_id;
                    $news_subscription->date_added = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $news_subscription->last_updated = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $news_subscription->save();
                }
            }

            // FR Subscription
            if( $fr_subscription ) {
                if( $validatedData['server_fr_channel'] == null ) {
                    $fr_subscription->delete();
                }
                else {
                    $fr_subscription->channel_id = $validatedData['server_fr_channel'];
                    $fr_subscription->last_updated = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $fr_subscription->save();
                }
            }
            else {
                // New Record
                if( isset($validatedData['server_fr_channel']) ) {
                    $fr_subscription = new App\Models\FRSubscription();
                    $fr_subscription->server_id = $server_id;
                    $fr_subscription->channel_id = $validatedData['server_fr_channel'];
                    $fr_subscription->channel_name = '';
                    $fr_subscription->updated_by_user_id = $request->authUser->discord_id;
                    $fr_subscription->date_added = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $fr_subscription->last_updated = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $fr_subscription->save();
                }
            }

            // Default Channel
            if( $default_channel ) {
                if( $validatedData['server_default_channel'] == null ) {
                    $default_channel->delete();
                }
                else {
                    $default_channel->channel_id = $validatedData['server_default_channel'];
                    $default_channel->save();
                }
            }
            else {
                // New Record
                if( isset($validatedData['server_default_channel']) ) {
                    $default_channel = new App\Models\DefaultChannel();
                    $default_channel->server_id = $server_id;
                    $default_channel->channel_id = $validatedData['server_default_channel'];
                    $default_channel->date_added = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
                    $default_channel->save();
                }
            }
        }

        return redirect()->route('user_server_settings', [$server_id])->with('status', 'Server settings saved!');
    }

    public function get_server_settings(Request $request)
    {
        $data = [];

        $server_id = $request->input('server_id');
        $discord_id = $request->input('uuid');
        $token = $request->input('token');

        $request->authUser = App\Models\DiscordUserOauth::where('discord_id', $discord_id )->where('token', $token)->first();

        if( $request->authUser && $request->authUser->ownsServer($server_id) ) {
            $data['server'] = App\Models\Server::where('server_id', $server_id)->first();
            $data['serverSettings'] = $data['server']->getServerSettings();
            $data['channels'] = $request->authUser->getChannels($data['server']->server_id);
        }

        return response()->json($data);
    }

    public function server_settings(Request $request, $server_id)
    {
        $data['site_title'] = 'Server Settings | '.env('SITE_NAME');
        $data['active_page'] = 'server_settings';

        $data['user'] = $request->authUser;
        $data['servers'] = $request->authUser->getServers(true);
        $data['server_id'] = $server_id;

        return view('server_settings.settings', $data);
    }

    public function servers(Request $request)
    {
        $data['site_title'] = 'Servers | '.env('SITE_NAME');
        $data['active_page'] = 'servers';
        $data['servers'] = $request->authUser->getServers(true);

        return view('server_settings.servers', $data);
    }

    public function logout(Request $request)
    {
        $request->session()->flush();

        return redirect()->route('home');
    }

    public function login(Request $request)
    {
        $auth_user_id = session('auth_user_id');
        $auth_expiry = session('auth_user_expiry');

        if( $auth_user_id && $auth_expiry ) {
            $token_expiry = Carbon::parse($auth_expiry, 'Asia/Singapore');
            $now = Carbon::now()->timezone('Asia/Singapore');

            if( $token_expiry->greaterThan($now) ) {
                return redirect()->route('user_server_listings');
            }
            else {
                $request->session()->flush();
            }
        }

        return Socialite::driver('discord')->setScopes(['identify', 'guilds'])->redirect();
    }

    public function process_login_discord(Request $request)
    {
        $oauth_user = Socialite::driver('discord')->user();

        if( $oauth_user ) {

            $discord_user = App\Models\DiscordUserOauth::where('discord_id', $oauth_user->id)->first();

            // New User
            if( !$discord_user ) {
                $discord_user = new App\Models\DiscordUserOauth;
                $discord_user->discord_id = $oauth_user->id;
                $discord_user->date_added = Carbon::now()->format('Y-m-d H:i:s');
            }

            $discord_user->token = $oauth_user->token;
            $discord_user->refresh_token = $oauth_user->refreshToken;
            $discord_user->nickname = $oauth_user->nickname;
            $discord_user->name = $oauth_user->name;
            $discord_user->avatar = $oauth_user->avatar;
            $discord_user->last_updated = Carbon::now()->timezone('Asia/Singapore')->format('Y-m-d H:i:s');
            $discord_user->token_expiry = Carbon::now()->timezone('Asia/Singapore')->addSeconds($oauth_user->expiresIn)->format('Y-m-d H:i:s');
            $discord_user->save();

            session(['auth_user_id' => $oauth_user->id]);
            session(['auth_user_expiry' => $discord_user->token_expiry]);

            return redirect()->route('user_server_listings');
        }

        return redirect()->route('home');
    }
}