<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandLog extends Model
{
    protected $table = 'commands';
    protected $primaryKey = 'id';
    public $timestamps = false;

    public function server()
    {
        return $this->hasOne('App\Models\Server', 'server_id', 'server_id');
    }
}