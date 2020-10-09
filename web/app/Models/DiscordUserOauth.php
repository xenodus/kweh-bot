<?php

namespace App\Models;

use App;
use Illuminate\Database\Eloquent\Model;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Client;
use Cache;

class DiscordUserOauth extends Model
{
  protected $table = 'discord_users_oauth';
  protected $primaryKey = 'id';
  public $timestamps = false;

  const CREATED_AT = 'date_added';
  const UPDATED_AT = 'last_updated';

  public function ownsServer($server_id) {

    $user_servers = $this->getServers(true);

    $user_servers = $user_servers->filter(function($item) use($server_id){
        return $item->id == $server_id;
    });

    if( $user_servers->count() ) {
      return true;
    }

    return false;
  }

  public static function isAdmin($permission) {

    $is_admin = ($permission & 8) == 8;

    return $is_admin;
  }

  public function getChannels($server_id) {

      $valid_channels = [];

      $server = self::getServer($server_id);

      $url =  'https://discord.com/api/guilds/'.$server_id.'/channels';

      $client = new Client(['http_errors' => false]); //GuzzleHttp\Client
      $response = $client->get($url, [
        'headers' => [
          'Authorization' => 'Bot ' . env('DISCORD_BOT_TOKEN')
        ]
      ]);

      if( $response->getStatusCode() == 200 ) {

        $results = collect(json_decode($response->getBody()->getContents()));

        $valid_channels = $results->filter(function($channel){
          return $channel->type == 0;
        })->values()->all();

      }

      return $valid_channels;
  }

  public static function getServer($server_id) {

      $result = [];

      $url =  'https://discord.com/api/guilds/' . $server_id;

      $client = new Client(['http_errors' => false]); //GuzzleHttp\Client
      $response = $client->get($url, [
        'headers' => [
          'Authorization' => 'Bot ' . env('DISCORD_BOT_TOKEN')
        ]
      ]);

      if( $response->getStatusCode() == 200 ) {
        $result = json_decode($response->getBody()->getContents());
      }

      return collect($result);
  }

  public function getServers($isAdmin=false) {

      // Cached for 1 min to prevent hitting request limit
      $cache_time_seconds = 60*1;
      $valid_servers = [];

      $valid_servers = Cache::remember('kweh_user_servers_' . $this->id, $cache_time_seconds, function() use(&$valid_servers, $isAdmin){

        $url =  'https://discord.com/api/users/@me/guilds';

        $client = new Client(['http_errors' => false]); //GuzzleHttp\Client
        $response = $client->get($url, [
          'headers' => [
            'Authorization' => 'Bearer ' . $this->token
          ]
        ]);

        if( $response->getStatusCode() == 200 ) {

          $results = collect(json_decode($response->getBody()->getContents()));

          if( $isAdmin ) {
            $results = $results->filter(function($item){
                return self::isAdmin($item->permissions);
            });
          }

          $result_server_ids = $results->map(function($item){
              return $item->id;
          });

          $valid_server_ids = App\Models\Server::whereIn('server_id', $result_server_ids)->get()->map(function($item){
              return $item->server_id;
          });

          $valid_servers = $results->whereIn('id', $valid_server_ids)->all();
        }

        return $valid_servers;
      });

      return collect($valid_servers);
  }
}