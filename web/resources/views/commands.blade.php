@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  Commands
</h1>

<div>
  <p>Most commands have alternate aliases or shortforms.</p>
  <p>Do note after 1st September 2022, it's mandatory to @mention Kweh for all commands instead of using prefixes.</p>
</div>

@php
  $i = 1;
@endphp

<div class="d-flex align-items-start p-3 command-item">
  <a name="register"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Register</div>
    <div class="command-structure">
      @kweh register server firstname lastname
      <br/>@kweh register lodestone_id
    </div>
    <div class="command-example mt-3">
      e.g. @kweh register tonberry boki toki
      <br/>e.g. @kweh register 40945
    </div>

    <div class="mt-3 command-description">
      <p>Links your Discord account to a Final Fantasy Lodestone profile so if you do a <span class="command">@kweh me</span> <span class="command">@kweh profile</span> <span class="command">@kweh glam</span> or <span class="command">@kweh fflogs</span> command, it'll display your profile, glams or fflogs without needing to enter your server, firstname and lastname in future.</p>
      <p>There are very rare cases where characters being retrieved may not be the correct one due to multiple characters sharing the same name on a server. You can use the alternate command to register by providing your lodestone id which is the long string of numbers at the end of your lodestone profile's url. <br/><br/>e.g. <span class="text-break">https://na.finalfantasyxiv.com/lodestone/character/<b>40945</b></span> ← 40945 is my lodestone id</p>
    </div>
    <div class="mt-3 command-alias">Alias: iam</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="me"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Me</div>
    <div class="command-structure">!me</div>

    <div class="mt-3 command-description">
      <p>View your Lodestone profile after you've linked your account with <span class="command">@kweh register</span>.</p>
      <p>Generated profile images are cached for 1 hour.</p>
    </div>
    <div class="mt-3 command-alias">Alias: whoami</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="profile"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Profile</div>
    <div class="command-structure">@kweh profile</div>
    <div class="command-structure">@kweh profile @User</div>
    <div class="command-structure">@kweh profile server firstname lastname</div>
    <div class="command-example mt-3">e.g. @kweh profile tonberry boki toki</div>

    <div class="mt-3 command-description">View someone's Lodestone profile or yours if no user is specified.</div>
    <div class="mt-3 command-alias">Alias: whois</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="glam"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Glamour</div>
    <div class="command-structure">@kweh glam</div>
    <div class="command-structure">@kweh glam @User</div>
    <div class="command-structure">@kweh glam server firstname lastname</div>
    <div class="command-example mt-3">e.g. @kweh glam tonberry boki toki</div>

    <div class="mt-3 command-description">View someone's glamours or yours if no user is specified.</div>
    <div class="mt-3 command-alias">Alias: glamour</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="ec"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Eorzea Collection</div>
    <div class="command-structure">@kweh ec</div>
    <div class="command-structure">@kweh ec latest / loved / male / female</div>
    <div class="command-structure">@kweh ec search search_text</div>
    <div class="command-structure">@kweh ec author author_name</div>
    <div class="command-example mt-3">
      e.g. @kweh ec author valentia
      <br/>e.g. @kweh ec search kweh
    </div>

    <div class="mt-3 command-description">
      <p>Lookup <a href="https://ffxiv.eorzeacollection.com/" target="_blank">Eorzea Collection's</a> glamours.</p>
      <p>Kweh! requires the "Manage Messages" permission to manage the left and right arrow reactions used to navigate through glamour details.</p>
    </div>
    <div class="mt-3 command-alias">Alias: eorzeacollection</div>
  </div>
</div>

@include('adsense.horizontal')

