<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FRSubscription extends Model
{
  protected $table = 'fashion_report_subscription';
  protected $primaryKey = 'id';
  public $timestamps = false;
}