<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
  protected $table = 'events';
  protected $primaryKey = 'id';
  public $timestamps = false;
}