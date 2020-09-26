<?php

namespace App\Http\Middleware;

use Closure;
use Carbon\Carbon;
use App\Models\DiscordUserOauth;

class CheckAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $auth_user_id = session('auth_user_id');
        $auth_expiry = session('auth_user_expiry');

        if( $auth_user_id && $auth_expiry ) {

            $token_expiry = Carbon::parse($auth_expiry, 'Asia/Singapore');
            $now = Carbon::now()->timezone('Asia/Singapore');

            if( $token_expiry->greaterThan($now) ) {

                $request->authUser = DiscordUserOauth::where('discord_id', $auth_user_id )->first();

                return $next($request);
            }
            else {
                $request->session()->flush();
            }
        }

        return redirect()->route('login');
    }
}
