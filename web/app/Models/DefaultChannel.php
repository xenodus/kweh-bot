<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DefaultChannel extends Model
{
  protected $table = 'server_default_channel';
  protected $primaryKey = 'id';
  public $timestamps = false;
}