<div class="d-flex align-items-start p-3 command-item">
  <a name="hs"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Housing Snap</div>
    <div class="command-structure">@kweh hs</div>
    <div class="command-structure">@kweh hs search search_text</div>
    <div class="command-example mt-3">
      e.g. @kweh hs mansion
    </div>

    <div class="mt-3 command-description">
      <p>Lookup <a href="https://housingsnap.com/" target="_blank">Housing Snap</a>.</p>
      <p>Kweh! requires the "Manage Messages" permission to manage the left and right arrow reactions used to navigate through housing snap items.</p>
    </div>
    <div class="mt-3 command-alias">Alias: housingsnap</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="fflogs"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">FFLogs</div>
    <div class="command-structure">@kweh fflogs</div>
    <div class="command-structure">@kweh fflogs @User</div>
    <div class="command-structure">@kweh fflogs server firstname lastname</div>
    <div class="command-example mt-3">e.g. @kweh fflogs tonberry yidhra cantarell</div>

    <div class="mt-3 command-description">View someone's FFLogs parses or yours if no user is specified. Percentiles are based on aDPS values from FFLogs.</div>
    <div class="mt-3 command-alias">Aliases: logs, parses</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="marketboard"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Marketboard</div>
    <div class="command-structure">@kweh mb region itemname</div>
    <div class="command-structure">@kweh mb datacenter itemname</div>
    <div class="command-structure">@kweh mb server itemname</div>
    <div class="command-structure">@kweh mb itemname</div>
    <div class="command-example mt-3">e.g. @kweh mb tonberry seeing horde guillotine</div>
    <div class="command-example mt-3">Region options: NA / JP / EU / OC</div>

    <div class="mt-3 command-description">
      <p>Retrieve the latest marketboard prices from <a href="https://universalis.app" target="_blank">Universalis.app</a> for an item for a specific server, all servers in a data center or region.</p>
      <p>If you're registered, you may omit the region, datacenter or server and your character's datacenter will be used automatically.</p>
    </div>
    <div class="mt-3 command-alias">Aliases: market, marketboard</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="item"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Item</div>
    <div class="command-structure">@kweh item itemname</div>
    <div class="command-example mt-3">e.g. @kweh item ethereal silk</div>

    <div class="mt-3 command-description">Look up basic information about an item. If it's a crafted item, the result will list the crafting materials needed. If it is a crafting material, the result will list what can be crafted with it.</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="ffxivcollect"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">FFXIV Collect</div>
    <div class="command-structure">@kweh mount search_string</div>
    <div class="command-structure">@kweh minion search_string</div>
    <div class="command-structure">@kweh title search_string</div>
    <div class="command-structure">@kweh emote search_string</div>
    <div class="command-structure">@kweh barding search_string</div>

    <div class="command-example mt-3">e.g. @kweh mount ozma</div>

    <div class="mt-3 command-description">Look up detailed information for mounts, minions, titles, emotes and bardings from FFXIV Collect.</div>
  </div>
</div>

@include('adsense.horizontal')

<div class="d-flex align-items-start p-3 command-item">
  <a name="timers"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Timers</div>
    <div class="command-structure">@kweh timers</div>

    <div class="mt-3 command-description">Display current Eorzea time, time till next daily reset, time till next weekly reset and time till next server maintenance.</div>
    <div class="mt-3 command-alias">Aliases: timer, reset</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="maintenance"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Maintenance</div>
    <div class="command-structure">@kweh maint</div>

    <div class="mt-3 command-description">Display next server maintenance's information.</div>
    <div class="mt-3 command-alias">Aliases: maintenance</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="tt"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Triple Triad</div>
    <div class="command-structure">@kweh tt</div>
    <div class="command-structure">@kweh tt @User</div>

    <div class="mt-3 command-description">View someone's Triple Triad collection status or yours if no user is specified. This command requires prior registration at <a href="https://triad.raelys.com" target="_blank">https://triad.raelys.com</a>.</div>
    <div class="mt-3 command-alias">Aliases: cards, ttcollection</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="news"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Lodestone News</div>
    <div class="command-structure">@kweh news add</div>
    <div class="command-structure">@kweh news add na / eu / jp / de / fr</div>
    <div class="command-structure">@kweh news remove</div>

    <div class="mt-3 command-description">
      <p>Subscribe to Lodestone news in the channel where the command is issued.</p>
      <p>NA region's lodestone news are fetched by default. You can specify a region by adding na, eu, jp, de or fr after the word add in the command.</p>
      <p>If Kweh! loses access to the channel or don't have the required permission to post to the channel, it'll be unsubscribed automatically.</p>
    </div>
    <div class="mt-3 command-alias">Alias: lodestone</div>
    <div class="mt-3 admin-note text-danger">Admin allowed only command</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="fashion"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Fashion Report</div>
    <div class="command-structure">@kweh fashion add</div>
    <div class="command-structure">@kweh fashion remove</div>
    <div class="command-structure">@kweh fashion</div>

    <div class="mt-3 command-description">
      <p>Subscribe to fashion report results in the channel where the command is issued. Fashion report results are provided by <a href="https://twitter.com/KaiyokoStar" target="_blank">Miss Kaiyoko Star</a>.</p>
      <p>If Kweh! loses access to the channel or don't have the required permission to post to the channel, it'll be unsubscribed automatically.</p>
      <p>View the latest fashion report with <span class="command">@kweh fashion</span>.</p>
    </div>
    <div class="mt-3 command-alias">Alias: fr</div>
    <div class="mt-3 admin-note text-danger">Admin allowed only command for channel subscription</div>
  </div>
