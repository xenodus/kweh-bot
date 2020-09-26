@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  Frequently Asked Questions
</h1>

<div class="p-3 pb-0 command-item">
  <!--p><strong>FAQ List</strong></p-->
  <ol class="mb-0">
    <li><a href="#install">How do I invite {{env('APP_NAME')}} to my Discord server?</a></li>
    <li><a href="#language">How do I change the default language?</a></li>
    <li><a href="#profiledifferent">Why is my profile or glamour different from what I'm wearing ingame?</a></li>
    <li><a href="#news">How do I receive Lodestone news notification?</a></li>
    <li><a href="#fashion">How do I receive Fashion Report result notification?</a></li>
    <li><a href="#embedlink">Why can't I see anything after issuing a command?</a></li>
    <li><a href="#support">How do I contribute or support {{ env('APP_NAME') }}?</a></li>
  </ol>
</div>

@php
  $i = 1;
@endphp

<div class="d-flex align-items-start p-3 command-item">
  <a name="install"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. How do I invite {{env('APP_NAME')}} to my Discord server?</div>

    <div class="mt-3 faq-description">
      <p>You'll need administrative permissions to invite {{env('APP_NAME')}} to your Discord server.</p>
      <p><a href="{{env('DISCORD_INVITE_LINK')}}" target="_new">Click here to invite {{env('APP_NAME')}}</a></p>
    </div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="language"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. How do I change the default language?</div>

    <div class="mt-3 faq-description">
      <p>{{env('APP_NAME')}} supports English (en) by default. You have the option to change that to Japanese (jp), French (fr) or German (de).</p>
      <p>Changing the language is done server wide and can only be peformed by an Admin.</p>
      <p>Issue the command <span class="command">!kweh language jp</span> to change the language to Japanese.</p>

      <a href="https://i.imgur.com/ZDVONEW.png" data-lightbox="screenshots-language" data-title="Change Language">
        <img src="https://i.imgur.com/ZDVONEW.png" alt="Change language example" class="img-fluid screenshot mb-3">
      </a>

      <p>Substitute <strong>jp</strong> for <strong>fr</strong>, <strong>de</strong> or <strong>en</strong> for your language of choice.</p>

      <a href="https://i.imgur.com/lCyWss0.png" data-lightbox="screenshots-language" data-title="Profile in Japanese">
        <img src="https://i.imgur.com/lCyWss0.png" alt="Profile in Japanese" class="img-fluid screenshot mb-3">
      </a>

      <p>A character profile in Japanese.</p>
    </div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="profiledifferent"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. Why is my profile or glamour different from what I'm wearing ingame?</div>

    <div class="mt-3 faq-description">
      <p>Your profile and equipped glamours are based on what your character is shown to be equipped on the Official FFXIV's <a href="https://na.finalfantasyxiv.com/lodestone/" target="_blank">Lodestone</a>. Updates on Lodestone are not real time and happens periodically through the day.</p>
    </div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="news"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. How do I receive Lodestone news notification?</div>

    <div class="mt-3 faq-description">
      <p>Issue the command <span class="command">!news add</span> inside a channel to make it receive automated Lodestone news notifications. You'll receive a prompt as shown below asking if you'll like to fetch and display the latest news.</p>
      <p>You can issue the command <span class="command">!news remove</span> inside a channel to make it stop receiving notifications.</p>
      <a href="https://i.imgur.com/LOYIdH1.png" data-lightbox="screenshots-news" data-title="Lodestone News">
        <img src="https://i.imgur.com/LOYIdH1.png" alt="Lodestone news notification example" class="img-fluid screenshot">
      </a>
    </div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="fashion"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. How do I receive Fashion Report result notification?</div>

    <div class="mt-3 faq-description">
      <p>Issue the command <span class="command">!fashion add</span> inside a channel to make it receive automated Fashion Report result notifications. You'll receive a prompt as shown below asking if you'll like to fetch and display the Fashion Report.</p>
      <p>You can issue the command <span class="command">!fashion remove</span> inside a channel to make it stop receiving notifications.</p>
      <a href="https://i.imgur.com/yC2zhDE.png" data-lightbox="screenshots-fashion" data-title="Fashion Report">
        <img src="https://i.imgur.com/yC2zhDE.png" alt="Fashion Report notification example" class="img-fluid screenshot">
      </a>
    </div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="embedlink"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. Why can't I see anything after issuing a command?</div>

    <div class="mt-3 faq-description">
      <p>If nobody is able to see anything, it's likely a permission issue. Verify that Kweh! has the ability to read and send messages in the channel.</p>
      <p>If only certain members are having problems, ensure User Settings > Text & Images > Link Preview is checked in their individual Discord's settings.</p>
    </div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="support"></a>
  <div class="faq-content ml-3 mb-2">
    <div class="faq-header">{{ $i++ }}. How do I contribute or support {{ env('APP_NAME') }}?</div>

    <div class="mt-3 faq-description">
      <p>You can support {{ env('APP_NAME') }} by being a Patron at <a href="{{env('PATREON_LINK')}}" target="_blank">{{env('PATREON_LINK')}}</a>.</p>
      <p>Monies received will be used to fund the domain renewal, server hosting and bandwidth cost.</p>
    </div>
  </div>
</div>
@endsection