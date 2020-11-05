@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  Contact
</h1>

<div>
  <p><strong>Kweh!</strong> is built and maintained by <a href="https://na.finalfantasyxiv.com/lodestone/character/40945/" target="_blank">Boki Toki of Tonberry</a>. He can usually be found afking at the marketboard right outside his FC house at Plot 54, 23rd Ward of Shirogane.</p>
  <p>
    For any suggestions, bug reports or feedback, drop a message over at the <a href="https://discord.gg/epaBYeW" target="_blank">Kweh! Discord server</a>. Alternatively, you can also get in touch via email at <a href="mailto:{{env('CONTACT_EMAIL')}}" target="_blank">{{env('CONTACT_EMAIL')}}</a> or submit them <a href="https://github.com/xenodus/kweh-bot-support/issues" target="_blank">here (GitHub)</a>.
  </p>
  <p>Do note Boki Toki is only capable of understanding English. Communications received in other languages will be google translated.</p>
  <p>╰(*´︶`*)╯♡ <em>Kweeeeeh!</em></p>
</div>
@endsection