</div>

@include('adsense.horizontal')

<div class="d-flex align-items-start p-3 command-item">
  <a name="language"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Language</div>
    <div class="command-structure">@kweh language en / jp / de / fr</div>

    <div class="command-example mt-3">e.g. @kweh language jp</div>

    <div class="mt-3 command-description">
      <p>Set the server's default language to English (en), Japanese (jp), German (de) or French (fr). This only affects the item and profile lookup commands (for now).</p>
      <!--p><span class="command">!kweh</span> is included in the command to prevent it from triggering other bots' commands.</p-->
    </div>
    <div class="mt-3 admin-note text-danger">Admin allowed only command</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="default-channel"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Default Channel</div>
    <div class="command-structure">@kweh channel #your-channel-name</div>
    <div class="command-structure">@kweh channel remove</div>


    <div class="command-example mt-3">e.g. @kweh channel #kweh-bot-spam</div>

    <div class="mt-3 command-description">
      <p>Specify a channel for bot responses to be posted to. Channel name has to be a blue Discord clickable channel link.</p>
      <p>Ensure Kweh! has the permissions required to post to the specified channel.</p>
      <p>This does not affect fashion report and news channels.</p>
      <!--p><span class="command">!kweh</span> is included in the command to prevent it from triggering other bots' commands.</p-->
    </div>
    <div class="mt-3 admin-note text-danger">Admin allowed only command</div>
  </div>
</div>

<div class="d-flex align-items-start p-3 command-item">
  <a name="auto-delete"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Auto Delete</div>
    <div class="command-structure">@kweh autodelete on</div>
    <div class="command-structure">@kweh autodelete off</div>

    <div class="mt-3 command-description">
      <p>Automatically delete user issued commands once they've been processed.</p>
      <p>Ensure Kweh! has the "Manage Messages" permission required to delete messages.</p>
      <!--p><span class="command">!kweh</span> is included in the command to prevent it from triggering other bots' commands.</p-->
    </div>
    <div class="mt-3 admin-note text-danger">Admin allowed only command</div>
  </div>
</div>

<!--div class="d-flex align-items-start p-3 command-item">
  <a name="prefix"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Prefix</div>
    <div class="command-structure">!kweh prefix your_prefix</div>

    <div class="command-example mt-3">e.g. !kweh prefix ?</div>

    <div class="mt-3 command-description">
      <p>Set the server's default prefix from exclaimation point to something else. Only 1 character is allowed.</p>
      <p><span class="command">!kweh</span> is included in the command to prevent it from triggering other bots' commands.</p>
    </div>
    <div class="mt-3 admin-note text-danger">Admin allowed only command</div>
  </div>
</div-->

<div class="d-flex align-items-start p-3 command-item">
  <a name="help"></a>
  <div class="text-center command-no">{{ $i++ }}</div>
  <div class="command-content ml-3 mb-2">
    <div class="bot-command">Help</div>
    <div class="command-structure">@kweh help</div>

    <div class="mt-3 command-description">Kweh! will DM you the command list in Discord.</div>
  </div>
</div>

@include('adsense.horizontal')

@endsection
