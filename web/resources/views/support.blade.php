@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  Support via Patreon
</h1>

<div>
  <p><strong>Kweh!</strong> is built and maintained by <a href="https://na.finalfantasyxiv.com/lodestone/character/40945/" target="_blank">Boki Toki of Tonberry</a> as a hobby and an excuse to fuel his addiction to Final Fantasy.</p>

  <p>It is free to use for the community and there isn't any plan to monetize or gate features behind a paywall.</p>

  <p>Monetary support via Patreon is entirely optional and will be used to cover the server and bandwidth cost required to keep the bot running 24/7. Excess will be used to upgrade the existing infrastructure that <strong>Kweh!</strong> is on so it can run both more stable and faster.</p>

  <p><small>And, probably on tea to accompany late night programming sessions ☕</small></p>

  <div class="p-3 text-center" style="background: rgba(0,0,0,.5);">
    <div class="add-bot-btn text-center">
      <a href="{{env('PATREON_LINK')}}" class="btn" role="button" target="_blank">Support via Patreon <i class="fas fa-external-link-alt"></i></a>
      <div class="cursor-hint">
        <img src="/images/ff_cursor_sm.png">
      </div>
    </div>
  </div>
</div>
@endsection
