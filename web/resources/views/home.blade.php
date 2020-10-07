@extends('layouts.template')

@section('body')
<div>
  <p><strong>Kweh!</strong> is yet another Final Fantasy 14 (FFXIV) Discord Bot that fetches data from <a href="https://na.finalfantasyxiv.com/lodestone/" target="_blank">Lodestone</a>, various community APIs and websites.</p>

  <p>Features include:</p>

  <div>
    <ul>
      <li>Lodestone profile with custom generated character card</li>
      <li>Character glamour report</li>
      <li>Lookup <a href="https://ffxiv.eorzeacollection.com/" target="_blank">Eorzea Collection</a> glamours</li>
      <li>Marketboard prices from <a href="https://universalis.app/" target="_blank">Universalis</a></li>
      <li>Integrated with <a href="https://www.fflogs.com/" target="_blank">FFLogs</a></li>
      <li>Item and recipe information from <a href="https://ffxivteamcraft.com/" target="_blank">Teamcraft</a> & <a href="https://xivapi.com/" target="_blank">XIVAPI</a></li>
      <li>Mount, Minion, Barding, Emote and Title information from <a href="https://ffxivcollect.com/" target="_blank">FFXIV Collect</a>
      <li>Triple Triad Tracker from <a href="https://triad.raelys.com/" target="_blank">Raely's Triple Triad Tracker</a></li>
      <li>Lodestone news from <a href="https://github.com/mattantonelli/lodestone/wiki" target="_blank">Raelys' Lodestone API</a></li>
      <li>Fashion report results from <a href="https://twitter.com/KaiyokoStar" target="_blank">Miss Kaiyoko Star</a></li>
    </ul>
  </div>

  <p><strong>Kweh!</strong> provides only FFXIV related functions. Server administration functions are not included so it requires minimal permissions (read/send messages & embed links) to operate. There's full support for English and partial support for French, German and Japanese.</p>

  <p><strong>Kweh!</strong> is Discord verified. To ensure you have the legit <strong>Kweh!</strong> on your server, lookout for the <a href="/images/verified_checkmarks.png" data-lightbox="Verified Kweh!" data-title="Kweh!'s Verified check mark">check mark</a> beside its name.</p>

  <p>You can also find <strong>Kweh!</strong> on <a href="https://top.gg/bot/725551243551834112" target="_blank">top.gg's</a> bot listings.</p>

  <div class="p-3 text-center" style="background: rgba(0,0,0,.5);">
    <p>To invite Kweh! to your server, click on the button below.</p>

    <div class="add-bot-btn text-center">
      <a href="{{env('DISCORD_INVITE_LINK')}}" class="btn" role="button" target="_blank">Add Me To Your Server <i class="fas fa-external-link-alt"></i></a>
      <div class="cursor-hint">
        <img src="/images/ff_cursor_sm.png">
      </div>
    </div>
  </div>
</div>
@endsection