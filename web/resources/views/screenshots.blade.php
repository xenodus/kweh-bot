@extends('layouts.template')

@section('body')
<h1 class="page-header mb-4">
  Screenshots
</h1>

<div class="d-block d-md-flex align-items-stretch">
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Character Profile</div>
      <a href="/images/screenshots/profile.png" data-lightbox="screenshots" data-title="Character Profile">
        <img src="/images/screenshots/profile.png" class="screenshot-tn" alt="Character Profile"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!me</em>
      </div>
    </div>
  </div>
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Glamour Report</div>
      <a href="/images/screenshots/glamour.png" data-lightbox="screenshots" data-title="Glamour Report">
        <img src="/images/screenshots/glamour.png" class="screenshot-tn" alt="Glamour Report"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!glam</em>
      </div>
    </div>
  </div>
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Eorzea Collection</div>
      <a href="/images/screenshots/ec_search.png" data-lightbox="screenshots" data-title="Eorzea Collection">
        <img src="/images/screenshots/ec_search.png" class="screenshot-tn" alt="Eorzea Collection"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!ec</em>
      </div>
    </div>
  </div>
</div>

<div class="d-block d-md-flex align-items-stretch">
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Marketboard Price Check</div>
      <a href="/images/screenshots/marketboard.png" data-lightbox="screenshots" data-title="Marketboard Price Check">
        <img src="/images/screenshots/marketboard.png" class="screenshot-tn" alt="Marketboard Price Check"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!mb</em>
      </div>
    </div>
  </div>
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Item Info</div>
      <a href="/images/screenshots/item.png" data-lightbox="screenshots" data-title="Item Info">
        <img src="/images/screenshots/item.png" class="screenshot-tn" alt="Item Info"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!item</em>
      </div>
    </div>
  </div>
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">FFLogs</div>
      <a href="/images/screenshots/fflogs.png" data-lightbox="screenshots" data-title="FFLogs">
        <img src="/images/screenshots/fflogs.png" class="screenshot-tn" alt="FFLogs"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!fflogs</em>
      </div>
    </div>
  </div>
</div>

<div class="d-block d-md-flex align-items-stretch">
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Lodestone News</div>
      <a href="/images/screenshots/news.png" data-lightbox="screenshots" data-title="Lodestone News">
        <img src="/images/screenshots/news.png" class="screenshot-tn" alt="Lodestone News"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!news</em>
      </div>
    </div>
  </div>
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Fashion Report</div>
      <a href="/images/screenshots/fashion.png" data-lightbox="screenshots" data-title="Fashion Report">
        <img src="/images/screenshots/fashion.png" class="screenshot-tn" alt="Fashion Report"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!fashion</em>
      </div>
    </div>
  </div>
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Maintenance Info</div>
      <a href="https://i.imgur.com/o9vSDSP.png" data-lightbox="screenshots" data-title="Maintenance">
        <img src="https://i.imgur.com/o9vSDSP.png" class="screenshot-tn" alt="Maintenance"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!maint</em>
      </div>
    </div>
  </div>
</div>

<div class="d-block d-md-flex align-items-stretch">
  <div class="screenshot-item">
    <div>
      <div class="screenshot-name">Timers</div>
      <a href="https://i.imgur.com/brH05Gg.png" data-lightbox="screenshots" data-title="Timers">
        <img src="https://i.imgur.com/brH05Gg.png" class="screenshot-tn" alt="Timers"/>
      </a>
      <div class="screenshot-command-example mt-2">
        <em>!timers</em>
      </div>
    </div>
  </div>
</div>

<style>
  .screenshot-item {
    text-align: center;
    padding: 15px 15px 10px 15px;
    position: relative;
    width: 33.333%;
  }
  .screenshot-tn {
    border: 1px solid #fff;
    width: 100%;
  }
  .screenshot-name {
    margin-bottom: 5px;
    font-weight: bold;
  }
/* Small devices (landscape phones, less than 768px) */
@media (max-width: 767.98px) {
  .screenshot-item {
    width: 100%;
  }
}
</style>
@endsection
