<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class Server extends Model
{
  protected $table = 'servers';
  protected $primaryKey = 'id';
  public $timestamps = false;

  public function news_subscription()
  {
      return $this->hasOne('App\Models\NewsSubscription', 'server_id', 'server_id');
  }

  public function fr_subscription()
  {
      return $this->hasOne('App\Models\FRSubscription', 'server_id', 'server_id');
  }

  public function default_channel()
  {
      return $this->hasOne('App\Models\DefaultChannel', 'server_id', 'server_id');
  }

  public function getServerSettings()
  {
    $settings = DB::table('servers')
      ->leftJoin('news_subscription', 'servers.server_id', '=', 'news_subscription.server_id')
      ->leftJoin('fashion_report_subscription', 'servers.server_id', '=', 'fashion_report_subscription.server_id')
      ->leftJoin('server_default_channel', 'servers.server_id', '=', 'server_default_channel.server_id')
      ->select(
        'servers.server_id',  'servers.prefix', 'servers.language', 'servers.auto_delete',
        'news_subscription.channel_id as news_channel_id', 'news_subscription.locale as news_channel_locale',
        'fashion_report_subscription.channel_id as fr_channel_id',
        'server_default_channel.channel_id as default_reply_channel_id'
      )
      ->where('servers.server_id', $this->server_id)
      ->first();

      // Default Lodestone news locale base on server language
      if( !$settings->news_channel_id ) {
        switch($settings->language) {
          case "fr":
            $settings->news_channel_locale = "fr";
            break;
          case "de":
            $settings->news_channel_locale = "de";
            break;
          case "jp":
            $settings->news_channel_locale = "jp";
            break;
          default:
            $settings->news_channel_locale = "na";
        }
      }

    return $settings;
  }
}