@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  Servers Settings <span id="server_name" v-text="server_name"></span>
</h1>

<div id="settings-err" class="d-none">
  <p>Error: Unable to retrieve server settings</p>
  <p><a href="{{ route('user_server_listings') }}">&laquo; Return to Server Listings</a></p>
</div>

<div id="settings-placeholder" class="d-flex flex-column py-5">
  <div><div class="choco-loader"></div></div>
  <div class="text-center"><strong>Fetching server settings...</strong></div>
</div>

<div id="settings-form" class="d-none">

  @if ($errors->any())
  <div class="alert alert-danger">
    <ul>
      @foreach ($errors->all() as $error)
      <li>{{ $error }}</li>
      @endforeach
    </ul>
  </div>
  @endif

  @if (session('status'))
  <div class="alert alert-success">
    {{ session('status') }}
  </div>
  @endif

  <form method="POST" action="{{ route('set_user_server_settings', [$server_id]) }}">
      @csrf

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_prefix">Prefix</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <input type="text" class="form-control" name="server_prefix" id="server_prefix" value="" maxlength="1" v-model="server_prefix">

        <div class="mt-2 settings-description">
          Set the server's default prefix from exclaimation point to something else. Only 1 character is allowed.
        </div>
      </div>
    </div>

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_language">Language</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <select class="form-control" name="server_language" id="server_language" v-model="server_language_selected">
          <option value="en">English</option>
          <option value="jp">Japanese</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        <div class="mt-2 settings-description">
          Set the server's default language to English, Japanese, German or French. This only affects the item and profile lookup commands (for now).
        </div>
      </div>
    </div>

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_news_channel">Lodestone News Channel</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <select class="form-control" name="server_news_channel" id="server_news_channel" v-model="server_news_channel_selected">
          <option value=""></option>
          <option v-for="channel in server_news_channels" v-bind:value="channel.id" v-text="channel.name"></option>
        </select>

        <div class="mt-2 settings-description">
          Receive Lodestone news in this channel. Ensure Kweh! has access and permission to post to the selected channel.
        </div>
      </div>
    </div>

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_news_locale">Lodestone News Language</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <select class="form-control" name="server_news_locale" id="server_news_locale" v-model="server_news_language_selected">
          <option value="na">English (NA)</option>
          <option value="eu">English (EU)</option>
          <option value="jp">Japanese</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        <div class="mt-2 settings-description">
          Receive Lodestone news in this language.
        </div>
      </div>
    </div>

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_fr_channel">Fashion Report Channel</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <select class="form-control" name="server_fr_channel" id="server_fr_channel" v-model="server_fr_channel_selected">
          <option value=""></option>
          <option v-for="channel in server_fr_channels" v-bind:value="channel.id" v-text="channel.name"></option>
        </select>

        <div class="mt-2 settings-description">
          Receive fashion reports in this channel. Ensure Kweh! has access and permission to post to the selected channel.
        </div>
      </div>
    </div>

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_auto_delete">Auto Delete Commands</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <select class="form-control" name="server_auto_delete" id="server_auto_delete" v-model="server_auto_delete">
          <option value=0>No</option>
          <option value=1>Yes</option>
        </select>

        <div class="mt-2 settings-description">
          Automatically delete user issued commands once they've been processed. Ensure Kweh! has the "Manage Messages" permission required to delete messages.
        </div>
      </div>
    </div>

    <div class="form-row form-group">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <label for="server_default_channel">Default Reply Channel</label>
      </div>
      <div class="col-12 col-lg-8 d-flex flex-column align-items-start">
        <select class="form-control" name="server_default_channel" id="server_default_channel" v-model="server_default_channel_selected">
          <option value=""></option>
          <option v-for="channel in server_default_channels" v-bind:value="channel.id" v-text="channel.name"></option>
        </select>

        <div class="mt-2 settings-description">
          Specify a channel for all bot responses to be posted to. Ensure Kweh! has the permissions required to post to the selected channel.
        </div>
      </div>
    </div>

    <div class="form-group d-flex flex-lg-row flex-column justify-content-lg-between justify-content-center px-3">
      <a class="btn btn-warning order-lg-0 order-1" href="{{ route('user_server_listings') }}" role="button"><strong>⬅  Return to Server Listing</strong></a>
      <button type="submit" class="btn btn-warning order-lg-1 order-0 mb-lg-0 mb-3"><strong>Save Settings ➡</strong></button>
    </div>
  </form>
</div>

<style>
#settings-form label {
  font-weight: bold;
}
.settings-description {
  color: #f4b400;
  font-size: 80%;
}
.form-group {
  padding: 30px 10px;
  border-radius: 5px;
  background: rgba(0,0,0,0.4);
}
.alert ul {
  margin-bottom: 0;
}
</style>
@endsection

@section('footer')
<script>
const app = new Vue({
  el: '#app',
  data: {
    server_name: '',
    server_prefix: '',
    server_language_selected: '',
    server_news_channels: [],
    server_news_channel_selected: '',
    server_news_language_selected: '',
    server_fr_channels: [],
    server_fr_channel_selected: '',
    server_auto_delete: '',
    server_default_channels: [],
    server_default_channel_selected: '',
  }
});

axios.post('/api/serverSettings', {
  'server_id': '<?=$server_id?>',
  'uuid': '<?=$user->discord_id?>',
  'token': '<?=$user->token?>',
})
.then(function(response){

  document.querySelector("#settings-placeholder").classList.remove("d-flex");
  document.querySelector("#settings-placeholder").style.display = 'none';

  if( response.status === 200 && response.data ) {

    let data = response.data;

    document.querySelector("#settings-form").classList.remove("d-none");

    if( data.server ) {
      app.server_name = " ➟ " + data.server.name;
    }

    if( data.serverSettings ) {
      // Prefix
      if( data.serverSettings.prefix ) {
        app.server_prefix = data.serverSettings.prefix;
      }

      // Language
      if( data.serverSettings.language ) {
        app.server_language_selected = data.serverSettings.language;
      }

      // News + FR + Default Channel
      if( data.channels ) {
        // News
        if( data.serverSettings.news_channel_id || data.serverSettings.news_channel_id == null ) {
          app.server_news_channels = data.channels;
          app.server_news_channel_selected = data.serverSettings.news_channel_id;
        }

        // FR
        if( data.serverSettings.fr_channel_id || data.serverSettings.fr_channel_id == null ) {
          app.server_fr_channels = data.channels;
          app.server_fr_channel_selected = data.serverSettings.fr_channel_id;
        }

        // Default Channel
        if( data.serverSettings.default_reply_channel_id || data.serverSettings.default_reply_channel_id == null ) {
          app.server_default_channels = data.channels;
          app.server_default_channel_selected = data.serverSettings.default_reply_channel_id;
        }
      }

      // News Locale
      if( data.serverSettings.news_channel_locale ) {
        app.server_news_language_selected = data.serverSettings.news_channel_locale;
      }

      // Auto delete
      app.server_auto_delete = data.serverSettings.auto_delete;
    }
  }
  else {
    document.querySelector("#settings-err").classList.remove("d-none");
  }
});
</script>
@endsection