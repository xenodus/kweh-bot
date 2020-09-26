@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  My Servers
</h1>

<div class="mb-3">
  <p>If you've just added <strong>Kweh!</strong> to a server and it's not appearing here, wait for a minute and refresh the page.</p>
</div>

<div class="d-flex justify-content-center flex-wrap">
  @foreach($servers as $server)
  <a href="{{route('user_server_settings', [$server->id])}}" class="servers text-white">
    <div class="p-3 text-center" style="width: 180px;">
      <img src="https://cdn.discordapp.com/icons/{{$server->id}}/{{$server->icon}}.png" class="border-warning border"/>
      <div class="mt-2">
        <div>{{$server->name}}</div>
      </div>
    </div>
  </a>
  @endforeach
</div>

<style>
a.servers {
  font-weight: bold;
}
a.servers:hover {
  text-decoration: none;
}
</style>
@endsection