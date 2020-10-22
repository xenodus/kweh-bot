@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  My Profile
</h1>

<div class="profile-character">
  <div>
    <p>Link your FFXIV character by issuing the command <span class="command">!register server firstname lastname</span> inside a <strong>Kweh!</strong> visible channel.</p>
  </div>
  @if($character)
  <div class="character d-none">
    <div class="d-flex flex-lg-row flex-column">

      <div class="character-avatar border order-2 order-lg-1" style="max-width: 30%;">
        <img :src="character_data.portrait" class="w-100"/>
      </div>

      <div class="d-flex flex-column flex-wrap character-details p-3 border border-left-0 order-1 order-lg-2" style="max-width: 30%;">
        <div class="character-name">
          <div class="character-details-header text-warning">Name</div>
          <div v-text="character_data.name"></div>
        </div>

        <div class="character-server">
          <div class="character-details-header text-warning">Server</div>
          <div v-text="character_data.server"></div>
        </div>

        <div class="character-level-job">
          <div class="character-details-header text-warning">Job</div>
          <div>
            Level <span v-text="character_data.level"></span> <span v-text="character_data.race"></span> <span v-text="character_data.job"></span></div>
          </div>

        <div class="character-fc">
          <div class="character-details-header text-warning">Free Company</div>
          <div><span v-text="character_data.fc"></span> «<span v-text="character_data.fc_tag"></span>»</div>
        </div>

        <div class="character-lodestone-url">
          <div class="character-details-header text-warning">Lodestone</div>
          <div class="text-break">
            <a href="https://na.finalfantasyxiv.com/lodestone/character/{{$character->lodestone_id}}/" target="_blank">https://na.finalfantasyxiv.com/lodestone/character/{{$character->lodestone_id}}/</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  @endif
</div>
@endsection

@section('footer')
<style>
  .character-details {
    background: rgba(0, 0, 0, 0.5);
  }
  .character-details > div {
    margin-bottom: 10px;
    max-width: 100%;
  }
  .character-details-header {
    font-weight: bold;
  }

/* Medium devices (tablets, less than 992px) */
@media (max-width: 991.98px) {
  .character-details,
  .character-avatar {
    width: 100%!important;
    max-width: 100%!important;
  }
  .character-avatar {
    border-top: 0!important;
  }
  .character-details {
    border-left: 1px solid #dee2e6!important;
  }
}
</style>

<script>
const app = new Vue({
  el: '#app',
  data: {
    character: <?=($character?$character->toJson():'{}')?>,
    character_data: {}
  }
});

if( app.character.lodestone_id ) {

  let url = '/api/profile/' + app.character.lodestone_id + '/' + app.character.region;

  axios.get(url).then(function(response){
    console.log(response.data);
    app.character_data = response.data;
    document.querySelector(".character").classList.remove("d-none");
  });
}
</script>
@endsection