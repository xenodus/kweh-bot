<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsSubscription extends Model
{
  protected $table = 'news_subscription';
  protected $primaryKey = 'id';
  public $timestamps = false;
}